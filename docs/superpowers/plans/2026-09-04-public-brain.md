# Public Brain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a curated public slice of the private Obsidian Brain as a static, SEO-friendly knowledge base at `/projects/brain`, with a folder/file tree sidebar, rendered in the site's dark-glass style.

**Architecture:** A local publish script copies approved notes from the private vault into a committed `brain/` folder (blocklist + fail-closed secret scan), emitting `brain/manifest.json`. Next.js statically generates `/projects/brain` (explorer + tree) and `/projects/brain/[slug]` (one page per note) from that folder, rendering Markdown with `react-markdown` + `remark-gfm` + `rehype-highlight`, styled via scoped CSS modules.

**Tech Stack:** Node 22, Next.js 15 App Router, `react-markdown`, `remark-gfm`, `rehype-highlight`, `gray-matter`-free inline frontmatter parsing, Node built-in test runner (`node:test`).

## Global Constraints

- Repo is **public**: never render infra/opencode/session/internal content; never commit secrets.
- Vault path: `C:\Users\teoal\Projects\obsidian-vault\Brain`.
- **Private blocklist** (never published): `17-Infrastructure.md`, `10-AI-Assisted-Development.md`, `11-Opencode-Integrations.md`, `16-Token-Efficiency.md`, `Projects/rhinesolution.md`, `Workspace.md`, `Session-Start-rhinesolution.md`, `Obsidian-Setup.md`, `Inbox.md`, `Hypotheses.md`, `Sources.md`, `Home.md`, `Templates/`, `Archive/`, `Canvas/`, `Dailies/`; plus any note with frontmatter `status: archive`.
- **Public set**: `01`–`09`, `12`, `13`, `14`, `Lessons-Learned.md` (as "Journal").
- Folder mapping: `01,02`→plan · `03,04,05`→build · `06,07`→harden · `08,09`→ship · `12,13,14`→knowledge · `Lessons-Learned`→journal.
- Route collision: `project_brain` currently owns `/projects/brain` — remove it from the featured project list and sitemap so the Brain explorer owns the path.
- Note content stays English; UI chrome is localized via `content/{locale}.json`.
- Per git workflow: work on `feat/` branches, run `npm run build` + `npm run typecheck` before every commit, never push directly to `main`.
- New runtime deps allowed: `react-markdown`, `remark-gfm`, `rehype-highlight`. No other new deps.

---

### Task 1: Publish script with fail-closed secret scan (TDD)

**Files:**
- Create: `scripts/publish-brain.mjs`
- Create: `scripts/publish-brain.test.mjs`
- Modify: `package.json` (add `"brain:publish": "node scripts/publish-brain.mjs"` and `"test": "node --test scripts/"`)

**Interfaces:**
- Exports: `publishBrain({ vault, out, force })` → `{ published: string[], skipped: { file: string; reason: string }[] }`; `slugify(name)` → string.
- Consumes: nothing. Produces: `brain/manifest.json` + `brain/<folder>/<file>.md` (consumed by Task 3).

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { publishBrain, slugify } from "./publish-brain.mjs";

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "brain-pub-"));
  const vault = join(dir, "Brain");
  mkdirSync(join(vault, "Projects"), { recursive: true });
  const notes = {
    "01-Core-Principles.md": "---\ntags: [brain]\nstatus: active\n---\n# 01 - Core Principles\n\nFirst principle paragraph here.\n",
    "02-Architecture.md": "# 02 - Architecture\n\nBuild notes.\n",
    "17-Infrastructure.md": "# Infra\n\napi_key = this_is_a_fake_secret_value_12345\n",
    "Projects/rhinesolution.md": "# Project\n\ninternal\n",
    "12-Backlog.md": "---\nstatus: archive\n---\n# Backlog\n\nold\n",
    "Lessons-Learned.md": "# Lessons\n\nLearned a thing.\n",
  };
  for (const [name, body] of Object.entries(notes)) {
    const dirOf = name.includes("/") ? join(vault, name.split("/")[0]) : vault;
    writeFileSync(join(dirOf, name.split("/")[1] ?? name), body);
  }
  const out = join(dir, "brain");
  return { vault, out };
}

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("01-Core-Principles"), "01-core-principles");
  assert.equal(slugify("Lessons-Learned.md"), "lessons-learned");
});

test("publishBrain publishes only the public set, grouped into folders", () => {
  const { vault, out } = fixture();
  const { published, skipped } = publishBrain({ vault, out });
  assert.ok(published.includes("01-core-principles"));
  assert.ok(existsSync(join(out, "plan", "01-Core-Principles.md")));
  assert.ok(existsSync(join(out, "journal", "Lessons-Learned.md")));
  assert.ok(!existsSync(join(out, "17-Infrastructure.md")));
  assert.ok(skipped.some((s) => s.file === "17-Infrastructure.md"));
  assert.ok(skipped.some((s) => s.file === "Projects/rhinesolution.md"));
});

test("publishBrain excludes notes with status: archive", () => {
  const { vault, out } = fixture();
  const { published } = publishBrain({ vault, out });
  assert.ok(!published.includes("12-backlog"));
});

test("publishBrain fails closed on secret patterns", () => {
  const { vault, out } = fixture();
  writeFileSync(join(vault, "02-Architecture.md"), "# 02\n\napi_key = this_is_a_fake_secret_value_54321\n");
  assert.throws(() => publishBrain({ vault, out }), /SECRET SCAN FAILED/i);
  const result = publishBrain({ vault, out, force: true });
  assert.ok(result.skipped.some((s) => s.file === "02-Architecture.md" && s.reason.includes("secret")));
});

test("manifest.json has folders + notes with slug/title/excerpt/folder", () => {
  const { vault, out } = fixture();
  publishBrain({ vault, out, force: true });
  const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"));
  assert.ok(Array.isArray(manifest.folders));
  assert.equal(manifest.notes["01-core-principles"].folder, "plan");
  assert.equal(manifest.notes["01-core-principles"].title, "01 - Core Principles");
  assert.ok(manifest.notes["01-core-principles"].excerpt.length > 0);
  assert.equal(manifest.notes["lessons-learned"].folder, "journal");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './publish-brain.mjs'`

- [ ] **Step 3: Implement `scripts/publish-brain.mjs`**

```js
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function slugify(name) {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FOLDERS = {
  "01-Core-Principles.md": "plan",
  "02-Architecture.md": "plan",
  "03-Backend.md": "build",
  "04-Frontend.md": "build",
  "05-Databases.md": "build",
  "06-Security.md": "harden",
  "07-Testing.md": "harden",
  "08-Deployment-DevOps.md": "ship",
  "09-Code-Review-Production.md": "ship",
  "12-Backlog.md": "knowledge",
  "13-Performance.md": "knowledge",
  "14-Monitoring.md": "knowledge",
  "Lessons-Learned.md": "journal",
};

const PRIVATE_FILES = [
  "17-Infrastructure.md", "10-AI-Assisted-Development.md", "11-Opencode-Integrations.md",
  "16-Token-Efficiency.md", "Projects/rhinesolution.md", "Workspace.md",
  "Session-Start-rhinesolution.md", "Obsidian-Setup.md", "Inbox.md",
  "Hypotheses.md", "Sources.md", "Home.md",
];

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /(?:api[_-]?key|secret|access_token)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}/i,
  /0x[0-9a-fA-F]{20,}/,
  /C:\\Users\\/i,
];

function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) return { data: {}, body: md };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (kv) data[kv[1]] = kv[2];
  }
  return { data, body: md.slice(m[0].length) };
}

function extractExcerpt(body) {
  const p = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith(">"));
  return (p || "").slice(0, 160);
}

function extractTitle(body) {
  const h1 = body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : "Untitled";
}

export function publishBrain({ vault, out, force = false }) {
  if (!existsSync(vault)) throw new Error(`Vault not found: ${vault}`);
  const blocked = [];
  const published = [];
  const skipped = [];

  for (const file of Object.keys(FOLDERS)) {
    const folder = FOLDERS[file];
    if (PRIVATE_FILES.includes(file)) continue;
    const src = join(vault, file);
    if (!existsSync(src)) continue;
    const raw = readFileSync(src, "utf8");
    const { data, body } = parseFrontmatter(raw);
    if (String(data.status || "").trim() === "archive") {
      skipped.push({ file, reason: "status: archive" });
      continue;
    }
    const hit = SECRET_PATTERNS.find((re) => re.test(raw));
    if (hit) {
      blocked.push({ file, reason: `secret pattern: ${hit}` });
      skipped.push({ file, reason: "secret scan" });
      continue;
    }
    mkdirSync(join(out, folder), { recursive: true });
    copyFileSync(src, join(out, folder, file));
    published.push(slugify(file));
  }

  if (blocked.length > 0 && !force) {
    const list = blocked.map((b) => `  - ${b.file} (${b.reason})`).join("\n");
    throw new Error(`SECRET SCAN FAILED: refusing to publish:\n${list}\nRun with --force to skip these files.`);
  }

  const notes = {};
  for (const file of Object.keys(FOLDERS)) {
    if (PRIVATE_FILES.includes(file)) continue;
    const slug = slugify(file);
    if (!published.includes(slug)) continue;
    const raw = readFileSync(join(out, FOLDERS[file], file), "utf8");
    const { body } = parseFrontmatter(raw);
    notes[slug] = {
      slug,
      file: `${FOLDERS[file]}/${file}`,
      title: extractTitle(body),
      folder: FOLDERS[file],
      excerpt: extractExcerpt(body),
      order: Object.keys(FOLDERS).indexOf(file) + 1,
    };
  }

  const folderOrder = ["plan", "build", "harden", "ship", "knowledge", "journal"];
  const folders = folderOrder.map((id) => ({
    id,
    notes: Object.values(notes)
      .filter((n) => n.folder === id)
      .sort((a, b) => a.order - b.order)
      .map((n) => n.slug),
  }));

  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "manifest.json"), JSON.stringify({ folders, notes }, null, 2));
  return { published, skipped };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const vault = process.env.BRAIN_VAULT || "C:/Users/teoal/Projects/obsidian-vault/Brain";
  const out = join(process.cwd(), "brain");
  const force = process.argv.includes("--force");
  try {
    const { published, skipped } = publishBrain({ vault, out, force });
    console.log(`Published ${published.length} notes to brain/.`);
    if (skipped.length) console.log(`Skipped ${skipped.length}:`, skipped.map((s) => s.file).join(", "));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (5 tests)

- [ ] **Step 5: Generate the real brain content and commit**

Run:
```
$env:BRAIN_VAULT = "C:\Users\teoal\Projects\obsidian-vault\Brain"
npm run brain:publish
git add scripts/ package.json brain/ && git status
```
Expected: `brain/plan/*.md`, `brain/build/*.md`, `brain/harden/*.md`, `brain/ship/*.md`, `brain/knowledge/*.md`, `brain/journal/Lessons-Learned.md`, `brain/manifest.json` created; no private file present.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(brain): add publish script with fail-closed secret scan"
```

---

### Task 2: Add `brain/README.md` marker + i18n labels

**Files:**
- Create: `brain/README.md`
- Modify: `content/en.json`, `content/nl.json`

**Interfaces:**
- Produces: `content.brain` object used by Tasks 6–7. Shape:
  `{ title, subtitle, browse, read, back, empty, folders: { plan, build, harden, ship, knowledge, journal } }`

- [ ] **Step 1: Create `brain/README.md`**

```markdown
# brain/

Generated by `npm run brain:publish` from the private Obsidian vault. Do not
edit these files by hand — change the source in the vault and re-run the
publish script. `manifest.json` is the tree/routing source.
```

- [ ] **Step 2: Add `brain` labels to `content/en.json`** (top level, next to `projects`)

```json
"brain": {
  "title": "The Brain",
  "subtitle": "Rhine Solution's living engineering knowledge base — how we think about building software.",
  "browse": "Browse the knowledge base",
  "read": "Read note",
  "back": "Back to the Brain",
  "empty": "The Brain is being prepared. Check back soon.",
  "folders": {
    "plan": "Plan",
    "build": "Build",
    "harden": "Harden",
    "ship": "Ship",
    "knowledge": "Knowledge",
    "journal": "Journal"
  }
}
```

- [ ] **Step 3: Add the same `brain` block to `content/nl.json`** with Dutch translations.

- [ ] **Step 4: Verify JSON validity + typecheck**

Run: `npm run typecheck` (fails until `typeof en` includes `brain` — run after Task 6's page code or add the field; expected to pass once pages exist). To keep the build green here, also run: `node -e "require('./content/en.json'); require('./content/nl.json'); console.log('json ok')"` — but JSON with BOM? Use: `npm run typecheck` only, and confirm no parse errors via `npm run build` later.

- [ ] **Step 5: Commit**

```bash
git add content/ brain/README.md
git commit -m "feat(brain): add brain i18n labels and generated-folder marker"
```

---

### Task 3: Data layer `src/lib/brain.ts`

**Files:**
- Create: `src/lib/brain.ts`

**Interfaces:**
- Exports (consumed by Tasks 6–7 and the sidebar):
  - `type BrainManifest = { folders: { id: string; notes: string[] }[]; notes: Record<string, BrainNoteMeta> }`
  - `type BrainNoteMeta = { slug: string; file: string; title: string; folder: string; excerpt: string; order: number }`
  - `getBrainManifest(): BrainManifest`
  - `getNoteBySlug(slug: string): BrainNoteMeta | undefined`
  - `getNoteMarkdown(slug: string, locale: string): string` (frontmatter stripped, `[[wiki-links]]` resolved)
  - `buildTree(manifest: BrainManifest): { id: string; notes: BrainNoteMeta[] }[]`

- [ ] **Step 1: Implement**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type BrainNoteMeta = {
  slug: string;
  file: string;
  title: string;
  folder: string;
  excerpt: string;
  order: number;
};

export type BrainManifest = {
  folders: { id: string; notes: string[] }[];
  notes: Record<string, BrainNoteMeta>;
};

function brainDir() {
  return join(process.cwd(), "brain");
}

function slugify(name: string): string {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripFrontmatter(md: string): { body: string } {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(md);
  return m ? { body: md.slice(m[0].length) } : { body: md };
}

export function getBrainManifest(): BrainManifest {
  return JSON.parse(readFileSync(join(brainDir(), "manifest.json"), "utf8")) as BrainManifest;
}

export function getNoteBySlug(slug: string): BrainNoteMeta | undefined {
  return getBrainManifest().notes[slug];
}

export function buildTree(manifest: BrainManifest) {
  return manifest.folders
    .map((f) => ({
      id: f.id,
      notes: f.notes.map((slug) => manifest.notes[slug]).filter((n): n is BrainNoteMeta => Boolean(n)),
    }))
    .filter((f) => f.notes.length > 0);
}

export function getNoteMarkdown(slug: string, locale: string): string {
  const note = getNoteBySlug(slug);
  if (!note) throw new Error(`Unknown brain note: ${slug}`);
  const raw = readFileSync(join(brainDir(), note.file), "utf8");
  const { body } = stripFrontmatter(raw);
  const manifest = getBrainManifest();
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, alias) => {
    const targetSlug = slugify(target.trim());
    const resolved = manifest.notes[targetSlug];
    const label = (alias ?? target).trim();
    return resolved ? `[${label}](/en/projects/brain/${resolved.slug})` : label;
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/brain.ts
git commit -m "feat(brain): add data layer (manifest, note content, wiki-link resolution)"
```

---

### Task 4: Markdown renderer component

**Files:**
- Modify: `package.json` (add deps)
- Create: `src/components/brain/BrainMarkdown.tsx`
- Create: `src/components/brain/brain.module.css`

**Interfaces:**
- Consumes: `getNoteMarkdown(slug, locale)` output.
- Exports: `BrainMarkdown({ content }: { content: string })` (used by Task 7).

- [ ] **Step 1: Install deps**

Run: `npm install react-markdown remark-gfm rehype-highlight`

- [ ] **Step 2: Implement `BrainMarkdown.tsx`**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import styles from "./brain.module.css";

type Props = { content: string };

export default function BrainMarkdown({ content }: Props) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children }) => <h2 id={slugFrom(children)}>{children}</h2>,
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function slugFrom(children: React.ReactNode): string {
  const text = String(children ?? "").replace(/\s+/g, " ").trim();
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 3: Implement `brain.module.css`** (scoped dark-glass styling)

```css
.markdown {
  max-width: 68ch;
  color: #e6ecff;
  font-size: 1.05rem;
  line-height: 1.7;
}
.markdown h1, .markdown h2, .markdown h3 { color: #f2f5ff; }
.markdown h1 { font-family: "Cormorant Garamond", serif; font-size: 2.2rem; }
.markdown h2 { font-family: "Cormorant Garamond", serif; font-size: 1.7rem; margin-top: 2.2rem; border-bottom: 1px solid rgba(126,167,255,0.18); padding-bottom: 0.4rem; }
.markdown a { color: #7ea7ff; }
.markdown code { background: rgba(13,26,56,0.6); border-radius: 4px; padding: 0.15rem 0.35rem; font-size: 0.9em; }
.markdown pre { background: rgba(13,26,56,0.6); border: 1px solid rgba(126,167,255,0.18); border-radius: 10px; padding: 1rem; overflow-x: auto; }
.markdown pre code { background: none; padding: 0; }
.markdown blockquote { border-left: 3px solid #2c6bff; margin: 1.2rem 0; padding-left: 1rem; color: rgba(226,234,255,0.8); }
.markdown table { width: 100%; border-collapse: collapse; margin: 1.2rem 0; }
.markdown th, .markdown td { border: 1px solid rgba(126,167,255,0.18); padding: 0.5rem 0.75rem; text-align: left; }
.markdown th { background: rgba(13,26,56,0.6); }
.markdown .hljs-keyword, .markdown .hljs-selector-tag { color: #7ea7ff; }
.markdown .hljs-string, .markdown .hljs-attr { color: #a5d6a7; }
.markdown .hljs-number, .markdown .hljs-literal { color: #ffd54f; }
.markdown .hljs-comment { color: rgba(226,234,255,0.45); }
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/brain/
git commit -m "feat(brain): markdown renderer with custom dark-glass styling"
```

---

### Task 5: Sidebar tree component

**Files:**
- Create: `src/components/brain/BrainSidebar.tsx`
- Modify: `src/components/brain/brain.module.css` (append)

**Interfaces:**
- Consumes: `getBrainManifest()`, `buildTree()`, `content.brain`.
- Exports: `BrainSidebar({ manifest, locale, active }: { manifest: BrainManifest; locale: string; active?: string })`.

- [ ] **Step 1: Implement `BrainSidebar.tsx`** (client component for mobile drawer)

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiFolder, FiFile } from "react-icons/fi";
import type { BrainManifest } from "@/lib/brain";
import styles from "./brain.module.css";

type Props = {
  manifest: BrainManifest;
  locale: string;
  labels: Record<string, string>;
  active?: string;
};

export default function BrainSidebar({ manifest, locale, labels, active }: Props) {
  const [open, setOpen] = useState(false);
  const folders = manifest.folders
    .map((f) => ({ ...f, notes: f.notes.map((s) => manifest.notes[s]).filter(Boolean) }))
    .filter((f) => f.notes.length > 0);

  return (
    <>
      <button type="button" className={styles.treeToggle} onClick={() => setOpen(true)} aria-label="Open brain menu">
        <FiMenu size={18} aria-hidden="true" /> <span>{labels.browse}</span>
      </button>
      <div className={`${styles.tree} ${open ? styles.treeOpen : ""}`}>
        <button type="button" className={styles.treeClose} onClick={() => setOpen(false)} aria-label="Close brain menu">
          <FiX size={18} aria-hidden="true" />
        </button>
        <nav aria-label="Brain notes">
          {folders.map((folder) => (
            <section key={folder.id} className={styles.treeFolder}>
              <h2 className={styles.treeFolderTitle}>
                <FiFolder size={14} aria-hidden="true" /> {labels[folder.id] ?? folder.id}
              </h2>
              <ul className={styles.treeList}>
                {folder.notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      href={`/${locale}/projects/brain/${note.slug}`}
                      className={`${styles.treeLink} ${active === note.slug ? styles.treeLinkActive : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <FiFile size={13} aria-hidden="true" /> {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
      {open && <button type="button" className={styles.treeOverlay} onClick={() => setOpen(false)} aria-label="Close" />}
    </>
  );
}
```

- [ ] **Step 2: Append sidebar styles to `brain.module.css`**

```css
.treeToggle { display: none; align-items: center; gap: 0.5rem; background: rgba(13,26,56,0.6); border: 1px solid rgba(126,167,255,0.18); color: #e6ecff; border-radius: 10px; padding: 0.6rem 1rem; cursor: pointer; margin-bottom: 1rem; }
.tree { position: sticky; top: 5rem; align-self: start; min-width: 230px; max-height: calc(100vh - 8rem); overflow-y: auto; }
.treeClose { display: none; }
.treeOverlay { display: none; }
.treeFolder { margin-bottom: 1.2rem; }
.treeFolderTitle { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(226,234,255,0.6); margin-bottom: 0.4rem; }
.treeList { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.15rem; }
.treeLink { display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.6rem; border-radius: 8px; color: #c9d6ff; font-size: 0.92rem; text-decoration: none; }
.treeLink:hover { background: rgba(126,167,255,0.12); color: #f2f5ff; }
.treeLinkActive { background: rgba(44,107,255,0.25); color: #f2f5ff; }
@media (max-width: 900px) {
  .treeToggle { display: flex; }
  .tree { display: none; position: fixed; inset: 0 0 0 auto; width: min(320px, 85vw); background: #070e24; border-left: 1px solid rgba(126,167,255,0.18); padding: 4.5rem 1.25rem 1.5rem; z-index: 60; }
  .treeOpen { display: block; }
  .treeClose { display: flex; position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #e6ecff; cursor: pointer; }
  .treeOverlay { display: block; position: fixed; inset: 0; background: rgba(7,14,36,0.7); z-index: 50; }
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/brain/
git commit -m "feat(brain): file-tree sidebar with mobile drawer"
```

---

### Task 6: Explorer page `/projects/brain`

**Files:**
- Create: `app/[locale]/projects/brain/page.tsx`
- Modify: `src/components/brain/brain.module.css` (append explorer styles)

**Interfaces:**
- Consumes: `getBrainManifest`, `buildTree`, `BrainSidebar`, `content.brain`, `content.sections`.
- Produces: the explorer page at `/projects/brain`.

- [ ] **Step 1: Implement the page**

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainSidebar from "@/components/brain/BrainSidebar";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getBrainManifest, buildTree } from "@/lib/brain";
import Link from "next/link";
import styles from "@/components/brain/brain.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/projects/brain", { title: c.brain.title, description: c.brain.subtitle });
}

export default async function BrainExplorerPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const manifest = getBrainManifest();
  const tree = buildTree(manifest);
  const labels = content.brain.folders;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <div className={styles.explorer}>
          <BrainSidebar manifest={manifest} locale={locale} labels={labels} />
          <article className={styles.explorerMain}>
            <header className="page-head">
              <p className="section-eyebrow">{content.sections.featured_work}</p>
              <h1>{content.brain.title}</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{content.brain.subtitle}</p>
            </header>
            {tree.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>{content.brain.empty}</p>
            ) : (
              tree.map((folder) => (
                <section key={folder.id} className={styles.explorerFolder}>
                  <h2>{labels[folder.id] ?? folder.id}</h2>
                  <ul className={styles.explorerList}>
                    {folder.notes.map((note) => (
                      <li key={note.slug}>
                        <Link href={`/${locale}/projects/brain/${note.slug}`} className={styles.explorerCard}>
                          <h3>{note.title}</h3>
                          <p>{note.excerpt}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </article>
        </div>
      </main>
      <Footer
        locale={locale}
        brand={content.brand.name}
        tagline={content.footer_columns.brand_tagline}
        navLabels={content.nav}
        footerColumns={content.footer_columns}
        socials={getCompanySocials(content)}
        socialHeading={content.footer.social_heading}
      />
    </>
  );
}
```

- [ ] **Step 2: Append explorer styles to `brain.module.css`**

```css
.explorer { display: flex; gap: 2.5rem; align-items: flex-start; }
.explorerMain { flex: 1; min-width: 0; }
.explorerFolder { margin-top: 2.5rem; }
.explorerFolder > h2 { font-family: "Cormorant Garamond", serif; font-size: 1.4rem; color: #f2f5ff; border-bottom: 1px solid rgba(126,167,255,0.18); padding-bottom: 0.4rem; }
.explorerList { list-style: none; margin: 1rem 0 0; padding: 0; display: grid; gap: 0.75rem; }
.explorerCard { display: block; background: rgba(13,26,56,0.6); border: 1px solid rgba(126,167,255,0.18); border-radius: 10px; padding: 1rem 1.25rem; text-decoration: none; color: inherit; }
.explorerCard:hover { border-color: rgba(126,167,255,0.45); }
.explorerCard h3 { margin: 0 0 0.3rem; font-size: 1.05rem; color: #f2f5ff; }
.explorerCard p { margin: 0; color: rgba(226,234,255,0.75); font-size: 0.95rem; }
@media (max-width: 900px) { .explorer { flex-direction: column; } }
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS; brain explorer static page generated.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/projects/brain/page.tsx" src/components/brain/brain.module.css
git commit -m "feat(brain): explorer page with folder grouping"
```

---

### Task 7: Note page `/projects/brain/[slug]`

**Files:**
- Create: `app/[locale]/projects/brain/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBrainManifest`, `getNoteBySlug`, `getNoteMarkdown`, `BrainSidebar`, `BrainMarkdown`, `content.brain`.

- [ ] **Step 1: Implement the page**

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainSidebar from "@/components/brain/BrainSidebar";
import BrainMarkdown from "@/components/brain/BrainMarkdown";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getBrainManifest, getNoteBySlug, getNoteMarkdown } from "@/lib/brain";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/brain/brain.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const manifest = getBrainManifest();
  return Object.values(manifest.notes).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return { title: "Not found" };
  return buildMetadata(locale, `/projects/brain/${slug}`, {
    title: `${note.title} — ${getContent(locale).brand.name}`,
    description: note.excerpt,
  });
}

export default async function BrainNotePage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const note = getNoteBySlug(slug);
  if (!note) notFound();
  const manifest = getBrainManifest();
  const md = getNoteMarkdown(slug, locale);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <div className={styles.explorer}>
          <BrainSidebar manifest={manifest} locale={locale} labels={content.brain.folders} active={slug} />
          <article className={styles.explorerMain}>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={`/${locale}/projects`}>{content.nav.projects}</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/${locale}/projects/brain`}>{content.brain.title}</Link>
              <span aria-hidden="true"> / </span>
              <span>{note.title}</span>
            </nav>
            <BrainMarkdown content={md} />
            <p className={styles.noteBack}>
              <Link href={`/${locale}/projects/brain`}>← {content.brain.back}</Link>
            </p>
          </article>
        </div>
      </main>
      <Footer
        locale={locale}
        brand={content.brand.name}
        tagline={content.footer_columns.brand_tagline}
        navLabels={content.nav}
        footerColumns={content.footer_columns}
        socials={getCompanySocials(content)}
        socialHeading={content.footer.social_heading}
      />
    </>
  );
}
```

- [ ] **Step 2: Append crumbs/back styles to `brain.module.css`**

```css
.crumbs { display: flex; gap: 0.5rem; align-items: center; font-size: 0.85rem; color: rgba(226,234,255,0.6); margin-bottom: 1.5rem; flex-wrap: wrap; }
.crumbs a { color: #7ea7ff; text-decoration: none; }
.crumbs a:hover { text-decoration: underline; }
.noteBack { margin-top: 3rem; }
.noteBack a { color: #7ea7ff; text-decoration: none; }
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS; note pages generated for every slug × both locales.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/projects/brain/[slug]/page.tsx" src/components/brain/brain.module.css
git commit -m "feat(brain): static note pages with breadcrumbs"
```

---

### Task 8: Resolve the `/projects/brain` route collision + sitemap

**Files:**
- Modify: `app/[locale]/projects/page.tsx:23` (remove `project_brain` from the featured list)
- Modify: `app/sitemap.ts` (remove `brain` from projects; add brain URLs)

**Interfaces:**
- Consumes: `getBrainManifest()` for sitemap note slugs.

- [ ] **Step 1: Remove `project_brain` from the projects index**

In `app/[locale]/projects/page.tsx`, change:
```tsx
const items = getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini", "project_music"]);
```
to:
```tsx
const items = getProjects(content, ["project_rhinesolution", "project_macmini", "project_music"]);
```

- [ ] **Step 2: Update `app/sitemap.ts`**

Change `const projects = ["rhinesolution", "brain", "macmini", "music"];` to `const projects = ["rhinesolution", "macmini", "music"];`, and inside the locale loop add the brain URLs:

```ts
import type { MetadataRoute } from "next";
import { getBrainManifest } from "@/lib/brain";

// inside the locales loop, after the projects loop:
entries.push({
  url: `${base}/${locale}/projects/brain`,
  lastModified: now,
  changeFrequency: "weekly",
  priority: 0.7,
  alternates: { languages: languages("/projects/brain") },
});
for (const note of Object.values(getBrainManifest().notes)) {
  entries.push({
    url: `${base}/${locale}/projects/brain/${note.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: { languages: languages(`/projects/brain/${note.slug}`) },
  });
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/projects/page.tsx" app/sitemap.ts
git commit -m "feat(brain): own /projects/brain path + sitemap entries"
```

---

### Task 9: Docs + Brain vault sync

**Files:**
- Modify: `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` (repo)
- Modify (private vault, separate repo): `Brain/Projects/rhinesolution.md`, `Brain/Session-Start-rhinesolution.md`, `Brain/12-Backlog.md`

- [ ] **Step 1: Repo docs**

Add to `docs/ARCHITECTURE.md` a "Public Brain" bullet under Key flows. Update `docs/ROADMAP.md` "Now" to note the Brain shipped. Add a `2026-09-04` entry to `docs/CHANGELOG.md`: `feat(brain): public knowledge base at /projects/brain (publish script + renderer)`.

- [ ] **Step 2: Vault notes**

In `Brain/Projects/rhinesolution.md`: add the Brain section + latest commit to the feature list. In `Brain/Session-Start-rhinesolution.md`: note the brain route + `npm run brain:publish` reminder. In `Brain/12-Backlog.md`: mark section H brain items done (add a checked `H14 — public brain`). Commit vault changes separately (`docs(vault): public brain shipped`).

- [ ] **Step 3: Commit**

```bash
git add docs/
git commit -m "docs: record public brain feature"
```

---

### Task 10: Final integration — merge to `main` + verify live

**Files:** none (orchestration).

- [ ] **Step 1: Run full local checks**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all PASS

- [ ] **Step 2: Push branch + open PR (or merge per owner approval)**

Per AGENTS.md workflow: push `feat/public-brain`, get owner review, then merge to `main`. After merge, Vercel auto-deploys.

- [ ] **Step 3: Smoke test the live site**

- `https://rhinesolution.com/en/projects/brain` renders the explorer with folders + files.
- Open any note, e.g. `/en/projects/brain/01-core-principles` — content styled, sidebar highlights active note.
- Mobile width (<900px): tree drawer toggles via the menu button.
- A note containing a table/code/wiki-link renders correctly; wiki-links to published notes are clickable; wiki-links to private notes are plain text.
- `/projects/brain` (project detail) is gone from Projects index; `/en/projects/rhinesolution` still works.

- [ ] **Step 4: Update Brain (private) + commit**

Record the release in `Brain/Lessons-Learned.md` (template) and commit vault.

---

## Self-Review Notes

- **Spec coverage:** pipeline (T1) ✓, routing (T6–7) ✓, tree menu (T5) ✓, markdown+design (T4) ✓, SEO/sitemap (T8) ✓, safety (T1 fail-closed + T1 test) ✓, testing (T1 node:test + build gates) ✓, i18n (T2) ✓, docs/Brain (T9) ✓.
- **Collision:** `project_brain` removed from projects list + sitemap (T8) so the static explorer owns `/projects/brain` — flag to owner.
- **Note:** `Home.md` is treated as private (it references the whole internal structure) — matches the approved boundary (public = 01–09, 12–14, Lessons-Learned).