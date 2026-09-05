import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseConventional,
  isNewsOnlyCommit,
  slugify,
  categoryForType,
  formatDraft,
  latestNewsDate,
  writeDrafts,
  TYPES,
} from "./news-from-git.mjs";

test("parseConventional parses feat/fix/refactor/perf and rejects others", () => {
  assert.deepEqual(parseConventional("feat(news): add detail pages"), { type: "feat", scope: "news", description: "add detail pages" });
  assert.deepEqual(parseConventional("merge: feat/cybercrime-report"), { type: "merge", scope: null, description: "feat/cybercrime-report" });
  assert.equal(TYPES.includes("merge"), false);
  assert.equal(parseConventional('Revert "feat: x"'), null);
  assert.equal(parseConventional("some random message"), null);
  assert.deepEqual(parseConventional("perf: faster build"), { type: "perf", scope: null, description: "faster build" });
});

test("isNewsOnlyCommit is true only when every file is under content/news/", () => {
  assert.ok(isNewsOnlyCommit(["content/news/en/x.md", "content/news/_drafts/y.md"]));
  assert.ok(!isNewsOnlyCommit(["content/news/en/x.md", "src/lib/news.ts"]));
  assert.ok(!isNewsOnlyCommit([]));
});

test("categoryForType maps conventional types", () => {
  assert.equal(categoryForType("feat"), "feature");
  assert.equal(categoryForType("fix"), "fix");
  assert.equal(categoryForType("refactor"), "update");
  assert.equal(categoryForType("perf"), "update");
});

test("formatDraft builds a frontmatter markdown draft", () => {
  const { slug, content } = formatDraft({ date: "2026-09-05", title: "Add news page v2", description: "A short summary.", type: "feat" });
  assert.equal(slug, "2026-09-05-add-news-page-v2");
  assert.match(content, /^---\n/);
  assert.match(content, /^date: 2026-09-05$/m);
  assert.match(content, /^title: Add news page v2$/m);
  assert.match(content, /^excerpt: A short summary\.$/m);
  assert.match(content, /^category: feature$/m);
});

test("latestNewsDate returns the max date across locale folders", () => {
  const cwd = mkdtempSync(join(tmpdir(), "news-git-"));
  mkdirSync(join(cwd, "content", "news", "en"), { recursive: true });
  mkdirSync(join(cwd, "content", "news", "nl"), { recursive: true });
  writeFileSync(join(cwd, "content", "news", "en", "2026-07-15-x.md"), "---\ndate: 2026-07-15\n---\n");
  writeFileSync(join(cwd, "content", "news", "nl", "2026-08-20-y.md"), "---\ndate: 2026-08-20\n---\n");
  assert.equal(latestNewsDate(cwd), "2026-08-20");
});

test("writeDrafts creates draft files and skips existing slugs", () => {
  const cwd = mkdtempSync(join(tmpdir(), "news-git-"));
  const candidates = [
    { date: "2026-09-05", title: "One thing", description: "d", type: "feat" },
    { date: "2026-09-05", title: "Two things", description: "d", type: "fix" },
  ];
  const count = writeDrafts({ cwd, candidates });
  assert.equal(count, 2);
  const dir = join(cwd, "content", "news", "_drafts");
  assert.equal(existsSync(join(dir, "2026-09-05-one-thing.md")), true);
  const second = writeDrafts({ cwd, candidates });
  assert.equal(second, 0);
  assert.match(readFileSync(join(dir, "2026-09-05-two-things.md"), "utf8"), /^category: fix$/m);
});