import path from "path";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

const fromSrc = (folder) => path.resolve(__dirname, "src", folder);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],

  // The code imports from the top of src/ ("ui/Button", "features/cabins/CabinRow").
  // CRA gets that from jsconfig's baseUrl; Vite needs these aliases instead.
  // The database access tests need a live project: npm run test:db
  test: {
    exclude: [...configDefaults.exclude, "supabase/**"],
  },

  resolve: {
    alias: {
      context: fromSrc("context"),
      data: fromSrc("data"),
      features: fromSrc("features"),
      hooks: fromSrc("hooks"),
      pages: fromSrc("pages"),
      services: fromSrc("services"),
      styles: fromSrc("styles"),
      ui: fromSrc("ui"),
      utils: fromSrc("utils"),
    },
  },
});
