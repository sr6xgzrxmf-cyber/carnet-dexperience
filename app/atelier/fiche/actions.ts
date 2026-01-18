"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEPS, TOTAL_STEPS } from "@/lib/atelier/steps";
import { generateCode6, hashCode } from "@/lib/atelier/code";
import { sendStartCodeEmail, sendFinalEmails } from "@/lib/atelier/email";

function requireEmail(raw: unknown) {
  const email = String(raw ?? "").trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Email invalide.");
  return email;
}

function requireCode(raw: unknown) {
  const code = String(raw ?? "").trim().toUpperCase();
  if (code.length !== 6) throw new Error("Code invalide.");
  return code;
}

function setSubmissionCookie(id: string) {
  return cookies().then((cookieStore) => {
    cookieStore.set("atelier_submission_id", id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 14, // 14 jours
    });
  });
}

export async function startSubmission(formData: FormData) {
  const email = requireEmail(formData.get("email"));
  const code = generateCode6();

  const sub = await prisma.submission.create({
    data: {
      email,
      codeHash: hashCode(code),
      codeExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 jours
      currentStep: 1,
      data: {},
    },
  });

  await setSubmissionCookie(sub.id);

  // ✅ Mail 1 : code de reprise (une seule fois, au début)
  await sendStartCodeEmail({ to: email, code });

  redirect("/atelier/fiche/1");
}

export async function resumeWithCode(formData: FormData) {
  const email = requireEmail(formData.get("email"));
  const code = requireCode(formData.get("code"));

  const sub = await prisma.submission.findFirst({
    where: {
      email,
      codeHash: hashCode(code),
      codeExpiresAt: { gt: new Date() },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!sub) throw new Error("Email/code introuvables ou expirés.");

  await setSubmissionCookie(sub.id);

  const step = Math.min(Math.max(sub.currentStep, 1), TOTAL_STEPS);
  redirect(`/atelier/fiche/${step}`);
}

export async function submitStep(step: number, formData: FormData) {
  const cookieStore = await cookies();
  const id = cookieStore.get("atelier_submission_id")?.value;
  if (!id) throw new Error("Session introuvable. Reprends avec ton code.");

  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) throw new Error("Soumission introuvable.");

  const cfg = STEPS.find((s) => s.id === step);
  if (!cfg) throw new Error("Étape inconnue.");

  const patch: Record<string, string> = {};
  for (const f of cfg.fields) {
    patch[f.name] = String(formData.get(f.name) ?? "").trim();
  }

  const nextStep = Math.min(step + 1, TOTAL_STEPS);

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      data: { ...(sub.data as any), ...patch },
      currentStep: nextStep,
    },
  });

  // ✅ Mail 2 : uniquement à la toute fin (récap complet + mail admin)
  if (step >= TOTAL_STEPS) {
    const adminTo =
      process.env.ATELIER_ADMIN_EMAIL ?? "laurent.guyonnet.pro@gmail.com";

    await sendFinalEmails({
      userTo: updated.email,
      adminTo,
      data: (updated.data ?? {}) as any,
    });

    redirect("/atelier/fiche/fin");
  }

  // ✅ Sinon : aucun mail, on avance juste
  redirect(`/atelier/fiche/${nextStep}`);
}