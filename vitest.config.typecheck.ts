import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    typecheck: {
      enabled: true,
      only: true,
      ignoreSourceErrors: true,
      tsconfig: "./tsconfig.json",
      include: ["test-d/**/*.test-d.ts"],
    },
  },
});
