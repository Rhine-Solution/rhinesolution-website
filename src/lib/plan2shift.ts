import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getPlan2ShiftBook(): string {
  const raw = readFileSync(join(process.cwd(), "plan2shift", "PLAN2SHIFT.md"), "utf8");
  return transformPlan2Shift(raw.replace(/\r\n/g, "\n"));
}

// The book ships with an embedded Table of Contents and links to private
// Obsidian notes. We strip the ToC (the reader renders its own, with working
// anchors) and render wiki-links as plain labels so nothing internal leaks.
function transformPlan2Shift(raw: string): string {
  let md = raw;

  // Drop the document title line — the book page header renders it already,
  // and the reader groups the remaining `#` headings (L1/L2/L3/ALL) as categories.
  md = md.replace(/^#[^\n]*\n/, "");

  const tocStart = md.search(/^##[ \t]+Table of Contents[ \t]*$/m);
  if (tocStart >= 0) {
    const afterToc = md.slice(tocStart);
    const sep = afterToc.search(/^\s*(?:---|\*\*\*)\s*$/m);
    if (sep >= 0) {
      md = md.slice(0, tocStart) + afterToc.slice(sep + 1);
    }
  }

  md = md.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_m, target: string) => (target ?? "").trim());

  return md;
}