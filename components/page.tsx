import Link from "next/link";
import ContactButton from "@/components/ContactButton";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-900 dark:text-neutral-100 text-[14px] leading-[1.55]">
      {/* Navigation */}
      <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/" className="hover:underline">
          ← Accueil
        </Link>
        <Link href="/articles" className="hover:underline">
          Articles
        </Link>
        <Link href="/parcours" className="hover:underline">
          Parcours
        </Link>

        <ContactButton
          label="Contact"
          className="hover:underline text-sm text-neutral-600 dark:text-neutral-400"
        />
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="text-neutral-700 dark:text-neutral-300">
          Un message, une question, une proposition — écris-moi.
        </p>
      </header>

      {/* Formulaire */}
      <section className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/30 p-6">
        <form
          action="https://formspree.io/f/mbddjpnq"
          method="POST"
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100"
              placeholder="Ton nom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Message</label>
            <textarea
              name="message"
              required
              rows={7}
              className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100"
              placeholder="Écris ton message ici…"
            />
          </div>

          {/* Sujet de l’email */}
          <input
            type="hidden"
            name="_subject"
            value="Nouveau message — Carnet d’expérience"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/40 px-5 py-2 text-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition"
          >
            Envoyer
          </button>
        </form>

        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
          Les messages arrivent directement dans ton Gmail.
        </p>
      </section>
    </main>
  );
}