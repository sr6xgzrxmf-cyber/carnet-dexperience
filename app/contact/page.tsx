import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbddjpnq";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Un échange pour clarifier une situation, une transition ou un besoin d’accompagnement.",
};

export default function ContactPage() {
  return (
    <section className="text-[14px] leading-[1.55]">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Si quelque chose résonne ici, on peut en parler. Une situation à clarifier,
          un cadre à transmettre, une transition en cours ou un sujet encore flou :
          un échange suffit parfois à débloquer l’essentiel.
        </p>
      </header>

      <ContactForm
        action={FORMSPREE_ENDPOINT}
        showEmailButton={false}
      />
    </section>
  );
}
