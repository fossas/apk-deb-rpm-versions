import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**"],
    include: ["./src/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text"],
      thresholds: {
        functions: 100,
        branches: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
