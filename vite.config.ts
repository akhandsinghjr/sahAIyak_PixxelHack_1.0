import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const groqApiKey = env.GROQ_API_KEY
    || env.groq_API_KEY
    || env.VITE_GROQ_API_KEY
    || process.env.GROQ_API_KEY
    || process.env.groq_API_KEY
    || process.env.VITE_GROQ_API_KEY
    || "";
  return ({
  build: {
    outDir: 'build', // Ensure the output directory is set to 'build'
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Optional: legacy local API proxy. Safe to keep if you still run a local server on 5000.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // New: direct Groq proxy without exposing the API key to the browser
      '/groq': {
        target: 'https://api.groq.com/openai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/groq/, ''),
        headers: groqApiKey ? { Authorization: `Bearer ${groqApiKey}` } : undefined,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Handle different content types for audio endpoints
            if (req.url?.includes('/audio/speech')) {
              proxyReq.setHeader('Accept', 'audio/mpeg');
            }
          });
        },
      },
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});
