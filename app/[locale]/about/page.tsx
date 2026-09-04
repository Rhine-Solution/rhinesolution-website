import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  FiLayout,
  FiMonitor,
  FiZap,
} from "react-icons/fi";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

const serviceIcons: Record<string, typeof FiLayout> = {
  layout: FiLayout,
  monitor: FiMonitor,
  zap: FiZap,
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/about", {
    title: c.nav.about,
    description: c.about.statement.slice(0, 160),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const s = content.about;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="about" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{s.eyebrow}</p>
          <h1>{s.statement}</h1>
        </header>

        <section className="about-story" aria-label={s.statement}>
          {s.story.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </section>

        <section>
          <h2>{s.services_title}</h2>
          <div className="grid service-grid" style={{ marginTop: "var(--space-5)" }}>
            {s.services.map((service) => {
              const Icon = serviceIcons[service.icon] ?? FiLayout;
              return (
                <article className="card service-card" key={service.title}>
                  <span className="service-icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3 className="service-title">{service.title}</h3>
                  <p style={{ marginBottom: 0 }}>{service.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2>{s.process_title}</h2>
          <div className="process-steps" style={{ marginTop: "var(--space-5)" }}>
            {s.process.map((step, i) => (
              <article className="process-step" key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="step-title">{step.title}</h3>
                  <p style={{ marginBottom: 0 }}>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>{s.stack_title}</h2>
          <div className="stack-chips" style={{ marginTop: "var(--space-4)" }}>
            {s.stack.map((item) => (
              <span className="stack-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2>{s.values_title}</h2>
          <div className="grid" style={{ marginTop: "var(--space-5)" }}>
            {s.values.map((v) => (
              <article className="card" key={v.title}>
                <h3 className="value-title">{v.title}</h3>
                <p style={{ marginBottom: 0 }}>{v.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-cta">
          <h2>{s.cta_head}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{s.cta_text}</p>
          <Link href={`/${locale}/projects`} className="btn btn-primary">
            {s.cta_link_label}
          </Link>
        </section>
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