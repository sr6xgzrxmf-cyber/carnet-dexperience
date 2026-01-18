import crypto from "crypto";

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // pas de 0/O, 1/I

export function generateCode6() {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPH[Math.floor(Math.random() * ALPH.length)];
  return out;
}

export function hashCode(code: string) {
  const pepper = process.env.CODE_PEPPER ?? "pepper-dev";
  return crypto.createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}
