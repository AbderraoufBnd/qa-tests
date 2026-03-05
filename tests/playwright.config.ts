import { defineConfig } from "@playwright/test";
import { ENV } from "./helpers/env";

/**
 * Playwright configuration for API-level testing of the proxy service.
 *
 * - No browser is launched (API-only tests use `request` context).
 * - The FastAPI proxy is expected to run on localhost:8000.
 * - The mock downstream server is started/stopped programmatically
 *   via the custom fixture.
 */
export default defineConfig({
  testDir: "./specs",
  timeout: ENV.TEST_TIMEOUT,
  retries: 0,
  workers: 1, // serial execution – single mock server instance
  reporter: [["list"], ["html", { open: "always", outputFolder: "../test-report" }]],
  use: {
    baseURL: ENV.BASE_URL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  },
});
