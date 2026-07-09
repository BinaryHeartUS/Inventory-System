import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:8080",
        changeOrigin: true,
      },
      "/tables": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
