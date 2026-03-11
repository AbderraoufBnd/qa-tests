import { test, expect } from "@playwright/test";
import { loginDirect } from "../helpers/apiClient";
// include JS client helper for direct calls
// note the explicit .js extension ensures Node can resolve when compiled from TypeScript
import payloads from "../helpers/payloads.json";

test.describe("Downstream server", () => {
  test("returns 400 when body lacks user", async ({ request }) => {
    const resp = await loginDirect(request, payloads.missingUser);
    expect(resp.status()).toBe(400);
  });

  test("echoes back user on valid request", async ({ request }) => {
    const resp = await loginDirect(request, payloads.validDownstream);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty("user", "bob");
    expect(body).toHaveProperty("token");
  });
});
