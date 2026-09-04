# Public Brain — Design

**Date:** 2026-09-04
**Status:** Approved by owner
**Feature:** A public, self-rendered Markdown knowledge base on rhinesolution.com, sourced from the private Obsidian Brain.

## 1. Goal

Publish a curated slice of the private Obsidian Brain as a professional,
SEO-friendly knowledge base on the public site. Visitors browse a file-tree
menu of folders and notes; each note is its own static page. No Obsidian
subscription — we render the Markdown ourselves with the site's design.

## 2. Public / private boundary

The site and repo are **public**. The vault is **private** and must stay that
way.

### Published (public)
- Knowledge notes `01`–`09`, `12`–`14`
- `Lessons-Learned.md` (as an "engineering journal")

### Excluded (private — never rendered)
- `17-Infrastructure.md` (accounts/tokens), `10`/`11`/`16` (opencode/AI tooling)
- `Projects/rhinesolution.md` (deployment state)
- `Workspace.md`, `Session-Start-rhinesolution.md`, `Obsidian-Setup.md`
- `Dailies/`, `Inbox.md`, `Hypotheses.md`, `Sources.md`, `Templates/`,
  `Archive/`, `Canvas/`
- Any note with frontmatter `status: archive`

The exclude list lives in one place (the publish script) so it stays auditable.

## 3. Content pipeline

`brain/` folder in the repo (committed, public) is the build source.

`npm run brain:publish` runs `scripts/publish-brain.mjs`:

1. Read `obsidian-vault/Brain/`.
2. Apply the **blocklist** + exclude `status: archive` notes.
3. **Secret scan (fail-closed):** refuse to publish any file containing
   key/token patterns — `ghp_`, `sk-`, `Bearer `, `Authorization`,
   `api_key`, `[0-9a-f]{32,}`, `0x[0-9a-fA-F]{20,}`, or a Windows absolute path
   (`C:\Users\…`). Log each blocked file and abort unless
   `--force` is passed.
4. Copy public notes into `brain/`, grouped into **folders**:
   - `plan/` → 01, 02
   - `build/` → 03, 04, 05
   - `harden/` → 06, 07
   - `ship/` → 08, 09
   - `knowledge/` → 12, 13, 14
   - `journal/` → Lessons-Learned
5. Normalize: keep original Markdown body; derive `slug`, `title`, `excerpt`
   (first non-heading paragraph), and `order`.
6. Emit `brain/manifest.json` — the single source for the tree and routes.

The published `brain/` folder is committed; Vercel builds from it.

## 4. Routing & pages

Under the localized projects section:

- `/projects/brain` — explorer page: intro + file tree grouped by folder.
- `/projects/brain/[slug]` — one static page per note.

Implementation: `generateStaticParams` reads `brain/manifest.json`; each page
loads its `.md` and renders it. Both pages live in `app/[locale]/projects/brain/`.

**Language:** the explorer UI chrome is localized (EN/NL via the existing
`content/{locale}.json` pattern); the note content stays English (its natural
language). No translation of the knowledge base.

## 5. Tree menu (folders and files)

- Persistent sidebar on every brain page.
  - Desktop: always visible.
  - Mobile: collapsible drawer, toggled from a button.
- Shows folders → files; current note highlighted; one-click navigation
  between notes (each is a normal link).
- Keyboard accessible; no layout shift.

## 6. Markdown rendering & design

- `react-markdown` + `remark-gfm` (tables, task lists, strikethrough,
  autolinks) + `rehype-highlight` (syntax-highlighted code blocks).
- Custom components styled to the site's dark-glass system (navy `#070e24`,
  glass panels, blue accents, Cormorant Garamond + Inter):
  - headings with anchor links
  - tables, blockquote/callouts, lists
  - code blocks with syntax highlighting
  - inline links; `[[wiki-link]]` → resolves to `/projects/brain/<slug>`;
    links to private/unpublished notes render as styled plain text
- Brain styles are **scoped** (CSS module or a `.brain-*` prefix in a
  dedicated stylesheet) so they never affect the main site design.

## 7. SEO

- Per-note `<title>` + description (frontmatter or excerpt).
- Breadcrumbs (`Projects → Brain → Note`).
- Canonical URLs; brain pages added to `app/sitemap.ts`.

## 8. Safety & edge cases

- Unknown slug → 404 (existing `not-found`).
- Broken/private wiki-links → styled plain text (no dead links).
- Empty `brain/` → explorer shows a "coming soon" state.
- Publish script **fails closed** on secret-scan hits; `--force` is an
  explicit override.

## 9. Testing

- Publish script: run against a copy of the vault; verify blocklist
  exclusion and secret-scan behavior (no secrets leak, private notes absent).
- Build includes brain pages; existing CI (lint/typecheck/build) covers it.
- Manual: explorer renders the tree; clicking notes switches pages; mobile
  drawer works; a note with tables/code/wiki-links renders correctly.

## 10. Out of scope (this iteration)

- Search within the brain.
- Translating note content.
- Editing notes from the site.
- Mermaid diagrams / math (not present in current notes).