import ContactForm from "@/components/ContactForm";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbddjpnq";

export default function ContactPage() {
  return (
    <section className="text-[14px] leading-[1.55]">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Si quelque chose résonne ici, on peut en parler. Que ce soit une réflexion, une situation professionnelle, une transition en cours ou une question encore floue.
Un échange suffit parfois à clarifier.
        </p>
      </header>

      <ContactForm
        action={FORMSPREE_ENDPOINT}
        showEmailButton={false}
      />
    </section>
  );
}