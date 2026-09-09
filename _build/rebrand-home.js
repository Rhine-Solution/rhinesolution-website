// Rebrand the SSR map-legend district stats on the home + projects pages:
// swap the original Mumbai district pairs for Rhine's neutral portfolio tags.
//
// Each page carries four hardcoded SSR stat pairs â€” a count span and a label
// span â€” wrapped in hydration-comment spans, e.g.
//   <!--[-->09 PROJECTS<!--]-->  ...  <!--[-->Central Suburbs<!--]-->
// This module only rewrites the inner text of those wrapped spans; the
// `<!--[-->...<!--]-->` wrappers are preserved byte-for-byte so hydration is
// unaffected. All four districts become `07 PROJECTS` (Rhine has 7 shipped
// projects) with generic labels that carry no Mumbai geography.
//
// Runs AFTER the chrome + absolute-links passes in the merge pipeline. Applies
// to EN pages only â€” locale copies are regenerated later by build-locales.js.

const fs = require('fs');
const path = require('path');

// Ordered [from, to] pairs. `from` is the full wrapped span (unique per file);
// only the inner text changes, so the hydration comments stay intact.
const REPLACEMENTS = [
  ['<!--[-->09 PROJECTS<!--]-->', '<!--[-->07 PROJECTS<!--]-->'],
  ['<!--[-->Central Suburbs<!--]-->', '<!--[-->Web Apps<!--]-->'],
  ['<!--[-->12 PROJECTS<!--]-->', '<!--[-->07 PROJECTS<!--]-->'],
  ['<!--[-->South Mumbai<!--]-->', '<!--[-->Portals<!--]-->'],
  ['<!--[-->18 PROJECTS<!--]-->', '<!--[-->07 PROJECTS<!--]-->'],
  ['<!--[-->Western Suburbs<!--]-->', '<!--[-->Tools<!--]-->'],
  ['<!--[-->06 PROJECTS<!--]-->', '<!--[-->07 PROJECTS<!--]-->'],
  ['<!--[-->Thane<!--]-->', '<!--[-->Research<!--]-->'],
];

const TARGETS = ['index.html', path.join('projects', 'index.html')];

function rebrandHome(mergedRoot, log) {
  const results = [];
  for (const rel of TARGETS) {
    const fp = path.join(mergedRoot, rel);
    if (!fs.existsSync(fp)) {
      if (log) console.log(`  rebrand-home: SKIP (missing ${rel})`);
      continue;
    }
    const before = fs.readFileSync(fp, 'utf8');
    let text = before;
    let changed = 0;
    for (const [from, to] of REPLACEMENTS) {
      const n = text.split(from).length - 1;
      if (n > 0) {
        text = text.split(from).join(to);
        changed += n;
      }
    }
    if (changed > 0) {
      fs.writeFileSync(fp, text, 'utf8');
      if (log) console.log(`  rebrand-home: ${rel.replace(/\\/g, '/')} -> ${changed} replacement(s)`);
      results.push({ file: rel.replace(/\\/g, '/'), replacements: changed });
    } else if (log) {
      console.log(`  rebrand-home: ${rel.replace(/\\/g, '/')} -> 0 replacements (already rebranded?)`);
    }
  }
  return results;
}

module.exports = { rebrandHome };
