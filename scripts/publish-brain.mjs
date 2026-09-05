import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function slugify(name) {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const base = (file) => file.split("/").pop();

const FOLDERS = {
  "Plan/01-Core-Principles.md": "plan",
  "Plan/02-Architecture.md": "plan",
  "Build/03-Backend.md": "build",
  "Build/04-Frontend.md": "build",
  "Build/05-Databases.md": "build",
  "Harden/06-Security.md": "harden",
  "Harden/07-Testing.md": "harden",
  "Ship/08-Deployment-DevOps.md": "ship",
  "Ship/09-Code-Review-Production.md": "ship",
  "Operations/12-Backlog.md": "knowledge",
  "Operations/13-Performance.md": "knowledge",
  "Operations/14-Monitoring.md": "knowledge",
  "Lessons-Learned.md": "journal",
};

const PRIVATE_FILES = [
  "Operations/17-Infrastructure.md", "AI/10-AI-Assisted-Development.md", "AI/11-Opencode-Integrations.md",
  "AI/16-Token-Efficiency.md", "Projects/rhinesolution.md", "Workspace.md",
  "Session-Start-rhinesolution.md", "Obsidian-Setup.md", "Inbox.md",
  "Hypotheses.md", "Sources.md", "Home.md",
];

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /(?:api[_-]?key|secret|access_token)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}/i,
  /0x[0-9a-fA-F]{20,}/,
  /[0-9a-f]{32,}/i,
  /\bAuthorization\s*:/i,
  /C:\\Users\\/i,
];

function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) return { data: {}, body: md, raw: null };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (kv) data[kv[1]] = kv[2];
  }
  return { data, body: md.slice(m[0].length), raw: m[0] };
}

function stripLinksFooter(body) {
  const re = /^##[ \t]+Links[ \t]*$/gm;
  let last = -1;
  let m = null;
  while ((m = re.exec(body)) !== null) last = m.index;
  if (last < 0) return body;
  const lineEnd = body.indexOf("\n", last);
  const after = lineEnd < 0 ? "" : body.slice(lineEnd + 1);
  if (/^#{1,6}[ \t]/m.test(after)) return body;
  return body.slice(0, last);
}

function scrubLinks(body, publicSlugs) {
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (full, target, alias) => {
    if (publicSlugs.has(slugify(target.trim()))) return full;
    return alias !== undefined ? alias.trim() : "";
  });
}

function extractExcerpt(body) {
  let inFence = false;
  for (const rawLine of body.split("\n")) {
    if (/^\s{4,}/.test(rawLine) || /^\t/.test(rawLine)) continue;
    const l = rawLine.trim();
    if (l.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (
      l.length === 0 ||
      l.startsWith("#") ||
      /^[-*] /.test(l) ||
      /^\d+\./.test(l) ||
      l.startsWith(">") ||
      l.includes("|")
    ) {
      continue;
    }
    return stripInlineMarkdown(l).slice(0, 160);
  }
  const quote = body.split("\n").map((x) => x.trim()).find((l) => l.startsWith(">") && l.trim().length > 2);
  return stripInlineMarkdown(quote || "").replace(/^>\s*/, "").slice(0, 160);
}

function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function extractTitle(body) {
  const h1 = body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : "Untitled";
}

export function publishBrain({ vault, out, force = false }) {
  if (!existsSync(vault)) throw new Error(`Vault not found: ${vault}`);
  rmSync(out, { recursive: true, force: true });
  const blocked = [];
  const published = [];
  const skipped = [];
  const publishedBodies = {};

  const candidates = [...new Set([...Object.keys(FOLDERS), ...PRIVATE_FILES])];
  for (const file of candidates) {
    const folder = FOLDERS[file];
    if (PRIVATE_FILES.includes(file)) {
      if (existsSync(join(vault, file))) skipped.push({ file, reason: "private blocklist" });
      continue;
    }
    const src = join(vault, file);
    if (!existsSync(src)) continue;
    const raw = readFileSync(src, "utf8");
    const { data, body: rawBody, raw: rawFront } = parseFrontmatter(raw);
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
    const slug = slugify(base(file));
    published.push(slug);
    publishedBodies[slug] = { body: rawBody, folder, front: rawFront };
  }

  const publicSlugs = new Set(published);
  for (const [slug, { body, folder, front }] of Object.entries(publishedBodies)) {
    const file = Object.keys(FOLDERS).find((f) => slugify(base(f)) === slug);
    const outBody = scrubLinks(stripLinksFooter(body), publicSlugs);
    const content = front === null ? outBody : front + outBody;
    mkdirSync(join(out, folder), { recursive: true });
    writeFileSync(join(out, folder, base(file)), content);
    publishedBodies[slug] = { body: outBody, folder };
  }

  if (blocked.length > 0 && !force) {
    const list = blocked.map((b) => `  - ${b.file} (${b.reason})`).join("\n");
    throw new Error(`SECRET SCAN FAILED: refusing to publish:\n${list}\nRun with --force to skip these files.`);
  }

  const notes = {};
  for (const [slug, { body, folder }] of Object.entries(publishedBodies)) {
    const file = Object.keys(FOLDERS).find((f) => slugify(base(f)) === slug);
    notes[slug] = {
      slug,
      file: `${folder}/${base(file)}`,
      title: extractTitle(body),
      folder,
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
  writeFileSync(
    join(out, "README.md"),
    [
      "# brain/",
      "",
      "Generated by `npm run brain:publish` from the private Obsidian vault. Do not",
      "edit these files by hand \u2014 change the source in the vault and re-run the",
      "publish script. `manifest.json` is the tree/routing source.",
      "",
    ].join("\n")
  );
  return { published, skipped };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const vault = process.env.BRAIN_VAULT;
  if (!vault) {
    console.error("BRAIN_VAULT env var is required (path to the private Brain vault).");
    process.exit(1);
  }
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