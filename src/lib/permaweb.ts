import { WebIrys } from "@irys/sdk";
import { Buffer } from "buffer";

// Polyfill Buffer for browser if needed (Irys uses it)
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

export const getIrys = async (wallet: any) => {
  const network = "devnet"; // Using devnet for Irys (linked to Solana devnet)
  const token = "solana";
  const rpcUrl = "https://api.devnet.solana.com";

  const irys = new WebIrys({
    url: "https://devnet.irys.xyz",
    token,
    wallet: { name: "solana", provider: wallet, rpcUrl },
    config: { providerUrl: rpcUrl }
  });

  await irys.ready();
  return irys;
};

export const uploadArticleToPermaweb = async (wallet: any, articleData: {
  title: string;
  content: string;
  author: string;
  category: string;
  image?: string;
}) => {
  try {
    const irys = await getIrys(wallet);

    // 1. Upload the image to Arweave first if it exists
    let finalImageUrl = "https://picsum.photos/800/800"; // default fallback
    if (articleData.image) {
      try {
        console.log("Fetching image to upload to Arweave:", articleData.image);
        const imgResponse = await fetch(articleData.image);
        const imgBlob = await imgResponse.blob();
        const buffer = Buffer.from(await imgBlob.arrayBuffer());
        
        console.log("Uploading image buffer to Arweave...");
        const imageTags = [{ name: "Content-Type", value: imgBlob.type }];
        const price = await irys.getPrice(buffer.length);
        const balance = await irys.getLoadedBalance();
        if (balance.isLessThan(price)) {
          console.log("Funding Irys node for image upload...");
          await irys.fund(price);
        }
        const imageReceipt = await irys.upload(buffer as any, { tags: imageTags });
        finalImageUrl = `https://gateway.irys.xyz/${imageReceipt.id}`;
        console.log("Image successfully uploaded to Arweave:", finalImageUrl);
      } catch (imgErr) {
        console.error("Failed to upload image to Arweave, using original URL", imgErr);
        finalImageUrl = articleData.image; // fallback to original if fail
      }
    }

    // 2. Prepare the content as Metaplex-compliant JSON
    const contentToUpload = {
      name: articleData.title.slice(0, 32),
      description: articleData.content.replace(/<[^>]+>/g, '').slice(0, 500) + '...', // Strip HTML for description
      image: finalImageUrl,
      attributes: [
        { trait_type: "Author", value: articleData.author },
        { trait_type: "Category", value: articleData.category },
        { trait_type: "Platform", value: "Web3Radio" },
      ],
      properties: {
        files: [
          { uri: finalImageUrl, type: "image/png" }
        ],
        category: "image",
        custom_data: {
          type: "WriteNFT_Article_V1",
          published_at: new Date().toISOString()
        }
      }
    };

    const data = JSON.stringify(contentToUpload);
    const tags = [
      { name: "Content-Type", value: "application/json" },
      { name: "App-Name", value: "Web3Radio-WriteNFT" },
      { name: "Category", value: articleData.category }
    ];

    // 2. Upload to Arweave
    console.log("Uploading to Arweave...");
    const receipt = await irys.upload(data, { tags });
    
    const permawebUrl = `https://gateway.irys.xyz/${receipt.id}`;
    console.log("Upload success:", permawebUrl);

    return {
      url: permawebUrl,
      id: receipt.id,
      receipt
    };
  } catch (error) {
    console.error("Irys upload error:", error);
    throw error;
  }
};
