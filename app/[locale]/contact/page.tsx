import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SocialIcon from "@/components/SocialIcon";
import { getContent } from "@/lib/i18n";
import { getCompanySocials, socialLabel } from "@/lib/socials";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return { title: getContent(locale).contact.eyebrow };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const c = content.contact;
  const socials = getCompanySocials(content);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="contact" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className="contact-body">{c.body}</p>
        </header>

        <nav className="contact-socials" aria-label={content.footer.social_heading}>
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLabel(s.name)}
              title={socialLabel(s.name)}
            >
              <SocialIcon name={s.name} size={22} />
            </a>
          ))}
        </nav>

        <section className="contact-alt">
          <h2>{c.alt_title}</h2>
          <p>{c.alt_text}</p>
          <Link href={`/${locale}/projects`} className="btn btn-secondary">
            {c.alt_link}
          </Link>
        </section>
      </main>
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} socialHeading={content.footer.social_heading} socials={socials} />
    </>
  );
}