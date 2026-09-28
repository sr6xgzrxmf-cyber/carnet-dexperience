import "server-only";

// En ligne, les fichiers du site sont en lecture seule : l'administration
// enregistre ses modifications par un commit sur GitHub, puis Vercel redéploie.

const API = "https://api.github.com";
const repository = () => process.env.GITHUB_REPOSITORY || "sr6xgzrxmf-cyber/carnet-dexperience";
const branch = () => process.env.GITHUB_BRANCH || "main";

export class GithubContentError extends Error {}

async function github<T>(route: string, init?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GithubContentError("GITHUB_TOKEN n’est pas configuré sur Vercel.");
  const res = await fetch(`${API}/repos/${repository()}${route}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "carnet-dexperience-admin",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GithubContentError(`GitHub a refusé la requête (${res.status}). ${detail.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

const encodePath = (filePath: string) => filePath.split("/").map(encodeURIComponent).join("/");

export async function readRepoFile(filePath: string): Promise<string> {
  const file = await github<{ content: string }>(
    `/contents/${encodePath(filePath)}?ref=${encodeURIComponent(branch())}`
  );
  return Buffer.from(file.content, "base64").toString("utf8");
}

// content: null supprime le fichier (utile pour un renommage).
export type RepoChange = { path: string; content: string | null };

export async function commitRepoChanges(message: string, changes: RepoChange[]) {
  const ref = await github<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(branch())}`);
  const parent = await github<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
  const tree = await github<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: changes.map((change) =>
        change.content === null
          ? { path: change.path, mode: "100644", type: "blob", sha: null }
          : { path: change.path, mode: "100644", type: "blob", content: change.content }
      ),
    }),
  });
  const commit = await github<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(branch())}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}

export async function listRepoPaths(prefix: string): Promise<Set<string>> {
  const tree = await github<{ tree: Array<{ path: string; type: string }> }>(
    `/git/trees/${encodeURIComponent(branch())}?recursive=1`
  );
  return new Set(
    tree.tree.filter((entry) => entry.type === "blob" && entry.path.startsWith(prefix)).map((entry) => entry.path)
  );
}

export type RepoCommit = { sha: string; message: string; date: string; author: string };

export async function listRepoCommits(limit = 50): Promise<RepoCommit[]> {
  const commits = await github<Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } | null };
  }>>(`/commits?sha=${encodeURIComponent(branch())}&per_page=${limit}`);
  return commits.map((item) => ({
    sha: item.sha,
    message: item.commit.message,
    date: item.commit.author?.date ?? "",
    author: item.commit.author?.name ?? "",
  }));
}

export const ONLINE_SAVE_NOTICE =
  "Enregistré sur GitHub : le site sera à jour après le redéploiement (1 à 2 minutes).";
