import { test, expect } from "@playwright/test";
import { loginThroughProxy, post, loginThroughProxyNoUserFromDownStream, loginThroughProxyWithInvalidJson } from "../helpers/apiClient";

import payloads from "../helpers/payloads.json";

test.describe("Proxy service", () => {
    test("returns 400 when request body lacks user", async ({ request }) => {
        const resp = await loginThroughProxy(request, payloads.missingUser);
        expect(resp.status()).toBe(400);
    });

    test("forwards valid request and strips user from response and keep other fields", async ({ request }) => {
        const resp = await loginThroughProxy(request, payloads.validUser);
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        console.log("Response status:", resp.status(), body);

        expect(body).not.toHaveProperty("user");
        expect(body).toHaveProperty("data", payloads?.validUser?.data);
    });

    test("responds 400 if downstream response lacks user (dedicated route)", async ({ request }) => {
        const resp = await loginThroughProxyNoUserFromDownStream(request, payloads.validUser);
        expect(resp.status()).toBe(400);
    });

    test("errors when downstream response is not valid JSON", async ({ request }) => {
        const resp = await loginThroughProxyWithInvalidJson(request, payloads.validUser);
        expect(resp.status()).toBeGreaterThanOrEqual(400);
    });
    //the proxy server expects a json body from the client
    test("errors when request body is not valid JSON", async ({ request }) => {
        const resp = await loginThroughProxy(request, payloads.plainText);
        expect(resp.status()).toBeGreaterThanOrEqual(400);
    });
});
