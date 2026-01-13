import Link from "next/link";
import ContactButton from "@/components/ContactButton";
import ContactForm from "@/components/ContactForm";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbddjpnq";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-900 dark:text-neutral-100 text-[14px] leading-[1.55]">
      {/* Navigation */}
      <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/" className="hover:underline">
          ← Accueil
        </Link>
        <Link href="/parcours" className="hover:underline">
          Parcours
        </Link>
        <Link href="/articles" className="hover:underline">
          Articles
        </Link>

        <ContactButton
          label="Contact"
          className="hover:underline text-sm text-neutral-600 dark:text-neutral-400"
        />
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Un message, une question, une proposition&nbsp;: écris-moi ici.
        </p>
      </header>

      <ContactForm action={FORMSPREE_ENDPOINT} />

      <footer className="mt-14 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-sm text-neutral-600 dark:text-neutral-400">
        <p>
          Ou directement :{" "}
          <a
            className="underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-500"
            href="mailto:laurent.guyonnet@gmail.com"
          >
            laurent.guyonnet@gmail.com
          </a>
        </p>
      </footer>
    </main>
  );
}