import { test as base, APIRequestContext } from "@playwright/test";
import {
  startMockServer,
  stopMockServer,
  setHandler,
  MockHandler,
} from "../helpers/mock-server";
import { ENV } from "../helpers/env";

type ProxyFixtures = {
  api: APIRequestContext;
  setDownstreamHandler: (handler: MockHandler | null) => void;
};

export const test = base.extend<ProxyFixtures>({
  api: async ({ request }, use) => {
    await use(request);
  },

  setDownstreamHandler: async ({}, use) => {
    await use((handler: MockHandler | null) => setHandler(handler));
    setHandler(null);
  },
});

export { expect } from "@playwright/test";

test.beforeAll(async () => {
  await startMockServer(ENV.MOCK_PORT);
});

test.afterAll(async () => {
  await stopMockServer();
});
