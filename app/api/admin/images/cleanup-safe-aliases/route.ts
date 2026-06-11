import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getImageReviewData } from "@/lib/image-review";

const IS_LOCAL = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "articles");

export async function POST() {
  if (!IS_LOCAL) {
    return NextResponse.json(
      { error: "Not supported in production. Local-only admin feature." },
      { status: 403 }
    );
  }

  const review = getImageReviewData();

  if (review.sharedArticleImageGroups.length > 0) {
    return NextResponse.json(
      {
        error:
          "Le nettoyage est bloqué tant qu’il reste des images partagées entre plusieurs articles.",
      },
      { status: 409 }
    );
  }

  const filesToDelete = review.safeAliasGroups.flatMap((group) => [
    ...group.orphanCanonicals,
    ...group.legacyAliases,
  ]);

  const deleted: string[] = [];
  for (const file of filesToDelete) {
    const target = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(target)) continue;
    fs.unlinkSync(target);
    deleted.push(file);
  }

  return NextResponse.json({
    ok: true,
    deletedCount: deleted.length,
    deleted,
  });
}
