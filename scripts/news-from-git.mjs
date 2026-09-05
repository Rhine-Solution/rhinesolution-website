import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const TYPES = ["feat", "fix", "refactor", "perf"];

export function parseConventional(subject) {
  const m = /^([a-z]+)(\([^)]+\))?!?: (.*)$/.exec(subject.trim());
  if (!m) return null;
  return { type: m[1], scope: m[2] ? m[2].slice(1, -1) : null, description: m[3].trim() };
}

export function isNewsOnlyCommit(changedFiles) {
  return changedFiles.length > 0 && changedFiles.every((f) => f.startsWith("content/news/"));
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function categoryForType(type) {
  if (type === "feat") return "feature";
  if (type === "fix") return "fix";
  return "update";
}

export function formatDraft({ date, title, description, type }) {
  const category = categoryForType(type);
  const slug = `${date}-${slugify(title)}`;
  return {
    slug,
    content: [
      "---",
      `date: ${date}`,
      `title: ${title}`,
      `excerpt: ${description}`,
      `category: ${category}`,
      "---",
      "",
      description,
      "",
    ].join("\n"),
  };
}

export function latestNewsDate(cwd) {
  let latest = "";
  for (const locale of ["en", "nl"]) {
    const dir = join(cwd, "content", "news", locale);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
      const m = /^date:\s*(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(join(dir, f), "utf8"));
      if (m && m[1] > latest) latest = m[1];
    }
  }
  return latest || "2026-01-01";
}

export function collectCandidates({ cwd, since }) {
  const sinceArg = since ? `--since=${since}` : "";
  const log = execFileSync("git", ["log", "--format=%H%x09%ad%x09%s", "--date=iso-strict", sinceArg], {
    cwd,
    encoding: "utf8",
  });
  const candidates = [];
  for (const line of log.trim().split("\n")) {
    if (!line) continue;
    const [sha, date, ...rest] = line.split("\t");
    const subject = rest.join("\t").trim();
    const parsed = parseConventional(subject);
    if (!parsed || !TYPES.includes(parsed.type)) continue;
    const files = execFileSync("git", ["show", "--name-only", "--format=", sha], { cwd, encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (isNewsOnlyCommit(files)) continue;
    candidates.push({
      date: date.slice(0, 10),
      title: parsed.description,
      description: parsed.description,
      type: parsed.type,
    });
  }
  return candidates;
}

export function writeDrafts({ cwd, candidates }) {
  const dir = join(cwd, "content", "news", "_drafts");
  mkdirSync(dir, { recursive: true });
  let count = 0;
  for (const c of candidates) {
    const { slug, content } = formatDraft(c);
    const file = join(dir, `${slug}.md`);
    if (existsSync(file)) continue;
    writeFileSync(file, content);
    count++;
  }
  return count;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const cwd = process.cwd();
  const action = process.argv[2] || "update";
  if (action === "update") {
    const since = latestNewsDate(cwd);
    const candidates = collectCandidates({ cwd, since });
    if (!candidates.length) {
      console.log(`No new conventional commits since ${since}.`);
      process.exit(0);
    }
    const count = writeDrafts({ cwd, candidates });
    console.log(`Wrote ${count} draft(s) to content/news/_drafts/ (skipped ${candidates.length - count} existing).`);
    console.log("Review the drafts, then run `npm run news:accept`.");
  } else if (action === "accept") {
    const drafts = join(cwd, "content", "news", "_drafts");
    if (!existsSync(drafts)) {
      console.log("No drafts found.");
      process.exit(0);
    }
    const files = readdirSync(drafts).filter((f) => f.endsWith(".md"));
    if (!files.length) {
      console.log("No drafts found.");
      process.exit(0);
    }
    for (const f of files) {
      const text = readFileSync(join(drafts, f), "utf8");
      for (const locale of ["en", "nl"]) {
        mkdirSync(join(cwd, "content", "news", locale), { recursive: true });
        writeFileSync(join(cwd, "content", "news", locale, f), text);
      }
    }
    rmSync(drafts, { recursive: true, force: true });
    console.log(`Accepted ${files.length} draft(s) into content/news/{en,nl}/.`);
    console.log("Translate/rewrite the Dutch drafts before committing.");
  } else {
    console.error("Unknown action:", action);
    process.exit(1);
  }
}