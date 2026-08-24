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
    // DB-backed tests share one Postgres database. Run serially so resetDb()
    // in one file cannot truncate a table another file is mid-way through.
    poolOptions: { threads: { singleThread: true } },
  },
}));
