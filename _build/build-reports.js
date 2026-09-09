'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'reports');
const ASSETS = 'assets';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Figure type detected from alt/caption keywords.
function figureType(alt, caption) {
  const t = ((alt || '') + ' ' + (caption || '')).toLowerCase();
  if (t.includes('journey')) return 'journey';
  if (t.includes('timeline')) return 'timeline';
  if (t.includes('grouped') || t.includes('categories')) return 'taxonomy';
  if (t.includes('growth')) return 'growth';
  if (t.includes('routine')) return 'routine';
  if (t.includes('country') || t.includes('share')) return 'country';
  return 'timeline';
}

function htmlHead(title, desc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="stylesheet" href="${ASSETS}/dfir.css">
</head>
<body>
<div class="wrap">
<header class="sitebar">
  <a class="brand" href="/">Rhine Solution</a>
  <nav>
    <a href="/">Home</a>
    <a href="/about/">About</a>
    <a href="/projects/">Projects</a>
    <a href="/reports/">Reports</a>
    <a href="/news/">News</a>
    <a href="/contact/">Contact</a>
  </nav>
</header>`;
}

function htmlFoot() {
  return `
<footer class="report-footer">
  <nav>
    <a href="/reports/">All reports</a>
    <a href="/projects/">Projects</a>
    <a href="/contact/">Contact</a>
  </nav>
  <p style="font-size:12px;color:var(--muted);margin:0;">Digital forensics &amp; research — Rhine Solution.</p>
</footer>
</div>
<script src="${ASSETS}/chart.umd.js"></script>
<script src="${ASSETS}/chartjs-plugin-datalabels.umd.js"></script>
<script src="${ASSETS}/dfir-charts.js"></script>
</body>
</html>`;
}

function renderBlock(b) {
  let h = '';
  if (b.subsectionHeading) h += `<h3>${esc(b.subsectionHeading)}</h3>`;
  if (b.paragraphs) for (const p of b.paragraphs) h += `<p>${esc(p)}</p>`;
  if (b.bullets) {
    const items = b.bullets.map((bl) => `<li>${esc((bl.strong || '') + (bl.body || ''))}</li>`).join('');
    h += `<ul>${items}</ul>`;
  }
  if (b.h3) h += `<h3>${esc(b.h3)}</h3>`;
  if (b.measures) {
    const items = b.measures.map((m) => `<li>${esc(m)}</li>`).join('');
    h += `<ul>${items}</ul>`;
  }
  if (b.table && b.table.rows) {
    const rows = b.table.rows;
    const caption = b.table.caption ? `<caption><span>Table</span> &middot; ${esc(b.table.caption)}</caption>` : '';
    const thead = rows.length
      ? `<thead><tr>${rows[0].map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>` : '';
    const tbody = rows.slice(1)
      .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    h += `<div class="table-wrap"><table>${caption}${thead}<tbody>${tbody}</tbody></table></div>`;
  }
  if (b.figure) {
    const type = figureType(b.figure.alt, b.figure.caption);
    const tall = (type === 'journey' || type === 'routine') ? ' tall' : '';
    h += `<figure class="figure beveled"><div class="figure-chart${tall}"><canvas data-chart="${type}" role="img" aria-label="${esc(b.figure.alt || '')}"></canvas></div><figcaption>${esc(b.figure.caption || '')}</figcaption></figure>`;
  }
  return h;
}

function renderCybercrime() {
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, 'report-cybercrime.json'), 'utf8'));
  const metaItems = c.meta ? Object.keys(c.meta).filter((k) => k.endsWith('_label')).map((k) => {
    const valKey = k.replace(/_label$/, '_value');
    return `<div><span>${esc(c.meta[k])}</span><span>${esc(c.meta[valKey] || '')}</span></div>`;
  }).join('') : '';

  let body = `<section class="page-head">
    <p class="eyebrow">${esc(c.eyebrow || 'Digital Forensics')}</p>
    <h1 class="page-title">${esc(c.title)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <div class="meta beveled">${metaItems}</div>
  </section>`;

  body += `<section class="section"><h2>${esc(c.executive_summary_heading || 'Executive Summary')}</h2><p>${esc(c.executive_summary)}</p></section>`;

  for (const sec of c.sections) {
    body += `<section class="section"><h2>${esc(sec.heading)}</h2>`;
    if (sec.subsections) for (const sub of sec.subsections) body += renderBlock(sub);
    else body += renderBlock(sec);
    body += `</section>`;
  }

  body += `<section class="section"><h2>${esc(c.references_heading || 'References')}</h2>`;
  body += c.references.map((r) => {
    const href = r.href ? ` <a href="${esc(r.href)}" target="_blank" rel="noopener">[source]</a>` : '';
    return `<li>${esc(r.label)}${href}</li>`;
  }).join('');
  body += `</section>`;
  if (c.references_note) body += `<p style="font-size:12px;color:var(--muted);">${esc(c.references_note)}</p>`;

  return htmlHead(c.meta_title || c.title, c.meta_description || c.lead)
    + body
    + `<div class="cta-row"><a class="btn" href="/reports/">All reports</a><a class="btn btn-primary" href="/reports/zeromeister">View LAB041 case</a></div>`
    + htmlFoot();
}

// ---- LAB041 / ZeroMeister content (from app/dfir/lab041) ----
const ZERO_TABLES = [
  { label: 'Table 1', title: 'Exhibit', caption: 'Seized storage device', rows: [
    ['Property', 'Value'],
    ['Description', 'Old MP3 player'],
    ['Capacity', '\u00b1 114 MB (235,008 sectors)'],
    ['Filesystem', 'FAT variant'],
    ['Serial', '01.00.00'],
    ['Image format', 'E01 (EnCase, compressed)'],
    ['MD5 (image)', '5bd8f6c27acaf66b2b365d32a13e0182'],
    ['SHA-1 (image)', '5370c1b591c1f2172c666f953ed2090e6ecd8fab'],
  ] },
  { label: 'Table 2', title: 'Acquisition', caption: 'Acquisition details', rows: [
    ['Field', 'Value'],
    ['Acquirer', 'Colleague'],
    ['Date / time', '09-09-2022 09:02:09 \u2013 09:07:33 (UTC)'],
    ['Method', 'FTK Imager, USB connection'],
    ['Write-blocker', 'No (not used)', 'strong'],
    ['Hash verified', 'Yes'],
  ] },
  { label: 'Table 3', title: 'Chain of custody', caption: 'Handling of the evidence', rows: [
    ['Date / time', 'From', 'To', 'Action'],
    ['09-09-2022 09:02', 'Crime scene', 'Colleague', 'Seizure'],
    ['09-09-2022 09:07', 'Colleague', 'Forensic env.', 'E01 acquisition (no write-blocker)'],
    ['02-09-2026', 'Forensic env.', 'Investigator', 'Analysis on SFDCD'],
  ] },
  { label: 'Table 6', title: 'Notable items', caption: 'Core evidence (flagged by Autopsy)', rows: [
    ['#', 'File', 'Size', 'Note'],
    ['1', 'REC_0001.WAV', '13,824 B', 'DVR voice recording'],
    ['2', 'REC_0002.WAV', '11,776 B', 'DVR voice recording'],
    ['3', '_rans.doc', '16,384 B', 'Not a valid Word file; unreadable'],
    ['4', 'Special D - Here I Am\u2026mp3', '6,850,560 B', 'Piracy URL in name + tags', 'strong'],
    ['5', 'Special D \u2026mp3-slack', '14,336 B', 'Slack space with same URL'],
    ['6', 'Zoop - Zoop In Afrika.wma', '4,371,037 B', 'Piracy URL in name'],
  ] },
  { label: 'Table 8', title: 'Fact vs Opinion', caption: 'Facts vs. opinions', rows: [
    ['Fact', 'Opinion (not stated)'],
    ['\u201cSpecial D\u2026mp3\u201d contains \u201cwww.djwitek.prv.pl\u201d in its ID3 tags.', 'The user downloaded this track illegally.'],
    ['\u201c_rans.doc\u201d is not a valid Word file and has no readable text.', 'It is a ransom note.'],
    ['3 MP3 files were carved from unallocated space.', 'The suspect deleted incriminating music.'],
    ['No write-blocker was used at acquisition.', 'The entire image is untrustworthy.'],
  ] },
  { label: 'Table 9', title: 'Tools used', caption: 'Tools and method', rows: [
    ['Tool', 'Version', 'Purpose'],
    ['Autopsy / The Sleuth Kit', 'v4.23.1', 'Case analysis, keyword search, tagging, metadata extraction, file carving'],
    ['FTK Imager', '\u2014', 'Acquisition and hash verification'],
    ['Wayback Machine', '\u2014', 'Verifying whether domains were previously active'],
    ['DNS Lookup', '\u2014', 'Domain registration and history lookup'],
  ] },
];

const ZERO_FINDINGS = [
  { id: '6.2', title: 'URL traces to piracy websites', body: 'Two files reference sites distributing music without permission from rights holders. \u201cSpecial D - Here I Am (Extended Mix)(www.djwitek.prv.pl).mp3\u201d contains the URL www.djwitek.prv.pl in its filename and repeatedly in its ID3 tags (TIT2, TPE1, TYER, TRCK). \u201cZoop - Zoop In Afrika (Djeo Madjula).wma\u201d references www.mp3xplosion.com in its filename. The slack space of the Special D MP3 also contains www.djwitek.prv.pl. Keyword search: 3 hits for djwitek.prv.pl, 1 for mp3xplosion.com.' },
  { id: '6.3', title: 'Audio files', body: 'The device holds audio from well-known artists. Autopsy reports 18 tracks in the metadata view, e.g. AFI - Dancing Through Sunday (MP3), Special D - Here I Am (MP3), Top Stars - Spring de wereld in (MP3), and Zoop - Zoop In Afrika (WMA).' },
  { id: '6.4', title: 'DVR recordings', body: 'REC_0001.WAV (13,824 B) and REC_0002.WAV (11,776 B) are short voice-recorder captures \u2014 valid RIFF/WAVE PCM with short robotic sounds. Not relevant to the research question, kept for completeness.' },
  { id: '6.5', title: 'The \u201c_rans.doc\u201d file', body: 'Flagged as a Notable Item. The name suggests a Word document, but it lacks the D0CF11E0 OLE header, contains no readable text, and appears encoded. Modification time 24-04-2005 16:05:34 (CET) fits the device\u2019s usage period. It cannot be opened as-is; the \u201c_rans\u201d name may hint at \u201cransom\u201d, but no conclusion is drawn. Reported as an open point.' },
  { id: '6.6', title: 'File carving (recovered files)', body: 'PhotoRec carved several MP3s from unallocated space \u2014 data that once belonged to deleted files and was never overwritten. Recovered tracks include \u201cWat Zullen We Drinken\u201d (DJ Sam & Moos) and \u201cZwarte cross\u201d (Normaal), indicating the device stored music files that were later deleted.' },
];

function zeroTable(t) {
  const thead = `<thead><tr>${t.rows[0].map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>`;
  const tbody = t.rows.slice(1).map((r) => {
    const strong = r[r.length - 1] === 'strong';
    const cells = strong ? r.slice(0, -1) : r;
    return `<tr${strong ? ' class="is-strong"' : ''}>${cells.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`;
  }).join('');
  return `<figure class="table-wrap"><table><caption><span>${esc(t.label)}</span> &middot; ${esc(t.title)} \u2014 ${esc(t.caption)}</caption>${thead}<tbody>${tbody}</tbody></table></figure>`;
}

function renderZeroMeister() {
  const metaItems = [
    ['Case', 'LAB041'], ['Title', 'Oude MP3-speler'], ['Classification', 'Vertrouwelijk'], ['Report date', '02-09-2026'],
  ].map((r) => `<div><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join('');

  let body = `<section class="page-head">
    <p class="eyebrow">Digital Forensics &middot; Case LAB041</p>
    <h1 class="page-title">LAB041 \u2014 Oude MP3-speler</h1>
    <p class="lead">A court-ready digital forensics report. Forensic examination of an old MP3 player seized in a suspected copyright-infringement case, tracing illegally downloaded music through file metadata, slack space and carved data.</p>
    <div class="meta beveled">${metaItems}</div>
  </section>`;

  body += `<section class="section"><h2>1 &middot; Executive Summary</h2><p>An old MP3 player was seized in connection with an alleged copyright infringement. The examination focuses on whether illegally obtained music is present on the device. Multiple audio files were found with URL references to known piracy websites in their filenames and ID3 metadata. Deleted MP3s \u2014 including copyrighted tracks \u2014 were also recovered (carved) from unallocated space. The 2022 acquisition used no write-blocker, a limitation for evidence integrity that does not affect the core findings.</p></section>`;

  body += `<section class="section"><h2>2 &middot; Research Question</h2><blockquote>\u201cIs there evidence on the seized MP3 player of (presumably) illegally obtained music, and if so, which evidence?\u201d</blockquote><p>Sub-questions: which audio files are present and what is their origin; are there signs of download from illegal sources; are there deleted or recovered files; and are there other notable files (e.g. \u201c_rans.doc\u201d).</p></section>`;

  body += `<section class="section"><h2>3 &middot; Evidence &amp; Acquisition</h2>${zeroTable(ZERO_TABLES[0])}${zeroTable(ZERO_TABLES[1])}<p style="font-size:13px;color:var(--muted);">No write-blocker was used during acquisition. A write-blocker prevents writes to the source disk when connected; without it the host OS can alter metadata (e.g. last-access times in the FAT table). This limitation is accounted for in interpretation.</p>${zeroTable(ZERO_TABLES[2])}</section>`;

  body += `<section class="section"><h2>4 &middot; Tools &amp; Method</h2><p>Analysis system: SFDCD (Windows 8, 64-bit). Autopsy \u201cingest\u201d ran its automatic analysis routine (metadata, hashes, categorisation); Wayback Machine and DNS lookup verified URL origins.</p>${zeroTable(ZERO_TABLES[5])}</section>`;

  body += `<section class="section"><h2>5 &middot; Findings</h2>`;
  body += ZERO_FINDINGS.map((f) => `<div class="finding beveled"><h3><span class="finding-id">${esc(f.id)}</span> ${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`).join('');
  body += zeroTable(ZERO_TABLES[3]) + `</section>`;

  body += `<section class="section"><h2>7 &middot; Analysis &amp; Interpretation</h2><p>The URL traces in filenames and ID3 metadata point toward download via online piracy sites (www.djwitek.prv.pl and www.mp3xplosion.com) \u2014 domains not known as official distribution channels. The filename-with-URL format is characteristic of these sites\u2019 auto-generated downloads. Metadata indicates active use in 2004\u20132005, consistent with the sites being active in that period. The carved MP3s demonstrate that audio files were stored and later deleted, without any record of legitimate purchases.</p><p>Hashes (MD5 and SHA-1) match the original acquisition; the image was not altered after acquisition. The missing write-blocker is a limitation but does not affect the core findings.</p></section>`;

  body += `<section class="section"><h2>8 &middot; Conclusion</h2><p>Yes \u2014 the seized MP3 player contains evidence of (presumably) illegally obtained music:</p><ul><li>Multiple audio files reference download sites in their filenames and ID3 metadata.</li><li>A matching URL was found in the slack space of an MP3 file.</li><li>Several deleted MP3s \u2014 including copyrighted tracks \u2014 were recovered from unallocated space.</li></ul><p style="font-size:13px;color:var(--muted);">Nuance: possessing protected music on a player is not itself a criminal act \u2014 the Dutch Auteurswet targets reproduction and disclosure. The combined URL traces, however, form a strong indication the music was obtained through illegal channels. Criminality is for the Public Prosecution Service and the court to decide.</p><p>Open points: further (cryptographic) examination of \u201c_rans.doc\u201d, and examination of the host computer for browser downloads and URL origins.</p></section>`;

  body += `<section class="section"><h2>9 &middot; Fact versus Opinion</h2><p>The report strictly separates facts from interpretation:</p>${zeroTable(ZERO_TABLES[4])}</section>`;

  body += `<section class="section"><h2>10 &middot; References</h2><ul><li>DFIR Onderzoeksgids v1.0</li><li>NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response</li><li>Auteurswet (Aw) &middot; Wetboek van Strafvordering (Sv) &middot; AVG/GDPR</li></ul></section>`;

  return htmlHead('LAB041 — Oude MP3-speler | Digital Forensics', 'A digital forensics case study: examination of an old MP3 player, tracing pirated music via metadata, slack space and file carving.')
    + body
    + `<div class="cta-row"><a class="btn" href="/reports/">All reports</a><a class="btn btn-primary" href="/reports/cybercrime">View Cybercrime report</a></div>`
    + htmlFoot();
}

function renderIndex() {
  const body = `<section class="page-head">
    <p class="eyebrow">Digital Forensics &amp; Research</p>
    <h1 class="page-title">Reports</h1>
    <p class="lead">Case studies and research reports from Rhine Solution \u2014 digital forensics examinations and published research.</p>
  </section>
  <section class="card-grid">
    <a class="card beveled" href="/reports/cybercrime">
      <h3>Cybercrime &amp; Cybersecurity Report</h3>
      <p>Keuzedeel K1352 research report: how the internet works, what cybercrime is, how big the problem is, who commits it and why, and how to protect yourself.</p>
      <span class="cta">Read report &rarr;</span>
    </a>
    <a class="card beveled" href="/reports/zeromeister">
      <h3>LAB041 \u2014 Oude MP3-speler</h3>
      <p>Digital forensics case: examination of an old MP3 player, tracing pirated music via metadata, slack space and file carving. Case by ZeroMeister.</p>
      <span class="cta">Read case &rarr;</span>
    </a>
  </section>`;
  return htmlHead('Reports | Digital Forensics & Research — Rhine Solution', 'Digital forensics case studies and research reports from Rhine Solution.')
    + body + htmlFoot();
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'cybercrime.html'), renderCybercrime());
fs.writeFileSync(path.join(OUT, 'zeromeister.html'), renderZeroMeister());
fs.writeFileSync(path.join(OUT, 'index.html'), renderIndex());
console.log('SRC', path.relative(ROOT, __filename));
console.log('Generated /reports/: cybercrime.html, zeromeister.html, index.html');
