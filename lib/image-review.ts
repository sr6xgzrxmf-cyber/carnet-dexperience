import "server-only";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getAllArticles } from "./articles";

export type ImageReference = {
  file: string;
  articleSlug: string;
  articleTitle: string;
  articleDate: string | null;
};

export type ImageCandidate = {
  file: string;
  familyKey: string;
  size: number;
  modifiedAt: string;
  category: "article-image" | "orphan-canonical" | "legacy-alias" | "related-variant";
  articleReference?: ImageReference;
};

export type ImageDuplicateGroup = {
  hash: string;
  files: string[];
  previewFile: string;
  referencedCanonicals: ImageReference[];
  orphanCanonicals: string[];
  legacyAliases: string[];
  duplicateCount: number;
  kind: "shared-article-image" | "safe-alias";
  selectionCandidates: ImageCandidate[];
};

export type ImageReviewSummary = {
  totalFiles: number;
  duplicateGroups: number;
  safeAliasGroups: number;
  sharedArticleImageGroups: number;
  safeAliasFiles: number;
  sharedArticleFiles: number;
};

export type ImageReviewData = {
  summary: ImageReviewSummary;
  safeAliasGroups: ImageDuplicateGroup[];
  sharedArticleImageGroups: ImageDuplicateGroup[];
};

const imagesDirectory = path.join(process.cwd(), "public", "images", "articles");

function isImageFile(fileName: string) {
  return /\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

function isCanonicalArticleImage(fileName: string) {
  return /^\d{4}-\d{2}-\d{2}-.+\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

function toFamilyKey(fileName: string) {
  const extless = fileName.replace(/\.[^.]+$/, "").trim().toLowerCase();
  let current = extless;

  while (true) {
    const next = current
      .replace(/\s+\(\d+\)$/i, "")
      .replace(/[ _-](copy|copie)$/i, "")
      .replace(/[ _-]\d+$/i, "")
      .trim();
    if (next === current) return next;
    current = next;
  }
}

function toArticleDate(value: unknown): string | null {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return null;
}

export function getImageReviewData(): ImageReviewData {
  const files = fs.readdirSync(imagesDirectory).filter(isImageFile).sort((a, b) => a.localeCompare(b, "fr"));
  const fileMeta = new Map(
    files.map((file) => {
      const fullPath = path.join(imagesDirectory, file);
      const stat = fs.statSync(fullPath);
      return [
        file,
        {
          file,
          familyKey: toFamilyKey(file),
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        },
      ] as const;
    })
  );

  const referencedByFile = new Map<string, ImageReference>();
  for (const article of getAllArticles({ includeFuture: true })) {
    const cover = typeof article.meta.cover === "string" ? article.meta.cover : "";
    if (!cover) continue;
    const file = path.basename(cover);
    referencedByFile.set(file, {
      file,
      articleSlug: article.slug,
      articleTitle: article.meta.title ?? article.slug,
      articleDate: toArticleDate(article.meta.date),
    });
  }

  const groupsByHash = new Map<string, string[]>();
  for (const file of files) {
    const fullPath = path.join(imagesDirectory, file);
    const hash = crypto.createHash("sha1").update(fs.readFileSync(fullPath)).digest("hex");
    const list = groupsByHash.get(hash) ?? [];
    list.push(file);
    groupsByHash.set(hash, list);
  }

  const safeAliasGroups: ImageDuplicateGroup[] = [];
  const sharedArticleImageGroups: ImageDuplicateGroup[] = [];

  for (const [hash, groupedFiles] of groupsByHash.entries()) {
    if (groupedFiles.length < 2) continue;

    const referencedCanonicals: ImageReference[] = [];
    const orphanCanonicals: string[] = [];
    const legacyAliases: string[] = [];

    for (const file of groupedFiles.slice().sort((a, b) => a.localeCompare(b, "fr"))) {
      const reference = referencedByFile.get(file);

      if (reference) {
        referencedCanonicals.push(reference);
        continue;
      }

      if (isCanonicalArticleImage(file)) {
        orphanCanonicals.push(file);
      } else {
        legacyAliases.push(file);
      }
    }

    const duplicateCount = groupedFiles.length;
    const familyKeys = new Set(groupedFiles.map((file) => fileMeta.get(file)?.familyKey).filter(Boolean));
    const candidateFiles = new Set(groupedFiles);

    for (const [file, meta] of fileMeta.entries()) {
      if (familyKeys.has(meta.familyKey)) {
        candidateFiles.add(file);
      }
    }

    const selectionCandidates = Array.from(candidateFiles)
      .flatMap((file) => {
        const meta = fileMeta.get(file);
        if (!meta) return [];

        const reference = referencedByFile.get(file);
        let category: ImageCandidate["category"];

        if (reference) {
          category = "article-image";
        } else if (groupedFiles.includes(file) && isCanonicalArticleImage(file)) {
          category = "orphan-canonical";
        } else if (groupedFiles.includes(file)) {
          category = "legacy-alias";
        } else {
          category = "related-variant";
        }

        return [
          {
            file,
            familyKey: meta.familyKey,
            size: meta.size,
            modifiedAt: meta.modifiedAt,
            category,
            articleReference: reference,
          } satisfies ImageCandidate,
        ];
      })
      .sort((a, b) => {
        const order: Record<ImageCandidate["category"], number> = {
          "article-image": 0,
          "related-variant": 1,
          "orphan-canonical": 2,
          "legacy-alias": 3,
        };

        if (order[a.category] !== order[b.category]) {
          return order[a.category] - order[b.category];
        }

        return a.file.localeCompare(b.file, "fr");
      });

    if (referencedCanonicals.length > 1) {
      sharedArticleImageGroups.push({
        hash,
        files: groupedFiles,
        previewFile: referencedCanonicals[0]?.file ?? groupedFiles[0],
        referencedCanonicals,
        orphanCanonicals,
        legacyAliases,
        duplicateCount,
        kind: "shared-article-image",
        selectionCandidates,
      });
      continue;
    }

    if (referencedCanonicals.length === 1) {
      safeAliasGroups.push({
        hash,
        files: groupedFiles,
        previewFile: referencedCanonicals[0].file,
        referencedCanonicals,
        orphanCanonicals,
        legacyAliases,
        duplicateCount,
        kind: "safe-alias",
        selectionCandidates,
      });
    }
  }

  const sortGroups = (items: ImageDuplicateGroup[]) =>
    items.sort((a, b) => {
      if (b.referencedCanonicals.length !== a.referencedCanonicals.length) {
        return b.referencedCanonicals.length - a.referencedCanonicals.length;
      }
      if (b.duplicateCount !== a.duplicateCount) {
        return b.duplicateCount - a.duplicateCount;
      }
      return a.previewFile.localeCompare(b.previewFile, "fr");
    });

  sortGroups(safeAliasGroups);
  sortGroups(sharedArticleImageGroups);

  return {
    summary: {
      totalFiles: files.length,
      duplicateGroups: safeAliasGroups.length + sharedArticleImageGroups.length,
      safeAliasGroups: safeAliasGroups.length,
      sharedArticleImageGroups: sharedArticleImageGroups.length,
      safeAliasFiles: safeAliasGroups.reduce((total, group) => total + group.duplicateCount, 0),
      sharedArticleFiles: sharedArticleImageGroups.reduce((total, group) => total + group.duplicateCount, 0),
    },
    safeAliasGroups,
    sharedArticleImageGroups,
  };
}
