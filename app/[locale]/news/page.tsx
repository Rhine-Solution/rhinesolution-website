import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/news", {
    title: c.news.title,
    description: c.news.subtitle,
  });
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const n = content.news;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="news" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{n.eyebrow}</p>
          <h1>{n.title}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{n.subtitle}</p>
        </header>

        <ol className="news-list">
          {n.items.map((item, i) => (
            <li key={item.title} className="news-card">
              <span className="news-index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <span className="news-date">{item.date}</span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} socialHeading={content.footer.social_heading} socials={getCompanySocials(content)} />
    </>
  );
}