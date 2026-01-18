import { Resend } from "resend";
import { STEPS, TOTAL_STEPS } from "@/lib/atelier/steps";

const resend = new Resend(process.env.RESEND_API_KEY!);

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.carnetdexperience.fr";
}

function fromAddress() {
  return "Carnet d’expérience <atelier@carnetdexperience.fr>";
}

function formatRecap(data: Record<string, any>) {
  const lines: string[] = [];

  for (const step of STEPS) {
    lines.push(`${step.id}. ${step.title}`);
    for (const field of step.fields) {
      const raw = String((data?.[field.name] ?? "")).trim();
      lines.push(`- ${field.label}: ${raw.length ? raw : "(vide)"}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function formatRecapHtml(data: Record<string, any>) {
  const blocks = STEPS.map((step) => {
    const items = step.fields
      .map((field) => {
        const raw = String((data?.[field.name] ?? "")).trim();
        return `<li><strong>${escapeHtml(field.label)} :</strong> ${escapeHtml(raw || "(vide)")}</li>`;
      })
      .join("");

    return `
      <div style="margin:16px 0;">
        <div style="font-weight:700; margin-bottom:6px;">${step.id}. ${escapeHtml(step.title)}</div>
        <ul style="margin:0; padding-left:18px;">${items}</ul>
      </div>
    `;
  }).join("");

  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45;">
      ${blocks}
    </div>
  `.trim();
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendStartCodeEmail(args: { to: string; code: string }) {
  const base = siteUrl();

  await resend.emails.send({
    from: fromAddress(),
    to: args.to,
    subject: "Atelier de posture — ton code de reprise",
    text: [
      "Tu peux commencer maintenant, ou reprendre plus tard.",
      "",
      `Ton code (6 caractères) : ${args.code}`,
      "",
      `Pour reprendre : ${base}/atelier/fiche/reprendre`,
      "",
      "Pas de spam. Un seul mail par étape.",
    ].join("\n"),
  });
}

export async function sendStepEmail(args: { to: string; step: number; recap: string }) {
  const left = Math.max(0, TOTAL_STEPS - args.step);

  await resend.emails.send({
    from: fromAddress(),
    to: args.to,
    subject: `Atelier de posture — étape ${args.step}/${TOTAL_STEPS} validée (reste ${left})`,
    text: [
      "Bien joué.",
      "Tu viens de clarifier quelque chose de concret.",
      "",
      `Étape ${args.step}/${TOTAL_STEPS} enregistrée.`,
      left > 0 ? `Il te reste ${left} étape${left > 1 ? "s" : ""}.` : "Tout est bouclé.",
      "",
      "Récap de ce que tu viens d’écrire :",
      args.recap || "(vide)",
      "",
      `Reprendre : ${siteUrl()}/atelier/fiche/reprendre`,
      "Pas de spam. Un seul mail par étape.",
    ].join("\n"),
  });
}

export async function sendFinalEmails(args: {
  userTo: string;
  adminTo: string;
  data: Record<string, any>;
}) {
  const recapText = formatRecap(args.data ?? {});
  const recapHtml = formatRecapHtml(args.data ?? {});
  const subject = "Atelier de posture — fiche complétée";

  const userText = [
    "C’est envoyé ✅",
    "",
    "Merci. J’ai bien reçu ta fiche.",
    "Je reviens vers toi prochainement.",
    "",
    "Récap de ta fiche :",
    recapText,
  ].join("\n");

  const adminText = [
    "Nouvelle fiche complétée ✅",
    "",
    `De : ${args.userTo}`,
    "",
    "Récap :",
    recapText,
  ].join("\n");

  await Promise.all([
    resend.emails.send({
      from: fromAddress(),
      to: args.userTo,
      subject,
      text: userText,
      html: `<p><strong>C’est envoyé ✅</strong></p><p>Merci. J’ai bien reçu ta fiche. Je reviens vers toi prochainement.</p><hr/>${recapHtml}`,
    }),
    resend.emails.send({
      from: fromAddress(),
      to: args.adminTo,
      subject: `[ADMIN] ${subject} — ${args.userTo}`,
      text: adminText,
      html: `<p><strong>Nouvelle fiche complétée ✅</strong></p><p>De : <strong>${escapeHtml(args.userTo)}</strong></p><hr/>${recapHtml}`,
    }),
  ]);
}