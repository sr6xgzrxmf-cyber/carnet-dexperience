import { prisma } from "@/lib/db";
import { logoutAnalytics } from "./actions";
import RecentJourneys, { buildSessions } from "./RecentJourneys";

export const dynamic = "force-dynamic";
const kindLabel: Record<string, string> = { human: "Humain", ai: "Robot IA", ai_referral: "Arrivée depuis une IA" };
const eventLabel: Record<string, string> = { page_view: "Page vue", internal_click: "Clic interne", outbound_click: "Départ du site", engagement: "Lecture", download: "Téléchargement" };
function metadata(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function display(value: unknown) { return typeof value === "number" || (typeof value === "string" && value) ? String(value) : "—"; }

export default async function AnalyticsDashboard({ searchParams }: { searchParams: Promise<{ moi?: string }> }) {
  const showOwn = (await searchParams).moi === "1";
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const consentSince = new Date();
  consentSince.setUTCHours(0, 0, 0, 0);
  consentSince.setUTCDate(consentSince.getUTCDate() - 29);
  await prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: since } } });
  const [events, humanPageViews, aiVisits, aiReferralSessions, consentCounts] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since }, kind: { not: "consent" } }, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.analyticsEvent.findMany({ where: { kind: "human", eventType: "page_view", createdAt: { gte: since }, sessionId: { not: null } }, select: { sessionId: true, metadata: true } }),
    prisma.analyticsEvent.count({ where: { kind: "ai", createdAt: { gte: since } } }),
    prisma.analyticsEvent.findMany({ where: { kind: "ai_referral", eventType: "page_view", createdAt: { gte: since }, sessionId: { not: null } }, distinct: ["sessionId"], select: { sessionId: true } }),
    prisma.analyticsEvent.findMany({ where: { kind: "consent", createdAt: { gte: consentSince } }, select: { eventType: true, metadata: true } }),
  ]);
  const countChoices = (choice: "accepted" | "refused") => consentCounts
    .filter((item) => item.eventType === choice)
    .reduce((sum, item) => {
      const count = metadata(item.metadata).count;
      return sum + (typeof count === "number" ? count : 0);
    }, 0);
  const acceptedChoices = countChoices("accepted");
  const refusedChoices = countChoices("refused");
  const totalChoices = acceptedChoices + refusedChoices;
  const refusalRate = totalChoices ? Math.round((refusedChoices / totalChoices) * 100) : 0;
  const humanSessions = new Set(humanPageViews.map((event) => event.sessionId).filter(Boolean));
  const visitorBySession = new Map(humanPageViews.flatMap((event) => {
    const visitorId = metadata(event.metadata).visitorId;
    return event.sessionId && typeof visitorId === "string" && visitorId ? [[event.sessionId, visitorId] as const] : [];
  }));
  const humanVisitors = new Set(humanPageViews.map((event) => {
    const value = metadata(event.metadata).visitorId;
    return typeof value === "string" && value ? value : event.sessionId ? visitorBySession.get(event.sessionId) ?? event.sessionId : null;
  }).filter(Boolean));
  const journeyEvents = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since }, kind: { in: ["human", "ai_referral"] }, sessionId: { not: null },
      eventType: { in: ["page_view", "engagement", "download"] } },
    orderBy: { createdAt: "desc" }, take: 2000,
  });
  // Un navigateur déjà vu connecté à l'administration est considéré comme le mien.
  const ownVisitors = new Set(journeyEvents.flatMap((event) => {
    const meta = metadata(event.metadata);
    return meta.isAdmin === true && typeof meta.visitorId === "string" ? [meta.visitorId] : [];
  }));
  const allSessions = buildSessions(journeyEvents, ownVisitors, true);
  const visibleSessions = showOwn ? allSessions : buildSessions(journeyEvents, ownVisitors, false);
  const recentSessions = visibleSessions.slice(0, 20);
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-neutral-500">30 derniers jours</p>
    <h1 className="mt-2 font-[var(--font-lora)] text-4xl">Visiteurs humains et IA</h1></div>
    <form action={logoutAnalytics}><button className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">Se déconnecter</button></form></div>
    <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">Un identifiant anonyme permet de reconnaître le même navigateur pendant 30 jours. Il ne permet pas de connaître l’identité réelle de la personne.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[["Visiteurs humains", humanVisitors.size], ["Sessions humaines", humanSessions.size], ["Visites de robots IA", aiVisits], ["Sessions depuis une IA", aiReferralSessions.length]].map(([title, value]) =>
        <section key={String(title)} className="rounded-2xl border border-neutral-200 bg-white/70 p-5 dark:border-neutral-800 dark:bg-neutral-950/20"><p className="text-sm text-neutral-500">{title}</p><strong className="mt-2 block text-3xl">{value}</strong></section>)}
    </div>
    <section className="mt-8 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Choix de mesure d’audience</h2>
        <span className="text-xs text-neutral-500">30 derniers jours · choix enregistrés, pas personnes uniques</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[["Acceptations", acceptedChoices], ["Refus", refusedChoices], ["Part des refus", `${refusalRate} %`]].map(([title, value]) =>
          <div key={String(title)} className="rounded-xl bg-neutral-100/70 p-4 dark:bg-neutral-900/60"><p className="text-sm text-neutral-500">{title}</p><strong className="mt-2 block text-3xl">{value}</strong></div>)}
      </div>
    </section>
    <RecentJourneys sessions={recentSessions} showOwn={showOwn} hiddenCount={allSessions.length - visibleSessions.length} />
    <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 px-5 py-4 font-semibold dark:border-neutral-800">Activité récente</div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="text-neutral-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Visiteur</th><th className="px-5 py-3">Session</th><th className="px-5 py-3">Nature</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Page</th><th className="px-5 py-3">Origine</th><th className="px-5 py-3">Navigateur</th><th className="px-5 py-3">Appareil</th><th className="px-5 py-3">Lieu</th></tr></thead>
        <tbody>{events.map((event) => { const meta = metadata(event.metadata); const location = [meta.city, meta.region, meta.country].filter((item) => typeof item === "string" && item).join(", "); return <tr key={event.id} className="border-t border-neutral-200 align-top dark:border-neutral-800"><td className="whitespace-nowrap px-5 py-3">{event.createdAt.toLocaleString("fr-FR")}</td><td className="px-5 py-3 font-mono text-xs text-neutral-500">{typeof meta.visitorId === "string" ? meta.visitorId.slice(0, 8) : "—"}</td><td className="px-5 py-3 font-mono text-xs text-neutral-500">{event.sessionId?.slice(0, 8) ?? "—"}</td><td className="whitespace-nowrap px-5 py-3">{kindLabel[event.kind] ?? event.kind}</td><td className="whitespace-nowrap px-5 py-3">{eventLabel[event.eventType] ?? event.eventType}{event.eventType === "engagement" ? <span className="block text-xs text-neutral-500">{display(meta.durationSeconds)} s · {display(meta.maxScrollPercent)} %</span> : null}</td><td className="max-w-xs px-5 py-3"><span className="block truncate">{event.path}</span>{meta.destination ? <span className="mt-1 block max-w-xs truncate text-xs text-neutral-500">→ {String(meta.destination)}</span> : null}</td><td className="max-w-xs px-5 py-3"><span className="block truncate">{event.source ?? "Accès direct"}</span>{meta.utmCampaign ? <span className="mt-1 block text-xs text-neutral-500">Campagne : {String(meta.utmCampaign)}</span> : null}</td><td className="whitespace-nowrap px-5 py-3">{display(meta.browser)}<span className="block text-xs text-neutral-500">{display(meta.os)}</span></td><td className="whitespace-nowrap px-5 py-3">{display(meta.device)}<span className="block text-xs text-neutral-500">{display(meta.screen)}</span></td><td className="whitespace-nowrap px-5 py-3">{location || "—"}</td></tr>; })}
          {!events.length ? <tr><td colSpan={10} className="px-5 py-10 text-center text-neutral-500">Aucune visite enregistrée pour le moment.</td></tr> : null}</tbody>
      </table></div>
    </section>
  </div>;
}
