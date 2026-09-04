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