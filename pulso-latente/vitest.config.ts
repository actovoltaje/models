import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    coverage: { include: ["lib/**"], exclude: ["**/*.test.ts"], thresholds: { lines: 80 } },
  },
});
