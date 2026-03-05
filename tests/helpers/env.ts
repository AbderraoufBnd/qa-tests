import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the .env file located in the tests/ directory.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const ENV = {
  PROXY_HOST: process.env.PROXY_HOST ?? "127.0.0.1",
  PROXY_PORT: Number(process.env.PROXY_PORT ?? 8000),
  BASE_URL: process.env.BASE_URL ?? "http://127.0.0.1:8000",

  MOCK_HOST: process.env.MOCK_HOST ?? "127.0.0.1",
  MOCK_PORT: Number(process.env.MOCK_PORT ?? 8085),

  TEST_TIMEOUT: Number(process.env.TEST_TIMEOUT ?? 30_000),
} as const;
