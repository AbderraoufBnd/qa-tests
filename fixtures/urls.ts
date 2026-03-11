// allow configuration via environment variables for greater flexibility
// use a .env file in development – see .env.example in repo root
import dotenv from "dotenv";

dotenv.config();

const proxyBase = process.env.PROXY_BASE_URL || "http://localhost:8000";
const downstreamBase = process.env.DOWNSTREAM_BASE_URL || "http://localhost:8085";

export const PROXY_LOGIN_URL = `${proxyBase}/login`;
export const DIRECT_LOGIN_URL = `${downstreamBase}/login`;
export const PROXY_LOGIN_NO_USER_URL = `${proxyBase}/login-no-user`;
export const PROXY_LOGIN_INVALID_URL = `${proxyBase}/login-invalid`;

