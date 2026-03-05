export const ENDPOINTS = {
  LOGIN: "/api/login",

  PROFILE: "/api/profile",

  DATA: "/api/data",

  MINIMAL: "/api/minimal",

  COMPLEX: "/api/complex",

  FAILING: "/api/failing",

  BULK: "/api/bulk",

  USERS_CREATE: "/api/users/create",

  USERS_REGISTER_V2: "/api/v2/users/register",

  /** Webhook */
  WEBHOOK: "/webhook",

  DEEP_NESTED: "/a/b/c/d",
} as const;

export type Endpoint = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
