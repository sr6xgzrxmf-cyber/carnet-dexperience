import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
const kindLabel: Record<string, string> = { human: "Humain", ai: "Robot IA", ai_referral: "Arrivée depuis une IA" };

export default async function AnalyticsDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [events, humanSessions, aiVisits, aiReferralSessions] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.analyticsEvent.findMany({ where: { kind: "human", eventType: "page_view", createdAt: { gte: since }, sessionId: { not: null } }, distinct: ["sessionId"], select: { sessionId: true } }),
    prisma.analyticsEvent.count({ where: { kind: "ai", createdAt: { gte: since } } }),
    prisma.analyticsEvent.findMany({ where: { kind: "ai_referral", eventType: "page_view", createdAt: { gte: since }, sessionId: { not: null } }, distinct: ["sessionId"], select: { sessionId: true } }),
  ]);
  return <div>
    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">30 derniers jours</p>
    <h1 className="mt-2 font-[var(--font-lora)] text-4xl">Visiteurs humains et IA</h1>
    <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">Les sessions humaines restent anonymes. Les robots sont reconnus par la signature qu’ils déclarent.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[["Sessions humaines", humanSessions.length], ["Visites de robots IA", aiVisits], ["Sessions depuis une IA", aiReferralSessions.length]].map(([title, value]) =>
        <section key={String(title)} className="rounded-2xl border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800 dark:bg-neutral-950/20"><p className="text-sm text-neutral-500">{title}</p><strong className="mt-2 block text-3xl">{value}</strong></section>)}
    </div>
    <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 px-5 py-4 font-semibold dark:border-neutral-800">Activité récente</div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="text-neutral-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Session</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Page</th><th className="px-5 py-3">Source</th></tr></thead>
        <tbody>{events.map((event) => <tr key={event.id} className="border-t border-neutral-200 dark:border-neutral-800"><td className="whitespace-nowrap px-5 py-3">{event.createdAt.toLocaleString("fr-FR")}</td><td className="px-5 py-3 font-mono text-xs text-neutral-500">{event.sessionId?.slice(0, 8) ?? "—"}</td><td className="px-5 py-3">{kindLabel[event.kind] ?? event.kind}</td><td className="max-w-md truncate px-5 py-3">{event.path}</td><td className="max-w-sm truncate px-5 py-3">{event.source ?? event.referrer ?? "Accès direct"}</td></tr>)}
          {!events.length ? <tr><td colSpan={5} className="px-5 py-10 text-center text-neutral-500">Aucune visite enregistrée pour le moment.</td></tr> : null}</tbody>
      </table></div>
    </section>
  </div>;
}
