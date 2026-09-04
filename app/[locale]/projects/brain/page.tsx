import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainSidebar from "@/components/brain/BrainSidebar";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getBrainManifest, buildTree } from "@/lib/brain";
import Link from "next/link";
import styles from "@/components/brain/brain.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/projects/brain", { title: c.brain.title, description: c.brain.subtitle });
}

export default async function BrainExplorerPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const manifest = getBrainManifest();
  const tree = buildTree(manifest);
  const labels: Record<string, string> = content.brain.folders;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <div className={styles.explorer}>
          <BrainSidebar manifest={manifest} locale={locale} labels={labels} />
          <article className={styles.explorerMain}>
            <header className="page-head">
              <p className="section-eyebrow">{content.sections.featured_work}</p>
              <h1>{content.brain.title}</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{content.brain.subtitle}</p>
            </header>
            {tree.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>{content.brain.empty}</p>
            ) : (
              tree.map((folder) => (
                <section key={folder.id} className={styles.explorerFolder}>
                  <h2>{labels[folder.id] ?? folder.id}</h2>
                  <ul className={styles.explorerList}>
                    {folder.notes.map((note) => (
                      <li key={note.slug}>
                        <Link href={`/${locale}/projects/brain/${note.slug}`} className={styles.explorerCard}>
                          <h3>{note.title}</h3>
                          <p>{note.excerpt}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
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