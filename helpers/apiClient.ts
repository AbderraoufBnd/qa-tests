import { APIRequestContext } from "@playwright/test";
import { PROXY_LOGIN_URL, PROXY_LOGIN_NO_USER_URL, DIRECT_LOGIN_URL, PROXY_LOGIN_INVALID_URL } from "./urls";

/**
 * Make a generic POST request with JSON body.
 * @param ctx Playwright APIRequestContext fixture
 * @param url full endpoint URL
 * @param data request body
 */
export async function post(request: APIRequestContext, url: string, data: any) {
    return request.post(url, { data });
}

export async function loginThroughProxy(request: APIRequestContext, data: any) {
    return post(request, PROXY_LOGIN_URL, data);
}

/**
 * Send a request through the proxy while asking downstream to omit the user
 * field via a dedicated downstream endpoint. The proxy should then respond with 400.
 */
export async function loginThroughProxyNoUserFromDownStream(request: APIRequestContext, data: any) {
    // use a dedicated downstream endpoint that returns no `user` field
    return post(request, PROXY_LOGIN_NO_USER_URL, data);
}

/**
 * Send a request through the proxy to a route that replies with plain text
 * rather than JSON. The proxy will attempt `response.json()` and should fail
 * (producing a 500 error).
 */
export async function loginThroughProxyWithInvalidJson(request: APIRequestContext, data: any) {
    return post(request, PROXY_LOGIN_INVALID_URL, data);
}

export async function loginDirect(request: APIRequestContext, data: any) {
    return post(request, DIRECT_LOGIN_URL, data);
}
