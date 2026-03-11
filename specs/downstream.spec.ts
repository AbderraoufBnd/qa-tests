import { test, expect } from "@playwright/test";
import { loginDirect } from "../helpers/apiClient";
import payloads from "../helpers/payloads.json";

test.describe("Downstream server", () => {
    test("returns 400 when body lacks user", async ({ request }) => {
        //given : only donwstream server is up and healthy
        //when: the downstream service receives a request missing the `user` field
        const resp = await loginDirect(request, payloads.missingUser);
        //then: it should respond with status 400
        expect(resp.status()).toBe(400);
    });

    test("echoes back user on valid request", async ({ request }) => {
        //given : only donwstream server is up and healthy
        //when: the downstream service receives a well-formed request containing a valid user
        const resp = await loginDirect(request, payloads.validUser);
        //then: it should respond with status 200 and include the user, data, and a token
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(body).toHaveProperty("user", payloads?.validUser?.user);
        expect(body).toHaveProperty("data", payloads?.validUser?.data);
        expect(body).toHaveProperty("token");
    });
});
