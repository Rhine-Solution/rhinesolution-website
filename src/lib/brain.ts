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

function stripLinksFooter(body: string): string {
  const re = /^##[ \t]+Links[ \t]*$/gm;
  let last = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) last = m.index;
  if (last < 0) return body;
  const lineEnd = body.indexOf("\n", last);
  const after = lineEnd < 0 ? "" : body.slice(lineEnd + 1);
  if (/^#{1,6}[ \t]/m.test(after)) return body;
  return body.slice(0, last);
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
  const manifest = getBrainManifest();
  const note = manifest.notes[slug];
  if (!note) throw new Error(`Unknown brain note: ${slug}`);
  const raw = readFileSync(join(brainDir(), note.file), "utf8");
  const { body } = stripFrontmatter(raw);
  const withoutFooter = stripLinksFooter(body);
  return withoutFooter.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, alias) => {
    const targetSlug = slugify(target.trim());
    const resolved = manifest.notes[targetSlug];
    const label = (alias ?? target).trim();
    if (resolved) return `[${label}](/${locale}/projects/brain/${resolved.slug})`;
    return alias !== undefined ? label : "";
  });
}