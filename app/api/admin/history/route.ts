import { NextResponse } from "next/server";
import { readAdminHistory } from "@/lib/admin-history";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-access";
import { isLocalAdmin } from "@/lib/analytics-auth";
import { GithubContentError, listRepoCommits } from "@/lib/github-content";

export async function GET() {
  if (!(await isAdminRequest())) return adminUnauthorized();
  if (isLocalAdmin()) return NextResponse.json({ source: "local", entries: readAdminHistory() });

  // En ligne, l'historique local n'existe pas : on montre les derniers commits.
  try {
    const commits = await listRepoCommits(50);
    const entries = commits.map((commit) => ({
      id: commit.sha,
      at: commit.date,
      action: commit.author,
      target: `commit ${commit.sha.slice(0, 7)}`,
      summary: commit.message.split("\n")[0],
    }));
    return NextResponse.json({ source: "github", entries });
  } catch (error) {
    const message = error instanceof GithubContentError ? error.message : "Historique GitHub indisponible.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
