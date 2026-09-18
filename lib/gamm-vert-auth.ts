import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cde_gv_session";
const sign = (value: string) => process.env.GAMM_VERT_AUTH_SECRET
  ? createHmac("sha256", process.env.GAMM_VERT_AUTH_SECRET).update(value).digest("hex") : "";

export const gammVertCookieName = () => COOKIE_NAME;
export const gammVertClientKey = (value: string) => sign(`gv-login:${value}`);

export function createGammVertSession() {
  const expires = String(Date.now() + 1000 * 60 * 60 * 12);
  return `${expires}.${sign(expires)}`;
}

export function isValidGammVertSession(raw: string | undefined) {
  if (!raw) return false;
  const [expires, supplied] = raw.split(".");
  const expected = sign(expires ?? "");
  if (!expires || !supplied || Number(expires) < Date.now() || !expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function safeEqual(value: string, expected: string | undefined) {
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function areCorrectGammVertCredentials(username: string, password: string) {
  return safeEqual(username, process.env.GAMM_VERT_USERNAME)
    && safeEqual(password, process.env.GAMM_VERT_PASSWORD);
}
