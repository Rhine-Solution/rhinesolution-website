import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsCard from "@/components/news/NewsCard";
import TrendsSection from "@/components/news/TrendsSection";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getNews } from "@/lib/news";
import { getDevTrends } from "@/lib/news-trends";

export const revalidate = 7200;

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "nl" }];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/news", {
    title: c.news.title,
    description: c.news.subtitle,
    feedUrl: `https://rhinesolution.com/${locale}/news/feed.xml`,
  });
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const n = content.news;
  const items = getNews(locale);
  const trends = await getDevTrends();

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
          {items.map((item) => (
            <li key={item.slug} className="news-card">
              <NewsCard item={item} locale={locale} labels={n.categories} readMore={n.read_more} />
            </li>
          ))}
        </ol>

        <TrendsSection title={n.trends_title} subtitle={n.trends_subtitle} trends={trends} />
      </main>
      <Footer
        locale={locale}
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