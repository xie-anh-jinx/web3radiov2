import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useNear } from '@/contexts/NearContext';
import {
  Loader2, Sparkles, Wallet, ShieldCheck, ShieldX,
  ChevronRight, AlertTriangle, LogIn
} from "lucide-react";
import logo from '@/assets/web3radio-logo.png';

// ─── Whitelist ───────────────────────────────────────────────
const ALLOWED_ADDRESSES = [
  '9xhz4Cb4C2Z4z9xdD2geCafovNYVngC4E4XpWtQmeEuv', // Solana
  '0x242DfB7849544eE242b2265cA7E585bdec60456B', // EVM Admin
  'kotarominami.near', // Near
];

const isAllowed = (addr: string) => ALLOWED_ADDRESSES.map(a => a.toLowerCase()).includes(addr.toLowerCase());

// ─── Badge helper ────────────────────────────────────────────
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center ${className ?? ''}`}>{children}</div>
);

// ─── Truncate address ────────────────────────────────────────
const truncate = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : '';

// ─── Component ───────────────────────────────────────────────
const PintuMasuk = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { open }   = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { accountId, isConnected: isNearConnected, connect: connectNear } = useNear(); 

  const [checking,  setChecking]  = useState(false);
  const [denied,    setDenied]    = useState(false);
  const [pulse,     setPulse]     = useState(false);

  // ── If already authorised, skip straight to dashboard ──────
  useEffect(() => {
    const saved = localStorage.getItem('web3radio_wallet_auth');
    if (saved && isAllowed(saved)) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // ── React when wallet connects / changes ───────────────────
  useEffect(() => {
    const effectiveAddress = address || accountId;
    const effectiveConnected = isConnected || isNearConnected;

    if (!effectiveConnected || !effectiveAddress) {
      setDenied(false);
      return;
    }

    setChecking(true);
    setPulse(true);

    const timer = setTimeout(() => {
      if (isAllowed(effectiveAddress)) {
        localStorage.setItem('web3radio_wallet_auth', effectiveAddress);
        toast({
          title: '✅ Akses Diberikan',
          description: `Wallet ${truncate(effectiveAddress)} diizinkan masuk.`,
        });
        navigate('/dashboard');
      } else {
        setDenied(true);
        setChecking(false);
        setPulse(false);
        toast({
          title: '🚫 Akses Ditolak',
          description: `Address ${truncate(effectiveAddress)} tidak ada dalam whitelist.`,
          variant: 'destructive',
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isConnected, isNearConnected, address, accountId, navigate, toast]);

  // ── Status label ───────────────────────────────────────────
  const statusLabel = () => {
    const effectiveAddress = address || accountId;
    const effectiveConnected = isConnected || isNearConnected;

    if (!effectiveConnected) return { text: 'Wallet tidak terhubung', color: 'text-white/30' };
    if (checking)     return { text: 'Memverifikasi address…', color: 'text-yellow-400' };
    if (denied)       return { text: 'Akses ditolak', color: 'text-red-400' };
    return { text: truncate(effectiveAddress!), color: 'text-green-400' };
  };

  const { text: statusText, color: statusColor } = statusLabel();

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-transparent relative overflow-hidden text-white flex items-center justify-center p-6">

      {/* ── Decorative blobs ── */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-violet-500/5 rounded-full blur-[80px]" />

      {/* ── Card ── */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/[0.07] backdrop-blur-2xl rounded-[48px] p-12 border border-white/10 shadow-2xl overflow-hidden group relative">

          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />

          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div
              className={`w-20 h-20 mb-8 rounded-3xl overflow-hidden shadow-2xl bg-white/10 border border-white/10 transition-all duration-700 ${pulse ? 'ring-4 ring-violet-500/50 scale-110' : 'rotate-3 group-hover:rotate-0'}`}
            >
              <img src={logo} alt="Web3Radio" className="w-full h-full object-cover" />
            </div>

            <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-2.5 h-2.5" />
              Secured Access · Web3 Multichain
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-white">Pintu Masuk</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mt-2">
              Hubungkan wallet Solana atau Near untuk masuk
            </p>
          </div>

          {/* ── Wallet Status Card ── */}
          <div className={`mb-8 rounded-3xl border p-6 transition-all duration-500 ${
            denied
              ? 'bg-red-500/10 border-red-500/20'
              : isConnected && !checking
              ? 'bg-green-500/10 border-green-500/20'
              : checking
              ? 'bg-yellow-500/10 border-yellow-500/20'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                denied
                  ? 'bg-red-500/20'
                  : checking
                  ? 'bg-yellow-500/20'
                  : isConnected || isNearConnected
                  ? 'bg-green-500/20'
                  : 'bg-white/5'
              }`}>
                {checking ? (
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                ) : denied ? (
                  <ShieldX className="w-5 h-5 text-red-400" />
                ) : isConnected || isNearConnected ? (
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <Wallet className="w-5 h-5 text-white/30" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">
                  Status Wallet
                </p>
                <p className={`text-sm font-bold truncate ${statusColor}`}>
                  {statusText}
                </p>
              </div>
            </div>

            {/* Denied warning */}
            {denied && (
              <div className="mt-4 flex items-start gap-3 bg-red-500/10 rounded-2xl p-4">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-300 font-medium leading-relaxed">
                  Address ini tidak termasuk dalam whitelist admin. Gunakan wallet yang terdaftar.
                </p>
              </div>
            )}
          </div>

          {/* ── Connect Solana Button ── */}
          <button
            id="solana-connect-btn"
            onClick={() => open()}
            disabled={checking}
            className={`w-full h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn mb-4
              ${isConnected && !denied && address && !address.startsWith('0x')
                ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-900/30'
              }`}
          >
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isConnected && address && !address.startsWith('0x') ? (
              <>
                <ShieldCheck className="h-4 w-4 text-violet-400" />
                <span className="uppercase text-xs tracking-widest text-violet-100">Solana Active</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span className="uppercase text-xs tracking-widest">Connect Solana</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* ── Connect EVM Button ── */}
          <button
            id="evm-connect-btn"
            onClick={() => open()}
            disabled={checking}
            className={`w-full h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn mb-4
              ${isConnected && !denied && address && address.startsWith('0x')
                ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-900/30'
              }`}
          >
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isConnected && address && address.startsWith('0x') ? (
              <>
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="uppercase text-xs tracking-widest text-indigo-100">EVM Active</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span className="uppercase text-xs tracking-widest">Connect EVM</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* ── Connect Near Button ── */}
          <button
            id="near-connect-btn"
            onClick={() => connectNear()}
            disabled={checking}
            className={`w-full h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn
              ${isNearConnected && !denied
                ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/10'
              }`}
          >
            {checking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isNearConnected ? (
              <>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="uppercase text-xs tracking-widest text-cyan-100">Near Active</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span className="uppercase text-xs tracking-widest">Connect Near</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* ── Supported wallets hint ── */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-3 text-center">
              Phantom · Solflare · MyNearWallet · Here · WalletConnect
            </p>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* ── Footer ── */}
          <div className="mt-8 text-center" />
          <div className="mt-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/15 leading-relaxed">
              Web3Radio CMS v2.0<br />
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PintuMasuk;
