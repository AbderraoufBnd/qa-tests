import { test, expect } from "@playwright/test";
import { loginThroughProxy, loginThroughProxyNoUserFromDownStream, loginThroughProxyWithInvalidJson } from "../helpers/apiClient";
import payloads from "../helpers/payloads.json";

test.describe("Proxy service", () => {
    test("returns 400 when request body lacks user", async ({ request }) => {
        // Given: the proxy and downstream server are both running and healthy
        // When: executing the loginThroughProxy login-related API call with a missing user
        const resp = await loginThroughProxy(request, payloads.missingUser);
        // Then: the proxy responds with status 400
        expect(resp.status()).toBe(400);
    });

    test("forwards valid request and strips user from response and keep other fields", async ({ request }) => {
        // Given: the proxy and downstream server are both running and healthy
        // When: executing the loginThroughProxy login-related API call with a valid user
        const resp = await loginThroughProxy(request, payloads.validUser);
        // Then: the proxy should forward the request, receive the response, and return it with the `user` field stripped out but other fields intact
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(body).not.toHaveProperty("user");
        expect(body).toHaveProperty("data", payloads?.validUser?.data);
    });

    test("responds 400 if downstream response lacks user (dedicated route)", async ({ request }) => {
        // Given: the proxy and downstream server are both running and healthy
        // When: executing the loginThroughProxyNoUserFromDownStream API call with a valid user payload
        const resp = await loginThroughProxyNoUserFromDownStream(request, payloads.validUser);
        // Then: the proxy should respond with status 400 since it requires a `user` field in the downstream response
        expect(resp.status()).toBe(400);
    });

    test("errors when downstream response is not valid JSON", async ({ request }) => {
        // Given: the proxy and downstream server are both running and healthy
        // When: executing the loginThroughProxyWithInvalidJson API call with a valid user payload
        const resp = await loginThroughProxyWithInvalidJson(request, payloads.validUser);
        // Then: the proxy should fail, and return a 400 error
        expect(resp.status()).toBeGreaterThanOrEqual(400);
    });
    test("errors when request body is not valid JSON", async ({ request }) => {
        // Given: the proxy and downstream server are both running and healthy
        // When: executing the loginThroughProxy API call with a plain text payload
        const resp = await loginThroughProxy(request, payloads.plainText);
        // Then: the proxy should fail, and return a 400 error
        expect(resp.status()).toBeGreaterThanOrEqual(400);
    });
});
