import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainMarkdown from "@/components/brain/BrainMarkdown";
import { getContent } from "@/lib/i18n";
import { getNewsItem, getNews } from "@/lib/news";
import { getGlobalNewsItem } from "@/lib/global-news";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/news/news.module.css";

export const revalidate = 7200;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return [
    ...getNews("en").map((n) => ({ locale: "en", slug: n.slug })),
    ...getNews("nl").map((n) => ({ locale: "nl", slug: n.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getNewsItem(locale, slug);
  if (item) {
    return buildMetadata(locale, `/news/${slug}`, {
      title: item.title,
      description: item.excerpt,
    });
  }
  const global = await getGlobalNewsItem(slug);
  if (global) {
    return {
      title: global.title,
      description: global.excerpt,
    };
  }
  return { title: "Not found" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const n = content.news;

  const item = getNewsItem(locale, slug);
  if (!item) {
    const global = await getGlobalNewsItem(slug);
    if (!global) notFound();
    return (
      <>
        <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="news" />
        <main id="main" className="container page">
          <p className={styles.crumbs}>
            <Link href={`/${locale}/news`}>{n.back}</Link>
          </p>
          <article className={styles.article}>
            <header className={styles.articleHead}>
              <div className={styles.cardMeta}>
                <span className={styles.date}>{global.source}</span>
                <span className={styles.badge}>{global.category}</span>
              </div>
              <h1>{global.title}</h1>
              <p className={styles.lede}>{global.excerpt}</p>
            </header>
            <p>
              <a
                href={global.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Read the full article
              </a>
            </p>
          </article>
          <p className={styles.back}>
            <Link href={`/${locale}/news`} className="btn btn-secondary">
              {n.back}
            </Link>
          </p>
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

  const badge = n.categories[item.category as keyof typeof n.categories] || item.category;
  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="news" />
      <main id="main" className="container page">
        <p className={styles.crumbs}>
          <Link href={`/${locale}/news`}>{n.back}</Link>
        </p>
        <article className={styles.article}>
          <header className={styles.articleHead}>
            <div className={styles.cardMeta}>
              <span className={styles.date}>{item.dateLabel}</span>
              <span className={styles.badge}>{badge}</span>
            </div>
            <h1>{item.title}</h1>
            <p className={styles.lede}>{item.excerpt}</p>
          </header>
          <div className={styles.cardBody}>
            <BrainMarkdown content={item.body} />
          </div>
        </article>
        <p className={styles.back}>
          <Link href={`/${locale}/news`} className="btn btn-secondary">
            {n.back}
          </Link>
        </p>
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