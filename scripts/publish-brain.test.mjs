import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
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
  const out = join(dir, "brain-out");
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