"use client";
import { useActionState } from "react";
import { loginGammVert } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginGammVert, { error: "" });
  return <form action={action} className="mx-auto mt-20 max-w-md rounded-2xl border border-neutral-200 bg-white/70 p-7 dark:border-neutral-800 dark:bg-neutral-950/30">
    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Accès privé</p>
    <h1 className="mt-2 font-[var(--font-lora)] text-3xl">Le Jardin Partagé</h1>
    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Entrez vos identifiants pour ouvrir le prototype.</p>
    <label className="mt-6 block text-sm font-medium" htmlFor="username">Identifiant</label>
    <input id="username" name="username" autoComplete="username" required autoFocus className="mt-2 w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 dark:border-neutral-700" />
    <label className="mt-4 block text-sm font-medium" htmlFor="password">Mot de passe</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 dark:border-neutral-700" />
    {state.error ? <p className="mt-3 text-sm text-red-700 dark:text-red-300">{state.error}</p> : null}
    <button disabled={pending} className="mt-5 w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{pending ? "Vérification…" : "Ouvrir le prototype"}</button>
  </form>;
}
