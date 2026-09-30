import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cde_gv_session";
const sign = (value: string) => process.env.GAMM_VERT_AUTH_SECRET
  ? createHmac("sha256", process.env.GAMM_VERT_AUTH_SECRET).update(value).digest("hex") : "";

export const gammVertCookieName = () => COOKIE_NAME;
export const gammVertClientKey = (value: string) => sign(`gv-login:${value}`);

// « owner » : connexion par identifiant ; « qr » : visiteur arrivé par un QR code.
type SessionKind = "owner" | "qr";

export function createGammVertSession(kind: SessionKind = "owner") {
  const body = `${Date.now() + 1000 * 60 * 60 * 12}:${kind}`;
  return `${body}.${sign(body)}`;
}

function readSession(raw: string | undefined): SessionKind | null {
  if (!raw) return null;
  const [body, supplied] = raw.split(".");
  const expected = sign(body ?? "");
  if (!body || !supplied || !expected || supplied.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  const [expires, kind] = body.split(":");
  if (Number(expires) < Date.now()) return null;
  return kind === "qr" ? "qr" : "owner";
}

export function isValidGammVertSession(raw: string | undefined) {
  return readSession(raw) !== null;
}

// Seule une connexion par identifiant peut créer des QR codes.
export function isGammVertOwnerSession(raw: string | undefined) {
  return readSession(raw) === "owner";
}

function safeEqual(value: string, expected: string | undefined) {
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function areCorrectGammVertCredentials(username: string, password: string) {
  return safeEqual(username, process.env.GAMM_VERT_USERNAME)
    && safeEqual(password, process.env.GAMM_VERT_PASSWORD);
}

// Lien d'accès par QR code : l'étiquette et la date d'expiration sont signées,
// sans identifiant ni mot de passe dans l'URL.
const ACCESS_KEY_DAYS = 60;

export function createGammVertAccessKey(label: string) {
  const expires = Date.now() + ACCESS_KEY_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ l: label.slice(0, 80), e: expires })).toString("base64url");
  return { key: `${payload}.${sign(`gv-link:${payload}`)}`, expires: new Date(expires) };
}

export function readGammVertAccessKey(raw: string | null) {
  if (!raw) return null;
  const [payload, supplied] = raw.split(".");
  const expected = sign(`gv-link:${payload ?? ""}`);
  if (!payload || !supplied || !expected || supplied.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { l?: unknown; e?: unknown };
    if (typeof data.e !== "number" || data.e < Date.now()) return null;
    return { label: typeof data.l === "string" ? data.l : "Sans étiquette", expires: new Date(data.e) };
  } catch {
    return null;
  }
}

export const gammVertCookieOptions = (lax = false) => ({
  httpOnly: true,
  // Un scan ouvre le lien depuis l'appareil photo : « lax » garantit que la session suit la redirection.
  sameSite: lax ? ("lax" as const) : ("strict" as const),
  secure: process.env.NODE_ENV === "production",
  path: "/projets/jardin-partage",
  maxAge: 60 * 60 * 12,
});
