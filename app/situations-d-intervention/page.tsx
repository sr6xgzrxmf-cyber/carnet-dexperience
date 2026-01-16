// app/situations-d-intervention/page.tsx
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/parcours";
import fs from "fs";
import path from "path";

function stripFrontMatter(md: string) {
  // enlève un bloc YAML en tête: --- ... ---
  return md.replace(/^---\s*[\s\S]*?\s*---\s*/m, "");
}

export default async function SituationsInterventionPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "situations-d-intervention",
    "page.md"
  );

  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const markdown = stripFrontMatter(raw);
  const contentHtml = await markdownToHtml(markdown);

  return (
    <section>
      <div className="mx-auto max-w-3xl">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Situations d’intervention
          </h1>
          <p className="text-neutral-700 dark:text-neutral-300">
            Contextes dans lesquels j’interviens pour clarifier, transmettre ou
            faire adopter des usages complexes.
          </p>
        </header>

        <article
  className="
    mt-10 max-w-none
    text-neutral-900 dark:text-neutral-100

    [&_p]:m-0
    [&_p]:leading-7
    [&_p+_p]:mt-3

    [&_h2]:mt-10
    [&_h2]:mb-3
    [&_h2]:text-xl
    [&_h2]:font-semibold
    [&_h2]:tracking-tight
    [&_h2]:border-b
    [&_h2]:border-neutral-200
    dark:[&_h2]:border-neutral-800
    [&_h2]:pb-3

    [&_blockquote]:my-6
    [&_blockquote]:rounded-2xl
    [&_blockquote]:border
    [&_blockquote]:border-neutral-200
    dark:[&_blockquote]:border-neutral-800
    [&_blockquote]:bg-white/60
    dark:[&_blockquote]:bg-neutral-950/30
    [&_blockquote]:p-5
    [&_blockquote]:text-[14px]
    [&_blockquote]:leading-6
    [&_blockquote]:text-neutral-800
    dark:[&_blockquote]:text-neutral-200

    [&_ul]:mt-4
    [&_ul]:grid
    [&_ul]:grid-cols-1
    md:[&_ul]:grid-cols-2
    [&_ul]:gap-3
    [&_ul]:list-none
    [&_ul]:p-0

    [&_li]:rounded-2xl
    [&_li]:border
    [&_li]:border-neutral-200
    dark:[&_li]:border-neutral-800
    [&_li]:bg-white/50
    dark:[&_li]:bg-neutral-950/30
    [&_li]:p-4
    [&_li]:leading-6

    [&_a]:underline
    [&_a]:underline-offset-4
    [&_a]:decoration-neutral-500/50
    hover:[&_a]:decoration-neutral-400

    [&_hr]:hidden
  "
  dangerouslySetInnerHTML={{ __html: contentHtml }}
/>
      </div>
    </section>
  );
}