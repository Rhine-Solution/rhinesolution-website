import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";

const cwd = process.cwd();
const entries = [];

// Brain notes
const manifestPath = join(cwd, "brain", "manifest.json");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const note of Object.values(manifest.notes)) {
    let body = "";
    try {
      const raw = readFileSync(join(cwd, "brain", note.file), "utf8");
      body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/\[\[([^\]|#]+)(?:[^\]])*\]\]/g, "$1");
    } catch {
      body = "";
    }
    entries.push({
      id: `brain-${note.slug}`,
      title: note.title,
      excerpt: note.excerpt || "",
      body: body.slice(0, 4000),
      url: `/en/projects/brain/${note.slug}`,
      type: "Brain",
      folder: note.folder,
      tags: note.tags ?? [],
    });
  }
}

// News posts (per locale)
for (const locale of ["en", "nl"]) {
  const dir = join(cwd, "content", "news", locale);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))) {
    const text = readFileSync(join(dir, file), "utf8");
    const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
    const data = {};
    if (fm) {
      for (const line of fm[1].split("\n")) {
        const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
        if (kv) data[kv[1]] = kv[2].replace(/^"|"$/g, "").trim();
      }
    }
    const slug = file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    entries.push({
      id: `news-${locale}-${slug}`,
      title: data.title || slug,
      excerpt: data.excerpt || "",
      url: `/${locale}/news/${slug}`,
      type: "News",
    });
  }
}

const out = join(cwd, "public", "search-index.json");
mkdirSync(join(cwd, "public"), { recursive: true });
writeFileSync(out, JSON.stringify(entries), "utf8");
console.log(`Wrote search index: ${entries.length} entries (${out}).`);