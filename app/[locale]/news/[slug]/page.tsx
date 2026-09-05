import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainMarkdown from "@/components/brain/BrainMarkdown";
import { getContent, locales } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getNews, getNewsItem } from "@/lib/news";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/news/news.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => getNews(locale).map((n) => ({ locale, slug: n.slug })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const item = getNewsItem(locale, slug);
  if (!item) return { title: "Not found" };
  return buildMetadata(locale, `/news/${slug}`, {
    title: item.title,
    description: item.excerpt,
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const item = getNewsItem(locale, slug);
  if (!item) notFound();
  const badge =
    content.news.categories[item.category as keyof typeof content.news.categories] || item.category;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="news" />
      <main id="main" className="container page">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href={`/${locale}/news`}>{content.nav.news}</Link>
          <span aria-hidden="true"> / </span>
          <span>{item.title}</span>
        </nav>
        <article className={styles.article}>
          <header className={styles.articleHead}>
            <div className={styles.cardMeta}>
              <span className={styles.date}>{item.dateLabel}</span>
              <span className={styles.badge}>{badge}</span>
            </div>
            <h1>{item.title}</h1>
            <p className={styles.lede}>{item.excerpt}</p>
          </header>
          <BrainMarkdown content={item.body} />
          <p className={styles.back}>
            <Link href={`/${locale}/news`}>← {content.news.back}</Link>
          </p>
        </article>
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