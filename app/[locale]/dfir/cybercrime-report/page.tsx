import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd, { breadcrumbJsonLd } from "@/components/JsonLd";
import { getContent, locales } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getCompanySocials } from "@/lib/socials";

type Props = { params: Promise<{ locale: string }> };

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/dfir/cybercrime-report", {
    title: c.dfir.cybercrime_report.meta_title,
    description: c.dfir.cybercrime_report.meta_description,
  });
}

export default async function CybercrimeReportPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const report = content.dfir.cybercrime_report;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: content.nav.home, path: `/${locale}` },
          { name: "RAGNAROK", path: `/${locale}/team/ragnarok` },
          { name: report.title, path: `/${locale}/dfir/cybercrime-report` },
        ])}
      />
      <main id="main" className="container page">
        <header className="dfir-hero">
          <p className="section-eyebrow">{report.eyebrow}</p>
          <h1>{report.title}</h1>
          <p className="dfir-lead">{report.lead}</p>
          <div className="dfir-meta">
            <span><strong>{report.meta.course_label}</strong> {report.meta.course_value}</span>
            <span><strong>{report.meta.title_label}</strong> {report.meta.title_value}</span>
            <span><strong>{report.meta.language_label}</strong> {report.meta.language_value}</span>
            <span><strong>{report.meta.date_label}</strong> {report.meta.date_value}</span>
          </div>
        </header>

        <section>
          <h2>{report.executive_summary_heading}</h2>
          <p>{report.executive_summary}</p>
        </section>

        {report.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.subsections.map((sub, si) => {
              const s = sub as {
                heading?: string;
                paragraphs?: string[];
                steps?: { step: number; title: string; body: string }[];
                note?: string;
                protocols?: { term: string; body: string }[];
                table?: { caption: string; rows: string[][] };
                bullets?: { strong: string; body: string }[];
                paragraphs_after?: string[];
                h3?: string;
                measures?: string[];
                h3_2?: string;
                measures_2?: string[];
                figure?: { src: string; alt: string; caption: string };
              };
              return (
                <div key={si}>
                {s.heading && <h3>{s.heading}</h3>}
                {s.paragraphs?.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
                {s.steps && (
                  <ol className="dfir-steps">
                    {s.steps.map((j) => (
                      <li key={j.step}>
                        <strong>{j.step}. {j.title}.</strong> {j.body}
                      </li>
                    ))}
                  </ol>
                )}
                {s.note && <p className="dfir-note">{s.note}</p>}
                {s.protocols && (
                  <ul className="dfir-conclusion">
                    {s.protocols.map((p) => (
                      <li key={p.term}><strong>{p.term}:</strong> {p.body}</li>
                    ))}
                  </ul>
                )}
                {s.table && <DfirTable caption={s.table.caption} rows={s.table.rows} />}
                {s.bullets && (
                  <ul className="dfir-conclusion">
                    {s.bullets.map((b, bi) => (
                      <li key={bi}>
                        {b.strong ? <><strong>{b.strong}</strong> {b.body}</> : b.body}
                      </li>
                    ))}
                  </ul>
                )}
                {s.paragraphs_after?.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
                {s.h3 && <h3>{s.h3}</h3>}
                {s.measures && (
                  <ul className="dfir-conclusion">
                    {s.measures.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
                {s.h3_2 && <h3>{s.h3_2}</h3>}
                {s.measures_2 && (
                  <ul className="dfir-conclusion">
                    {s.measures_2.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
                {s.figure && (
                  <figure className={`dfir-figure${s.figure.src.includes("top-20") ? " dfir-figure--wide" : ""}`}>
                    <Image
                      src={s.figure.src}
                      alt={s.figure.alt}
                      width={s.figure.src.includes("top-20") ? 850 : 768}
                      height={s.figure.src.includes("top-20") ? 381 : 1296}
                    />
                    <figcaption>{s.figure.caption}</figcaption>
                  </figure>
                )}
                </div>
              );
            })}
          </section>
        ))}

        <section>
          <h2>{report.references_heading}</h2>
          <ul className="dfir-conclusion">
            {report.references.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">{r.label}</a>
              </li>
            ))}
          </ul>
          <p className="dfir-note">{report.references_note}</p>
        </section>

        <div className="dfir-cta">
          <Link href={`/${locale}/team`} className="btn btn-secondary">{report.back_label}</Link>
          <Link href={`/${locale}/team/ragnarok`} className="btn btn-primary">{report.profile_label}</Link>
        </div>
      </main>
      <Footer locale={locale} brand={content.brand.name} tagline={content.footer_columns.brand_tagline} navLabels={content.nav} footerColumns={content.footer_columns} socials={getCompanySocials(content)} socialHeading={content.footer.social_heading} />
    </>
  );
}

function DfirTable({ caption, rows }: { caption: string; rows: string[][] }) {
  return (
    <div className="dfir-table-wrap">
      <table className="dfir-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {(rows[0] ?? []).map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}