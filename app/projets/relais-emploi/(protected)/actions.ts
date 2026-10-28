"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createRelaisAccessKey, isRelaisOwnerSession, relaisCookieName, relaisCookieOptions } from "@/lib/relais-emploi-auth";

export async function logoutRelais() {
  const store = await cookies();
  store.set(relaisCookieName(), "", { ...relaisCookieOptions(), maxAge: 0 });
  redirect("/projets/relais-emploi/login");
}

export type QrResult = { error: string } | { label: string; url: string; svg: string; png: string; expires: string };

// Crée un QR code d'accès étiqueté. Réservé à une session ouverte avec les identifiants.
export async function createAccessQr(_state: QrResult | null, formData: FormData): Promise<QrResult> {
  const store = await cookies();
  if (!isRelaisOwnerSession(store.get(relaisCookieName())?.value)) return { error: "Connectez-vous avec vos identifiants pour créer un QR code." };
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { error: "Donnez une étiquette au QR code, par exemple « Gilles Berger »." };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "www.carnetdexperience.fr";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const { key, expires } = createRelaisAccessKey(label);
  const url = `${protocol}://${host}/projets/relais-emploi/acces?cle=${key}`;
  const options = { errorCorrectionLevel: "M" as const, margin: 2, color: { dark: "#19283d", light: "#FFFFFF" } };
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { ...options, type: "svg" }),
    QRCode.toDataURL(url, { ...options, width: 1024 }),
  ]);
  const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(expires);
  return { label: label.slice(0, 80), url, svg, png, expires: date };
}
