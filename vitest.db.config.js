import { defineConfig, loadEnv } from "vite";

// The database access tests run against a real Supabase project, so they
// live apart from the unit tests: npm run test:db
export default defineConfig(({ mode }) => ({
  test: {
    include: ["supabase/tests/**/*.test.js"],
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 30000,
    hookTimeout: 120000,
  },
}));
