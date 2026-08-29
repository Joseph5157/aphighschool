import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    env: loadEnv("test", process.cwd(), ""),
    // DB-backed tests share one Postgres database. Disable running test FILES
    // in parallel (tests within a file still run sequentially by default) so
    // resetDb() in one file cannot truncate a table another file is mid-way
    // through. Pool-agnostic on purpose: Vitest 2.x defaults to the "forks"
    // pool, not "threads", so poolOptions.threads.singleThread would silently
    // do nothing here — fileParallelism keeps working regardless of which
    // pool Vitest defaults to.
    fileParallelism: false,
    exclude: ["**/node_modules/**", "**/.claude/**", "**/.next/**"],
  },
}));
