import { defineConfig, loadEnv } from "vite";

// The database access tests run against a real Supabase project, so they
// live apart from the unit tests: npm run test:db
export default defineConfig(({ mode }) => ({
  test: {
    include: ["supabase/tests/**/*.test.js"],
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 30000,
    hookTimeout: 120000,
    // One file at a time: they share one database, and some tests count
    // every row, which another file adding test guests would throw off
    threads: false,
  },
}));
