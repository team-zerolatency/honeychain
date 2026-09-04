import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 20000, // argon2 hashing is intentionally slow
    hookTimeout: 20000,
  },
});