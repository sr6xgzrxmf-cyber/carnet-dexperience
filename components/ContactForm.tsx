"use client";

import { useState } from "react";

type ContactFormProps = {
  action: string; // Formspree endpoint
  className?: string;
  showEmailButton?: boolean; // NEW
};

export default function ContactForm({
  action,
  className,
  showEmailButton = true, // NEW (par défaut on garde le bouton)
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        form.reset();
        setStatus("success");
        setMessage("Message envoyé. Merci !");
        return;
      }

      setStatus("error");
      setMessage("Impossible d’envoyer le message. Réessaie dans un instant.");
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Vérifie ta connexion et réessaie.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        "mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/50 dark:bg-neutral-950/30",
        className ?? "",
      ].join(" ")}
    >
      {/* anti-spam honeypot */}
      <input
        type="text"
        name="_gotcha"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm font-medium" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            placeholder="Ton nom"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            placeholder="tonmail@exemple.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm font-medium" htmlFor="subject">
            Sujet
          </label>
          <input
            id="subject"
            name="subject"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            placeholder="De quoi s’agit-il ?"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm font-medium" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 px-4 py-3 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            placeholder="Écris-moi ici…"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-xl bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60"
          >
            {status === "sending" ? "Envoi…" : "Envoyer"}
          </button>

          {showEmailButton ? (
            <a
              href="mailto:laurent.guyonnet.pro@gmail.com"
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
            >
              Écrire par email
            </a>
          ) : null}

          {message ? (
            <span
              className={[
                "text-sm",
                status === "success"
                  ? "text-neutral-700 dark:text-neutral-300"
                  : "text-red-700 dark:text-red-300",
              ].join(" ")}
              role="status"
            >
              {message}
            </span>
          ) : null}
        </div>

        {/* petite info */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          En envoyant ce formulaire, tu acceptes que je reçoive ton message par
          email (via Formspree).
        </p>
      </div>
    </form>
  );
}