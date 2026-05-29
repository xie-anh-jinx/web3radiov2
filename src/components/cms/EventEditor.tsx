
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import FileUpload from './FileUpload';
import RichTextEditor from './RichTextEditor';
import { addEvent, updateEvent } from '@/lib/api';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import { Sparkles, Calendar, MapPin, Tag, Link as LinkIcon, Save, X, Info } from 'lucide-react';

interface EventEditorProps {
  onSave: () => void;
  eventToEdit?: any;
  onCancel?: () => void;
}

const EventEditor: React.FC<EventEditorProps> = ({ onSave, eventToEdit, onCancel }) => {
  const [eventData, setEventData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    image_url: '',
    category: 'event' as 'news' | 'job' | 'event',
    slug: ''
  });

  const [saving, setSaving] = useState(false);
  const [isWriteNFT, setIsWriteNFT] = useState(false);
  const [mintLogs, setMintLogs] = useState<{status: 'pending'|'success'|'error', msg: string}[]>([]);
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');
  const { toast } = useToast();

  useEffect(() => {
    if (eventToEdit) {
      setEventData({
        title: eventToEdit.title || '',
        date: eventToEdit.date || new Date().toISOString().split('T')[0],
        location: eventToEdit.location || '',
        description: eventToEdit.description || '',
        image_url: eventToEdit.image_url || '',
        category: eventToEdit.category || 'event',
        slug: eventToEdit.slug || ''
      });
    }
  }, [eventToEdit]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

  const handleTitleChange = (title: string) => {
    setEventData(prev => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug
    }));
  };

  const addLog = (status: 'pending'|'success'|'error', msg: string) => {
    setMintLogs(prev => [...prev, { status, msg }]);
  };

  const handleSave = async () => {
    if (!eventData.title || !eventData.location || !eventData.description) {
      toast({ title: "Missing fields", description: "Title, location and description are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    setMintLogs([]);
    try {
      let permawebUrl = '';
      let nftMint = '';

      // --- WriteNFT Flow ---
      if (isWriteNFT && address) {
        addLog('pending', 'Uploading content to Arweave via Irys...');
        toast({ title: "WriteNFT", description: "Uploading to Arweave (Permaweb)..." });
        
        // 1. Upload to Arweave via Irys
        const { uploadArticleToPermaweb } = await import('@/lib/permaweb');
        const uploadResult = await uploadArticleToPermaweb(walletProvider, {
          title: eventData.title,
          content: eventData.description,
          author: address,
          category: eventData.category,
          image: eventData.image_url
        });
        permawebUrl = uploadResult.url;
        addLog('success', `Upload successful! Arweave ID: ${uploadResult.id}`);

        addLog('pending', 'Minting NFT on Solana Devnet...');
        toast({ title: "WriteNFT", description: "Minting NFT on Solana..." });

        // 2. Mint NFT via Anchor Program
        const anchor = await import('@coral-xyz/anchor');
        const { Connection, PublicKey, Keypair } = await import('@solana/web3.js');
        const idlModule = await import('@/idl/write_nft.json');
        const idl = idlModule.default || idlModule;

        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const provider = new anchor.AnchorProvider(connection, walletProvider as any, { preflightCommitment: "confirmed" });
        // NOTE: We don't verify the program ID against idl here, we let anchor load it.
        const program = new anchor.Program(idl as any, provider);

        const mintKeypair = Keypair.generate();
        nftMint = mintKeypair.publicKey.toBase58();

        addLog('pending', `Generated new Mint address: ${nftMint}`);

        // Derive Associated Token Account
        const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
        const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const [tokenAccount] = PublicKey.findProgramAddressSync(
          [
            provider.wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        );

        let tx = "";
        try {
          tx = await program.methods
            .mintArticleNft(
              eventData.title,
              "W3RNEWS",
              permawebUrl,
              500 // 5% royalty
            )
            .accounts({
              payer: provider.wallet.publicKey,
              mint: mintKeypair.publicKey,
              tokenAccount: tokenAccount,
            } as any)
            .signers([mintKeypair])
            .rpc();
        } catch (rpcErr: any) {
          if (rpcErr.message && rpcErr.message.includes("This transaction has already been processed")) {
            console.log("Solana RPC retry quirk detected. Transaction already landed successfully!");
            tx = "already_processed_check_explorer";
          } else {
            throw rpcErr;
          }
        }

        addLog('success', `Token Minted! TX: ${tx}`);
        
        // 3. Attach Metaplex Metadata
        try {
          addLog('pending', 'Attaching Metaplex Metadata to make it a true NFT...');
          const umiBundle = await import('@metaplex-foundation/umi-bundle-defaults');
          const umiAdapters = await import('@metaplex-foundation/umi-signer-wallet-adapters');
          const umiCore = await import('@metaplex-foundation/umi');
          const mpl = await import('@metaplex-foundation/mpl-token-metadata');

          const umi = umiBundle.createUmi("https://api.devnet.solana.com")
            .use(umiAdapters.walletAdapterIdentity(walletProvider as any));

          const umiMintPubkey = umiCore.publicKey(mintKeypair.publicKey.toBase58());

          await mpl.createMetadataAccountV3(umi, {
            mint: umiMintPubkey,
            mintAuthority: umi.identity,
            payer: umi.identity,
            updateAuthority: umi.identity,
            data: {
              name: eventData.title.slice(0, 32),
              symbol: "W3RNEWS",
              uri: permawebUrl,
              sellerFeeBasisPoints: 500,
              creators: null,
              collection: null,
              uses: null
            },
            isMutable: true,
            collectionDetails: null
          }).sendAndConfirm(umi);

          addLog('success', 'Metadata attached successfully! NFT is now visible in Wallets.');
        } catch (metaErr: any) {
          console.error("Metadata error:", metaErr);
          addLog('error', `Metadata attachment failed, but token was minted. Error: ${metaErr.message}`);
        }

        console.log("NFT Flow Complete! TX:", tx);
        toast({ title: "NFT Minted!", description: `TX: ${tx.slice(0, 8)}...` });
      }

      addLog('pending', 'Saving article to database...');
      const payload = {
        title: eventData.title,
        date: eventData.date,
        location: eventData.location,
        description: eventData.description,
        image_url: eventData.image_url,
        category: eventData.category,
        slug: eventData.slug || generateSlug(eventData.title),
        permaweb_url: permawebUrl,
        nft_mint: nftMint
      };

      const result = eventToEdit
        ? await updateEvent(eventToEdit.id, payload)
        : await addEvent(payload);

      if (result.error) throw result.error;

      addLog('success', 'Article saved to database!');
      toast({ 
        title: eventToEdit ? "Updated!" : "Published!", 
        description: isWriteNFT ? "Article & NFT created successfully." : "Article created successfully." 
      });

      if (!eventToEdit) {
        setEventData({ title: '', date: new Date().toISOString().split('T')[0], location: '', description: '', image_url: '', category: 'event', slug: '' });
        setIsWriteNFT(false);
      }
      setTimeout(() => {
        onSave();
      }, 2000);
    } catch (error: any) {
      console.error("Save/Mint failed:", error);
      addLog('error', `Error: ${error.message || "Failed to process transaction"}`);
      toast({ title: "Save failed", description: error.message || "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 pl-11 rounded-xl focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1";

  return (
    <div className="bg-[#111111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            {eventToEdit ? 'Edit Article' : 'Create New Article'}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mt-1">Web3Radio Content Management</p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}
            className="rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className={labelClass}>Title</Label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input value={eventData.title} onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="The next big thing in Web3..." className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Category</Label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10 pointer-events-none" />
                  <select value={eventData.category}
                    onChange={(e) => setEventData({ ...eventData, category: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 text-white h-12 pl-11 pr-4 rounded-xl focus:ring-1 focus:ring-white/20 transition-all appearance-none text-sm font-medium">
                    <option value="event" className="bg-[#111111]">Event</option>
                    <option value="news" className="bg-[#111111]">News</option>
                    <option value="job" className="bg-[#111111]">Job</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                  <Input type="date" value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className={inputClass + " [color-scheme:dark]"} />
                </div>
              </div>
            </div>

            {/* WriteNFT Toggle */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                 onClick={() => setIsWriteNFT(!isWriteNFT)}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isWriteNFT ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/20'}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Mint as WriteNFT</h4>
                  <p className="text-[9px] text-white/30 mt-0.5">Permanent on Arweave + Solana NFT</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isWriteNFT ? 'bg-yellow-400' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isWriteNFT ? 'left-7' : 'left-1'}`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Slug (URL Path)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input value={eventData.slug}
                  onChange={(e) => setEventData({ ...eventData, slug: e.target.value })}
                  placeholder="article-slug-here" className={inputClass} />
              </div>
              <p className="text-[9px] text-white/20 px-2 flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                URL: /events/{eventData.slug || 'slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Location / Company</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  placeholder="Online, Jakarta, or Company Name" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Right column – image upload */}
          <div className="space-y-3">
            <Label className={labelClass}>Featured Image</Label>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <FileUpload
                onFileUploaded={(url) => setEventData({ ...eventData, image_url: url })}
                currentImageUrl={eventData.image_url}
              />
            </div>
          </div>
        </div>

        {/* Rich text editor */}
        <div>
          <RichTextEditor
            label="Article Content"
            value={eventData.description}
            onChange={(description) => setEventData({ ...eventData, description })}
            placeholder="Write your amazing story here..."
            rows={14}
          />
        </div>

        {/* Mint Logs / Progress */}
        {mintLogs.length > 0 && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-[10px] sm:text-xs text-white/70 space-y-2 mt-4 max-h-48 overflow-y-auto">
            <h4 className="text-white font-bold uppercase tracking-widest text-[9px] mb-3 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              WriteNFT Deployment Progress
            </h4>
            {mintLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                <span className={`mt-0.5 ${log.status === 'success' ? 'text-green-400' : log.status === 'error' ? 'text-red-400' : 'text-yellow-400 animate-pulse'}`}>
                  {log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : '⟳'}
                </span>
                <span className="break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}
              className="rounded-xl h-12 px-7 text-white/30 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest transition-all">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}
            className="bg-white hover:bg-white/90 text-[#0a0a0a] rounded-xl h-12 px-10 flex items-center gap-2.5 font-bold uppercase text-[10px] tracking-[0.15em] transition-all active:scale-95 shadow-2xl shadow-white/10">
            {saving ? <Sparkles className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : eventToEdit ? 'Update Article' : 'Publish Article'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
