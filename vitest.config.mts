import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.ts"],
    reporters: [
      "default",
      ["junit", { outputFile: "./junit.xml" }],
      ...(process.env.GITHUB_ACTIONS ? ["github-actions"] : []),
    ],
  },
});
