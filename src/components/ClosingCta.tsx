import Link from "next/link";

type ClosingCtaProps = {
  locale: string;
  labels: {
    eyebrow: string;
    title: string;
    body: string;
    cta_label: string;
    secondary_label: string;
  };
};

/**
 * ClosingCta — last beat before the footer.
 *
 * Big serif title + body + primary CTA + secondary link. Designed to give
 * the page a real outro (so it doesn't just stop at the last project card).
 * Sits inside its own section with a gradient fade-in zone above it so the
 * transition into the footer feels intentional.
 */
export default function ClosingCta({ locale, labels }: ClosingCtaProps) {
  return (
    <section className="closing-cta" aria-labelledby="closing-cta-title">
      <div className="closing-cta-inner container">
        <p className="closing-cta-eyebrow">{labels.eyebrow}</p>
        <h2 id="closing-cta-title" className="closing-cta-title">
          {labels.title}
        </h2>
        <p className="closing-cta-body">{labels.body}</p>
        <div className="closing-cta-actions">
          <Link href={`/${locale}/contact`} className="btn btn-primary">
            {labels.cta_label}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="btn btn-secondary"
          >
            {labels.secondary_label}
          </Link>
        </div>
      </div>
    </section>
  );
}
