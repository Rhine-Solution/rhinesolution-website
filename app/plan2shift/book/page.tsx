import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookReader from "@/components/plan2shift/BookReader";
import { getContent, defaultLocale } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { getPlan2ShiftBook } from "@/lib/plan2shift";
import newsStyles from "@/components/news/news.module.css";

export const metadata: Metadata = {
  title: "PLAN2SHIFT — Product & Technical Book",
  description:
    "PLAN2SHIFT product and technical book: the pitch, product and technical layers — vision, market, roadmap, architecture, data model, security and operations.",
  alternates: {
    canonical: "https://rhinesolution.com/plan2shift/book",
  },
};

export default function Plan2ShiftBookPage() {
  const content = getContent(defaultLocale);
  const book = getPlan2ShiftBook();
  return (
    <>
      <Nav locale={defaultLocale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="projects" />
      <main id="main" className="container page">
        <p className={newsStyles.crumbs}>
          <Link href="/en/projects/plan2shift">← Plan2Shift project</Link>
        </p>
        <article className={newsStyles.article}>
          <header className={newsStyles.articleHead}>
            <h1>PLAN2SHIFT — Product &amp; Technical Book</h1>
            <p className={newsStyles.lede}>
              One document, three reading layers: the pitch, the product and the technical
              source of truth — market, roadmap, architecture, data model, security and
              operations, with diagrams.
            </p>
          </header>
          <div className={newsStyles.cardBody}>
            <BookReader content={book} />
          </div>
        </article>
        <p className={newsStyles.back}>
          <Link href="/en/projects/plan2shift" className="btn btn-secondary">
            ← Back to Plan2Shift
          </Link>
        </p>
      </main>
      <Footer
        locale={defaultLocale}
        brand={content.brand.name}
        tagline={content.footer_columns.brand_tagline}
        navLabels={content.nav}
        footerColumns={content.footer_columns}
        socials={getCompanySocials(content)}
        socialHeading={content.footer.social_heading}
      />
    </>
  );
}