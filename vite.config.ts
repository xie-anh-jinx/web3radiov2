import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
      ignored: ['**/server/**', '**/node_modules/**', '**/dist/**', '**/public/uploads/**'],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/cryptopanic-api': {
        target: 'https://cryptopanic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cryptopanic-api/, ''),
      },
    },
  },
  plugins: [
    nodePolyfills(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: mode === 'extension' ? './' : '/',
  build: {
    outDir: mode === 'extension' ? 'dist-extension' : 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-slot', '@radix-ui/react-label', 'lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-web3': [
            '@reown/appkit',
            '@reown/appkit-adapter-wagmi',
            '@reown/appkit-adapter-solana',
            '@walletconnect/ethereum-provider',
            'wagmi',
            'viem',
            '@tanstack/react-query',
            'ethers'
          ],
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["@coinbase/onchainkit"],
  },
}));
