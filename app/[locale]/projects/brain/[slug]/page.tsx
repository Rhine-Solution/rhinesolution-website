import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainSidebar from "@/components/brain/BrainSidebar";
import BrainMarkdown from "@/components/brain/BrainMarkdown";
import { getContent, locales } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getBrainManifest, getNoteBySlug, getNoteMarkdown } from "@/lib/brain";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/brain/brain.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const manifest = getBrainManifest();
  return Object.values(manifest.notes).flatMap((n) =>
    locales.map((locale) => ({ locale, slug: n.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return { title: "Not found" };
  return buildMetadata(locale, `/projects/brain/${slug}`, {
    title: note.title,
    description: note.excerpt,
  });
}

export default async function BrainNotePage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const note = getNoteBySlug(slug);
  if (!note) notFound();
  const manifest = getBrainManifest();
  const md = getNoteMarkdown(slug, locale);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <div className={styles.explorer}>
          <BrainSidebar manifest={manifest} locale={locale} labels={content.brain.folders} active={slug} />
          <article className={styles.explorerMain}>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={`/${locale}/projects`}>{content.nav.projects}</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/${locale}/projects/brain`}>{content.brain.title}</Link>
              <span aria-hidden="true"> / </span>
              <span>{note.title}</span>
            </nav>
            <BrainMarkdown content={md} />
            <p className={styles.noteBack}>
              <Link href={`/${locale}/projects/brain`}>← {content.brain.back}</Link>
            </p>
          </article>
        </div>
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