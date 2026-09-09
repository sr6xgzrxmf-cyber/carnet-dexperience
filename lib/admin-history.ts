import "server-only";

import fs from "fs";
import path from "path";
import crypto from "crypto";

export type AdminHistoryEntry = {
  id: string;
  at: string;
  action: string;
  target: string;
  summary: string;
  before?: unknown;
  after?: unknown;
};

const HISTORY_DIR = path.join(process.cwd(), ".admin");
const HISTORY_FILE = path.join(HISTORY_DIR, "editorial-history.json");
const MAX_ENTRIES = 300;

export function readAdminHistory(): AdminHistoryEntry[] {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function appendAdminHistory(
  entry: Omit<AdminHistoryEntry, "id" | "at">
): AdminHistoryEntry {
  const next: AdminHistoryEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ...entry,
  };
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.writeFileSync(
    HISTORY_FILE,
    JSON.stringify([next, ...readAdminHistory()].slice(0, MAX_ENTRIES), null, 2) + "\n",
    "utf8"
  );
  return next;
}
