import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cde_analytics_admin";
const sign = (value: string) => process.env.ANALYTICS_AUTH_SECRET
  ? createHmac("sha256", process.env.ANALYTICS_AUTH_SECRET).update(value).digest("hex") : "";

export const analyticsCookieName = () => COOKIE_NAME;
export const analyticsClientKey = (value: string) => sign(`login:${value}`);
export function createAnalyticsSession() {
  const expires = String(Date.now() + 1000 * 60 * 60 * 12);
  return `${expires}.${sign(expires)}`;
}
export function isValidAnalyticsSession(raw: string | undefined) {
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

export function areCorrectAnalyticsCredentials(username: string, password: string) {
  return safeEqual(username, process.env.ANALYTICS_DASHBOARD_USERNAME)
    && safeEqual(password, process.env.ANALYTICS_DASHBOARD_PASSWORD);
}
