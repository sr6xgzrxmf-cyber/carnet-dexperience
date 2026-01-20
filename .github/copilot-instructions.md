# Copilot instructions — Carnet d’expérience

This is a personal editorial site built with Next.js (App Router).
Changes should be **small, readable, and intentional**.

## Project overview
- Static-first site with Markdown content.
- Articles live in `content/articles/*.md` and use YAML frontmatter.
- Content loading logic is in `lib/articles.ts`.
- Pages and layouts live under `app/` (server components by default).

## How to help effectively
- Prefer **minimal diffs** over large refactors.
- Explain changes briefly when modifying code.
- Respect the existing structure and naming.
- Do not introduce abstractions unless explicitly asked.

## Content rules
- Markdown is editorial, not technical documentation.
- Preserve tone, spacing, and line breaks.
- Do not “optimize” writing or rephrase content unless requested.

## Technical notes
- Next.js App Router.
- Tailwind CSS for styling.
- Prisma exists but is used lightly; avoid touching DB code unless asked.

## Defaults
- Server Components by default.
- Add `"use client"` only when necessary.