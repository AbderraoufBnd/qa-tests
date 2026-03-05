import { test, expect } from "../fixtures/proxy-fixtures";
import { ENDPOINTS } from "../helpers/urls";

test.describe("Happy path – valid request & valid downstream response", () => {
  test("should proxy POST request and return downstream response without 'user' key", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({
        user: 40,
        token: "abc123xyz",
        expires_in: 3600,
      });
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40, password: "12345" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toHaveProperty("token", "abc123xyz");
    expect(body).toHaveProperty("expires_in", 3600);
  });

  test("should preserve all non-user keys from downstream response", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({
        user: "john",
        role: "admin",
        permissions: ["read", "write"],
        metadata: { region: "eu-west-1" },
      });
    });

    const response = await api.post(ENDPOINTS.PROFILE, {
      data: { user: "john" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toHaveProperty("role", "admin");
    expect(body).toHaveProperty("permissions", ["read", "write"]);
    expect(body).toHaveProperty("metadata");
    expect(body.metadata).toEqual({ region: "eu-west-1" });
  });

  test("should work with any POST path", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: 1, result: "ok" });
    });

    const paths = [
      ENDPOINTS.LOGIN,
      ENDPOINTS.USERS_CREATE,
      ENDPOINTS.WEBHOOK,
      ENDPOINTS.DEEP_NESTED,
    ];
    for (const path of paths) {
      const response = await api.post(path, {
        data: { user: 1 },
      });
      expect(response.status()).toBe(200);
    }
  });
});

test.describe("Request validation – JSON body expected (R1)", () => {
  test("should return 422 or error when request body is not valid JSON", async ({
    api,
  }) => {
    const response = await api.post(ENDPOINTS.LOGIN, {
      data: "this is not json",
      headers: { "Content-Type": "text/plain" },
    });

    expect([400, 422]).toContain(response.status());
  });

  test("should return error when request body is empty", async ({ api }) => {
    const response = await api.post(ENDPOINTS.LOGIN, {
      headers: { "Content-Type": "application/json" },
    });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe("Request validation – missing or invalid 'user' key (R2)", () => {
  test("should return 400 when 'user' key is missing from request body", async ({
    api,
  }) => {
    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { password: "12345" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.detail).toContain("user");
  });

  test("should return 400 when request body is an empty object", async ({
    api,
  }) => {
    const response = await api.post(ENDPOINTS.LOGIN, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test("should accept 'user' key with different value types (string)", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: "alice", ok: true });
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: "alice" },
    });

    expect(response.status()).toBe(200);
  });

  test("should accept 'user' key with null value", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: null, ok: true });
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: null },
    });

    expect(response.status()).toBe(200);
  });

  test("should accept 'user' key with numeric value", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: 42, status: "active" });
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 42 },
    });

    expect(response.status()).toBe(200);
  });
});

test.describe("Downstream response validation – JSON response expected (R3)", () => {
  test("should return error when downstream returns non-JSON response", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.set("Content-Type", "text/plain");
      res.send("this is not json");
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40, password: "12345" },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should return error when downstream returns HTML instead of JSON", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.set("Content-Type", "text/html");
      res.send("<h1>Error</h1>");
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40 },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("Downstream response validation – missing 'user' key (R4)", () => {
  test("should return 400 when downstream response does not contain 'user' key", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ token: "abc123xyz", expires_in: 3600 });
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40, password: "12345" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.detail).toContain("user");
  });

  test("should return 400 when downstream returns empty JSON object", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({});
    });

    const response = await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40 },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe("Response body – 'user' key removal", () => {
  test("should strip 'user' key from the proxy response", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: "test-user-123", data: "payload" });
    });

    const response = await api.post(ENDPOINTS.DATA, {
      data: { user: "test-user-123" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toHaveProperty("data", "payload");
  });

  test("should return remaining keys when 'user' is the only key in downstream response", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({ user: "solo" });
    });

    const response = await api.post(ENDPOINTS.MINIMAL, {
      data: { user: "solo" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(Object.keys(body)).toHaveLength(0);
  });
});

test.describe("Proxy forwarding – request is correctly forwarded to downstream", () => {
  test("should forward the full request body to the downstream server", async ({
    api,
    setDownstreamHandler,
  }) => {
    let capturedBody: Record<string, unknown> | null = null;

    setDownstreamHandler((req, res) => {
      capturedBody = req.body;
      res.json({ user: req.body.user, forwarded: true });
    });

    await api.post(ENDPOINTS.LOGIN, {
      data: { user: 40, password: "secret", extra: "data" },
    });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody).toHaveProperty("user", 40);
    expect(capturedBody).toHaveProperty("password", "secret");
    expect(capturedBody).toHaveProperty("extra", "data");
  });

  test("should forward to the correct path on the downstream server", async ({
    api,
    setDownstreamHandler,
  }) => {
    let capturedPath: string | null = null;

    setDownstreamHandler((req, res) => {
      capturedPath = req.path;
      res.json({ user: 1, ok: true });
    });

    await api.post(ENDPOINTS.USERS_REGISTER_V2, {
      data: { user: 1 },
    });

    expect(capturedPath).toBe(ENDPOINTS.USERS_REGISTER_V2);
  });

  test("should only accept POST method (GET returns 405)", async ({ api }) => {
    const response = await api.get(ENDPOINTS.LOGIN);
    expect(response.status()).toBe(405);
  });
});

test.describe("Edge cases & error handling", () => {
  test("should handle downstream returning extra fields alongside 'user'", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.json({
        user: "will-be-removed",
        a: 1,
        b: "two",
        c: [3],
        d: { nested: true },
      });
    });

    const response = await api.post(ENDPOINTS.COMPLEX, {
      data: { user: "test" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toEqual({
      a: 1,
      b: "two",
      c: [3],
      d: { nested: true },
    });
  });

  test("should handle downstream returning non-200 status with 'user' key", async ({
    api,
    setDownstreamHandler,
  }) => {
    setDownstreamHandler((_req, res) => {
      res.status(500).json({ user: "err", error: "internal failure" });
    });

    const response = await api.post(ENDPOINTS.FAILING, {
      data: { user: "test" },
    });

    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toHaveProperty("error", "internal failure");
  });

  test("should handle large request & response payloads", async ({
    api,
    setDownstreamHandler,
  }) => {
    const largePayload = { user: "load-test", items: Array(1000).fill("data") };

    setDownstreamHandler((_req, res) => {
      res.json({ user: "load-test", processed: true, count: 1000 });
    });

    const response = await api.post(ENDPOINTS.BULK, {
      data: largePayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty("user");
    expect(body).toHaveProperty("processed", true);
  });
});
