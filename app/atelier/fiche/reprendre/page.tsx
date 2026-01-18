import { resumeWithCode } from "../actions";

export default function ReprendrePage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Reprendre</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Entre ton email et le code reçu par mail (6 caractères).
      </p>

      <form action={resumeWithCode} className="mt-6 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="email"
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 px-4 py-3"
        />
        <input
          name="code"
          required
          maxLength={6}
          placeholder="CODE6"
          className="w-full uppercase tracking-widest rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/15 px-4 py-3"
        />

        <button className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/30 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
          Reprendre
        </button>
      </form>
    </section>
  );
}
