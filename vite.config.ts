import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Three.js and MediaPipe together are most of the bundle. Splitting
        // them out keeps the first paint small on mobile and lets them cache
        // across app deploys.
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          mediapipe: ["@mediapipe/tasks-vision", "@mediapipe/hands", "@mediapipe/camera_utils"],
        },
      },
    },
  },
}));
