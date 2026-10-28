import { createHmac, timingSafeEqual } from "node:crypto";

// Même mécanique que l'accès au Jardin Partagé, avec ses propres identifiants et son propre secret.
const COOKIE_NAME = "cde_re_session";
const sign = (value: string) => process.env.RELAIS_DEMO_AUTH_SECRET
  ? createHmac("sha256", process.env.RELAIS_DEMO_AUTH_SECRET).update(value).digest("hex") : "";

export const relaisCookieName = () => COOKIE_NAME;
export const relaisClientKey = (value: string) => sign(`re-login:${value}`);

// « owner » : connexion par identifiant ; « qr » : visiteur arrivé par un QR code ou un lien d'accès.
type SessionKind = "owner" | "qr";

export function createRelaisSession(kind: SessionKind = "owner") {
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

export function isValidRelaisSession(raw: string | undefined) {
  return readSession(raw) !== null;
}

// Seule une connexion par identifiant peut créer des QR codes.
export function isRelaisOwnerSession(raw: string | undefined) {
  return readSession(raw) === "owner";
}

function safeEqual(value: string, expected: string | undefined) {
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function areCorrectRelaisCredentials(username: string, password: string) {
  return safeEqual(username, process.env.RELAIS_DEMO_USERNAME)
    && safeEqual(password, process.env.RELAIS_DEMO_PASSWORD);
}

// Lien d'accès par QR code : l'étiquette et la date d'expiration sont signées,
// sans identifiant ni mot de passe dans l'URL.
const ACCESS_KEY_DAYS = 60;

export function createRelaisAccessKey(label: string) {
  const expires = Date.now() + ACCESS_KEY_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ l: label.slice(0, 80), e: expires })).toString("base64url");
  return { key: `${payload}.${sign(`re-link:${payload}`)}`, expires: new Date(expires) };
}

export function readRelaisAccessKey(raw: string | null) {
  if (!raw) return null;
  const [payload, supplied] = raw.split(".");
  const expected = sign(`re-link:${payload ?? ""}`);
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

export const relaisCookieOptions = (lax = false) => ({
  httpOnly: true,
  // Un scan ouvre le lien depuis l'appareil photo : « lax » garantit que la session suit la redirection.
  sameSite: lax ? ("lax" as const) : ("strict" as const),
  secure: process.env.NODE_ENV === "production",
  path: "/projets/relais-emploi",
  maxAge: 60 * 60 * 12,
});
