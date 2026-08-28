/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://github.com/jakehamilton/vitest-nix-direnv-bug
export default defineConfig({
  server: {
    watch: {
      ignored: ["**/.direnv/**"],
    },
  },
  test: {
    exclude: ["node_modules", ".direnv"],
  },
});
