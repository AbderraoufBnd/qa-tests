import { APIRequestContext } from "@playwright/test";
import {
  PROXY_LOGIN_URL,
  PROXY_LOGIN_NO_USER_URL,
  DIRECT_LOGIN_URL,
  PROXY_LOGIN_INVALID_URL,
} from "./urls";

/**
 * Make a generic POST request with JSON body.
 * @param ctx Playwright APIRequestContext fixture
 * @param url full endpoint URL
 * @param data request body
 */
export async function post(ctx: APIRequestContext, url: string, data: any) {
  return ctx.post(url, { data });
}

export async function loginThroughProxy(ctx: APIRequestContext, data: any) {
  return post(ctx, PROXY_LOGIN_URL, data);
}

/**
 * Send a request through the proxy while asking downstream to omit the user
 * field via a dedicated downstream endpoint. The proxy should then respond with 400.
 */
export async function loginThroughProxyNoUserFromDownStream(
  ctx: APIRequestContext,
  data: any,
) {
  // use a dedicated downstream endpoint that returns no `user` field
  const url = PROXY_LOGIN_NO_USER_URL;
  return post(ctx, url, data);
}

/**
 * Send a request through the proxy to a route that replies with plain text
 * rather than JSON. The proxy will attempt `response.json()` and should fail
 * (producing a 500 error).
 */
export async function loginThroughProxyWithInvalidJson(
  ctx: APIRequestContext,
  data: any,
) {
  const url = PROXY_LOGIN_INVALID_URL;
  return post(ctx, url, data);
}

export async function loginDirect(ctx: APIRequestContext, data: any) {
  return post(ctx, DIRECT_LOGIN_URL, data);
}
