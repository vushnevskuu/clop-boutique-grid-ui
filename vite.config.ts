import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Dev: без CORS на стороне Medusa можно проксировать Store API (см. medusa/README.md)
    proxy: {
      "/medusa": {
        target: "http://localhost:9000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/medusa/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    // Оптимизация размера бандла
    target: 'esnext',
    assetsInlineLimit: 4096, // Инлайним маленькие ассеты
    // Улучшенная компрессия
    reportCompressedSize: true,
  },
}));
