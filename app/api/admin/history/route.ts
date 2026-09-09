import { NextResponse } from "next/server";
import { readAdminHistory } from "@/lib/admin-history";

const IS_LOCAL = process.env.NODE_ENV !== "production" && !process.env.VERCEL;

export async function GET() {
  if (!IS_LOCAL) {
    return NextResponse.json({ error: "Local-only admin feature." }, { status: 403 });
  }
  return NextResponse.json({ entries: readAdminHistory() });
}
