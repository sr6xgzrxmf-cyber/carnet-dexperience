"use client";

import { useState } from "react";
import styles from "@/app/editorial-system.module.css";

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
        setMessage("Message envoyé. Merci, je vous répondrai rapidement.");
        return;
      }

      setStatus("error");
      setMessage("Impossible d’envoyer le message. Réessayez dans un instant.");
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        styles.form,
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

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Votre nom"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="votreadresse@exemple.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="subject">
            Sujet
          </label>
          <input
            id="subject"
            name="subject"
            placeholder="Quelle situation souhaitez-vous clarifier ?"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            placeholder="Le contexte, ce qui résiste et ce que vous aimeriez rendre plus clair…"
            required
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={status === "sending"}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            {status === "sending" ? "Envoi…" : "Envoyer le message"}
          </button>

          {showEmailButton ? (
            <a
              href="mailto:laurent.guyonnet.pro@gmail.com"
              className={`${styles.button} ${styles.buttonSecondary}`}
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
        <p className={styles.formNote}>
          Votre message m’est transmis par email via Formspree. Il n’est utilisé
          que pour vous répondre.
        </p>
      </div>
    </form>
  );
}
