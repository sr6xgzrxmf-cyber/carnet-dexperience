import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isLocalAdmin } from "@/lib/analytics-auth";

const run = promisify(execFile);
const git = (...args: string[]) =>
  run("git", args, { cwd: process.cwd(), timeout: 15_000 }).then(({ stdout }) => stdout.trim());

// En local : repère les commits faits depuis l'administration en ligne
// (ou ailleurs) qui ne sont pas encore sur cet ordinateur.
export async function GET() {
  if (!isLocalAdmin()) return NextResponse.json({ behind: 0, commits: [] });

  try {
    const branch = process.env.GITHUB_BRANCH || "main";
    await git("fetch", "--quiet", "origin", branch);
    const range = `HEAD..origin/${branch}`;
    const behind = Number(await git("rev-list", "--count", range)) || 0;
    const commits = behind
      ? (await git("log", range, "--format=%s", "-10")).split("\n").filter(Boolean)
      : [];
    return NextResponse.json({ behind, commits });
  } catch {
    // Hors connexion ou dépôt indisponible : pas de rappel plutôt qu'une erreur.
    return NextResponse.json({ behind: 0, commits: [], unavailable: true });
  }
}
