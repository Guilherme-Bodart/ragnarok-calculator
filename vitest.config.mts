import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const vitestConfig = defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    include: [
      "api/src/**/*.spec.ts",
      "components/**/*.spec.ts",
      "packages/calculator-core/src/**/*.spec.ts",
    ],
    exclude: ["**/node_modules/**", "api/dist/**"],
  },
});

export default vitestConfig;
