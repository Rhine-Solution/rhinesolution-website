import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd, { breadcrumbJsonLd } from "@/components/JsonLd";
import { getContent, defaultLocale } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";

export const metadata: Metadata = {
  title: "LAB041 — Oude MP3-speler",
  description:
    "A digital forensics case study: examination of an old MP3 player, tracing pirated music via metadata, slack space and file carving.",
};

const tables: {
  title: string;
  label: string;
  caption: string;
  rows: { cells: string[]; strong?: boolean }[];
}[] = [
  {
    title: "Exhibit",
    label: "Tabel 1",
    caption: "Seized storage device",
    rows: [
      { cells: ["Property", "Value"] },
      { cells: ["Description", "Old MP3 player"] },
      { cells: ["Capacity", "± 114 MB (235,008 sectors)"] },
      { cells: ["Filesystem", "FAT variant"] },
      { cells: ["Serial", "01.00.00"] },
      { cells: ["Image format", "E01 (EnCase, compressed)"] },
      { cells: ["MD5 (image)", "5bd8f6c27acaf66b2b365d32a13e0182"] },
      { cells: ["SHA-1 (image)", "5370c1b591c1f2172c666f953ed2090e6ecd8fab"] },
    ],
  },
  {
    title: "Acquisition",
    label: "Tabel 2",
    caption: "Acquisition details",
    rows: [
      { cells: ["Field", "Value"] },
      { cells: ["Acquirer", "Colleague"] },
      { cells: ["Date / time", "09-09-2022 09:02:09 – 09:07:33 (UTC)"] },
      { cells: ["Method", "FTK Imager, USB connection"] },
      { cells: ["Write-blocker", "No (not used)"], strong: true },
      { cells: ["Hash verified", "Yes"] },
    ],
  },
  {
    title: "Chain of custody",
    label: "Tabel 3",
    caption: "Handling of the evidence",
    rows: [
      { cells: ["Date / time", "From", "To", "Action"] },
      { cells: ["09-09-2022 09:02", "Crime scene", "Colleague", "Seizure"] },
      { cells: ["09-09-2022 09:07", "Colleague", "Forensic env.", "E01 acquisition (no write-blocker)"] },
      { cells: ["02-09-2026", "Forensic env.", "Investigator", "Analysis on SFDCD"] },
    ],
  },
  {
    title: "Notable items",
    label: "Tabel 6",
    caption: "Core evidence (flagged by Autopsy)",
    rows: [
      { cells: ["#", "File", "Size", "Note"] },
      { cells: ["1", "REC_0001.WAV", "13,824 B", "DVR voice recording"] },
      { cells: ["2", "REC_0002.WAV", "11,776 B", "DVR voice recording"] },
      { cells: ["3", "_rans.doc", "16,384 B", "Not a valid Word file; unreadable"] },
      { cells: ["4", "Special D - Here I Am…mp3", "6,850,560 B", "Piracy URL in name + tags"], strong: true },
      { cells: ["5", "Special D …mp3-slack", "14,336 B", "Slack space with same URL"] },
      { cells: ["6", "Zoop - Zoop In Afrika.wma", "4,371,037 B", "Piracy URL in name"] },
    ],
  },
];

const findings = [
  {
    id: "6.2",
    title: "URL traces to piracy websites",
    body: "Two files reference sites distributing music without permission from rights holders. “Special D - Here I Am (Extended Mix)(www.djwitek.prv.pl).mp3” contains the URL www.djwitek.prv.pl in its filename and repeatedly in its ID3 tags (TIT2, TPE1, TYER, TRCK). “Zoop - Zoop In Afrika (Djeo Madjula).wma” references www.mp3xplosion.com in its filename. The slack space of the Special D MP3 also contains www.djwitek.prv.pl. Keyword search: 3 hits for djwitek.prv.pl, 1 for mp3xplosion.com.",
  },
  {
    id: "6.3",
    title: "Audio files",
    body: "The device holds audio from well-known artists. Autopsy reports 18 tracks in the metadata view, e.g. AFI - Dancing Through Sunday (MP3), Special D - Here I Am (MP3), Top Stars - Spring de wereld in (MP3), and Zoop - Zoop In Afrika (WMA).",
  },
  {
    id: "6.4",
    title: "DVR recordings",
    body: "REC_0001.WAV (13,824 B) and REC_0002.WAV (11,776 B) are short voice-recorder captures — valid RIFF/WAVE PCM with short robotic sounds. Not relevant to the research question, kept for completeness.",
  },
  {
    id: "6.5",
    title: "The “_rans.doc” file",
    body: "Flagged as a Notable Item. The name suggests a Word document, but it lacks the D0CF11E0 OLE header, contains no readable text, and appears encoded. Modification time 24-04-2005 16:05:34 (CET) fits the device's usage period. It cannot be opened as-is; the “_rans” name may hint at “ransom”, but no conclusion is drawn. Reported as an open point.",
  },
  {
    id: "6.6",
    title: "File carving (recovered files)",
    body: "PhotoRec carved several MP3s from unallocated space — data that once belonged to deleted files and was never overwritten. Recovered tracks include “Wat Zullen We Drinken” (DJ Sam & Moos) and “Zwarte cross” (Normaal), indicating the device stored music files that were later deleted.",
  },
];

const tools = [
  { tool: "Autopsy / The Sleuth Kit", version: "v4.23.1", purpose: "Case analysis, keyword search, tagging, metadata extraction, file carving" },
  { tool: "FTK Imager", version: "—", purpose: "Acquisition and hash verification" },
  { tool: "Wayback Machine", version: "—", purpose: "Verifying whether domains were previously active" },
  { tool: "DNS Lookup", version: "—", purpose: "Domain registration and history lookup" },
];

export default function DfirLab041Page() {
  const content = getContent(defaultLocale);
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} />
      <JsonLd
        data={breadcrumbJsonLd("en", [
          { name: "Home", path: "/en" },
          { name: "DFIR Cases", path: "/dfir" },
          { name: "LAB041", path: "/dfir/lab041" },
        ])}
      />
      <main id="main" className="container page">
        <header className="dfir-hero">
          <p className="section-eyebrow">
            <Link href="/dfir" style={{ color: "inherit" }}>Digital Forensics</Link> · Case LAB041
          </p>
          <h1>LAB041 — Oude MP3-speler</h1>
          <p className="dfir-lead">
            A court-ready digital forensics report. Forensic Examination of an old MP3 player seized
            in a suspected copyright-infringement case, tracing illegally downloaded music through file
            metadata, slack space and carved data.
          </p>
          <div className="dfir-meta">
            <span><strong>Case</strong> LAB041</span>
            <span><strong>Title</strong> Oude MP3-speler</span>
            <span><strong>Classification</strong> Vertrouwelijk</span>
            <span><strong>Report date</strong> 02-09-2026</span>
          </div>
        </header>

        <section>
          <h2>1 · Executive Summary</h2>
          <p>
            An old MP3 player was seized in connection with an alleged copyright infringement. The
            examination focuses on whether illegally obtained music is present on the device. Multiple
            audio files were found with URL references to known piracy websites in their filenames and
            ID3 metadata. Deleted MP3s — including copyrighted tracks — were also recovered (carved) from
            unallocated space. The 2022 acquisition used no write-blocker, a limitation for evidence
            integrity that does not affect the core findings.
          </p>
        </section>

        <section>
          <h2>2 · Research Question</h2>
          <blockquote className="dfir-quote">
            “Is there evidence on the seized MP3 player of (presumably) illegally obtained music, and if
            so, which evidence?”
          </blockquote>
          <p>
            Sub-questions: which audio files are present and what is their origin; are there signs of
            download from illegal sources; are there deleted or recovered files; and are there other
            notable files (e.g. “_rans.doc”).
          </p>
        </section>

        <section>
          <h2>3 · Evidence &amp; Acquisition</h2>
          <DfirTable {...tables[0]} />
          <DfirTable {...tables[1]} />
          <p className="dfir-note">
            No write-blocker was used during acquisition. A write-blocker prevents writes to the source
            disk when connected; without it the host OS can alter metadata (e.g. last-access times in the
            FAT table). This limitation is accounted for in interpretation.
          </p>
          <DfirTable {...tables[2]} />
        </section>

        <section>
          <h2>4 · Tools &amp; Method</h2>
          <p>Analysis system: SFDCD (Windows 8, 64-bit). Autopsy “ingest” ran its automatic analysis routine (metadata, hashes, categorisation); Wayback Machine and DNS lookup verified URL origins.</p>
          <div className="dfir-table-wrap">
            <table className="dfir-table">
              <caption><span>Tabel 9</span> &middot; Tools used</caption>
              <thead>
                <tr><th>Tool</th><th>Version</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.tool}><td>{t.tool}</td><td>{t.version}</td><td>{t.purpose}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>5 · Findings</h2>
          {findings.map((f) => (
            <div className="dfir-finding" key={f.id}>
              <h3><span className="dfir-finding-id">{f.id}</span> {f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
          <DfirTable {...tables[3]} />
        </section>

        <section>
          <h2>7 · Analysis &amp; Interpretation</h2>
          <p>
            The URL traces in filenames and ID3 metadata point toward download via online piracy sites
            (www.djwitek.prv.pl and www.mp3xplosion.com) — domains not known as official distribution
            channels. The filename-with-URL format is characteristic of these sites&apos; auto-generated
            downloads. Metadata indicates active use in 2004–2005, consistent with the sites being
            active in that period. The carved MP3s demonstrate that audio files were stored and later
            deleted, without any record of legitimate purchases.
          </p>
          <p>
            Hashes (MD5 and SHA-1) match the original acquisition; the image was not altered after
            acquisition. The missing write-blocker is a limitation but does not affect the core findings.
          </p>
        </section>

        <section>
          <h2>8 · Conclusion</h2>
          <p>Yes — the seized MP3 player contains evidence of (presumably) illegally obtained music:</p>
          <ul className="dfir-conclusion">
            <li>Multiple audio files reference download sites in their filenames and ID3 metadata.</li>
            <li>A matching URL was found in the slack space of an MP3 file.</li>
            <li>Several deleted MP3s — including copyrighted tracks — were recovered from unallocated space.</li>
          </ul>
          <p className="dfir-note">
            Nuance: possessing protected music on a player is not itself a criminal act — the Dutch
            Auteurswet targets reproduction and disclosure. The combined URL traces, however, form a
            strong indication the music was obtained through illegal channels. Criminality is for the
            Public Prosecution Service and the court to decide.
          </p>
          <p>
            Open points: further (cryptographic) examination of “_rans.doc”, and examination of the host
            computer for browser downloads and URL origins.
          </p>
        </section>

        <section>
          <h2>9 · Fact versus Opinion</h2>
          <p>The report strictly separates facts from interpretation:</p>
          <div className="dfir-table-wrap">
            <table className="dfir-table">
              <caption><span>Tabel 8</span> &middot; Facts vs. opinions</caption>
              <thead>
                <tr><th>Fact</th><th>Opinion (not stated)</th></tr>
              </thead>
              <tbody>
                <tr><td>“Special D…mp3” contains “www.djwitek.prv.pl” in its ID3 tags.</td><td>The user downloaded this track illegally.</td></tr>
                <tr><td>“_rans.doc” is not a valid Word file and has no readable text.</td><td>It is a ransom note.</td></tr>
                <tr><td>3 MP3 files were carved from unallocated space.</td><td>The suspect deleted incriminating music.</td></tr>
                <tr><td>No write-blocker was used at acquisition.</td><td>The entire image is untrustworthy.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>10 · References</h2>
          <ul className="dfir-conclusion">
            <li>DFIR Onderzoeksgids v1.0</li>
            <li>NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response</li>
            <li>Auteurswet (Aw) · Wetboek van Strafvordering (Sv) · AVG/GDPR</li>
          </ul>
        </section>

        <div className="dfir-cta">
          <Link href="/dfir" className="btn btn-secondary">Back to all cases</Link>
          <Link href="/en/team/zeromeister" className="btn btn-primary">View ZeroMeister profile</Link>
        </div>
      </main>
      <Footer locale="en" brand={content.brand.name} tagline={content.footer_columns.brand_tagline} navLabels={content.nav} footerColumns={content.footer_columns} socials={getCompanySocials(content)} socialHeading={content.footer.social_heading} />
    </>
  );
}

function DfirTable({ title, label, caption, rows }: (typeof tables)[number]) {
  return (
    <div className="dfir-table-wrap">
      <table className="dfir-table">
        <caption><span>{label}</span> &middot; {title} — {caption}</caption>
        <thead>
          <tr>
            {(rows[0]?.cells ?? []).map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr key={ri} className={row.strong ? "is-strong" : undefined}>
              {row.cells.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
