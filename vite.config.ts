import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  return {
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
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "html-site-url",
      transformIndexHtml(html) {
        if (!siteUrl) {
          return html
            .replace('href="__SITE_URL__/"', 'href="/"')
            .replace(/<meta property="og:url"[^>]*>\s*/g, "")
            .replace(/<meta property="og:image"[^>]*>\s*/g, "")
            .replace(/<meta name="twitter:image"[^>]*>\s*/g, "");
        }
        const ogImage = `${siteUrl}/og-image.png`;
        return html
          .replaceAll("__SITE_URL__", siteUrl)
          .replaceAll("__OG_IMAGE__", ogImage);
      },
    },
  ].filter(Boolean),
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
};
});
