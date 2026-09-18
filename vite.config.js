import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config Vite standard. Le build sort dans /dist, prêt à être déployé
// tel quel sur Cloudflare Pages (dossier de sortie : dist).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
