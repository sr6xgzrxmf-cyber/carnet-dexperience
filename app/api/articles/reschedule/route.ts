import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { findLocalArticleFile } from "@/lib/local-article-files";
import { normalizeArticleDate } from "@/lib/article-date";
import { appendAdminHistory } from "@/lib/admin-history";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-access";
import { isLocalAdmin } from "@/lib/analytics-auth";
import { commitRepoChanges, GithubContentError, ONLINE_SAVE_NOTICE, readRepoFile } from "@/lib/github-content";

type Body = { slug: string; date: string };

function writeCanonicalDateInFrontmatter(raw: string, date: string) {
  // Le format canonique du site reste : date: "2026-01-25"
  return raw.replace(
    /^date:\s*.*$/m,
    `date: "${date}"`
  );
}

function rescheduled(raw: string, newDate: string) {
  const parsed = matter(raw);
  const previousDate = normalizeArticleDate(parsed.data?.date);
  const nextData = { ...parsed.data, date: newDate };
  const nextRaw = writeCanonicalDateInFrontmatter(matter.stringify(parsed.content ?? "", nextData), newDate);
  return { previousDate, nextRaw };
}

// Rename si le slug commence par une date
// ex: 2026-01-10-mon-article => 2026-01-25-mon-article
function rescheduledSlug(slug: string, newDate: string) {
  const m = slug.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  return m && m[1] !== newDate ? `${newDate}-${m[2]}` : slug;
}

export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) return adminUnauthorized();

  const body = (await req.json()) as Body;

  if (!body?.slug || !body?.date) {
    return NextResponse.json({ error: "Missing slug or date" }, { status: 400 });
  }

  const newDate = normalizeArticleDate(body.date);
  if (!newDate) {
    return NextResponse.json(
      { error: "Invalid date. Expected a calendar date such as 2026-01-25." },
      { status: 400 }
    );
  }

  const oldSlug = body.slug;
  const oldPath = findLocalArticleFile(oldSlug);

  if (!oldPath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const newSlug = rescheduledSlug(oldSlug, newDate);
  const newPath = path.join(path.dirname(oldPath), `${newSlug}.md`);
  if (newSlug !== oldSlug && fs.existsSync(newPath)) {
    return NextResponse.json(
      { error: `Target filename already exists: ${newSlug}.md` },
      { status: 409 }
    );
  }

  if (!isLocalAdmin()) {
    // En ligne : on part de la version du dépôt (la plus récente) et on commite.
    const oldRepoPath = path.relative(process.cwd(), oldPath).split(path.sep).join("/");
    const newRepoPath = path.posix.join(path.posix.dirname(oldRepoPath), `${newSlug}.md`);
    try {
      const { previousDate, nextRaw } = rescheduled(await readRepoFile(oldRepoPath), newDate);
      await commitRepoChanges(
        `Admin : décale « ${oldSlug} » du ${previousDate ?? "sans date"} au ${newDate}`,
        newSlug === oldSlug
          ? [{ path: oldRepoPath, content: nextRaw }]
          : [{ path: newRepoPath, content: nextRaw }, { path: oldRepoPath, content: null }]
      );
    } catch (error) {
      const message = error instanceof GithubContentError ? error.message : "Enregistrement GitHub impossible.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    return NextResponse.json({ ok: true, slug: newSlug, renamed: newSlug !== oldSlug, message: ONLINE_SAVE_NOTICE });
  }

  const { previousDate, nextRaw } = rescheduled(fs.readFileSync(oldPath, "utf8"), newDate);

  if (newSlug !== oldSlug) {
    // On renomme d’abord, puis on écrit le contenu modifié dans le nouveau fichier
    fs.renameSync(oldPath, newPath);
  }
  fs.writeFileSync(newSlug !== oldSlug ? newPath : oldPath, nextRaw, "utf8");
  appendAdminHistory({
    action: "article.reschedule",
    target: newSlug,
    summary: `Date déplacée de ${previousDate ?? "sans date"} à ${newDate}`,
    before: { slug: oldSlug, date: previousDate },
    after: { slug: newSlug, date: newDate },
  });

  return NextResponse.json({ ok: true, slug: newSlug, renamed: newSlug !== oldSlug });
}
