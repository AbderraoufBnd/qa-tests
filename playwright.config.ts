import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./specs",
  timeout: 30 * 1000,
  reporter: [["html", { outputFolder: "../playwright-report" }]],
  use: {
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  },
};

export default config;
