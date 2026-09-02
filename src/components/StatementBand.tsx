import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

type StatementBandProps = {
  locale: string;
  index: number;
  eyebrow: string;
  heading: string;
  body: string;
  linkLabel?: string;
  href?: string;
};

export default function StatementBand({
  locale,
  index,
  eyebrow,
  heading,
  body,
  linkLabel,
  href,
}: StatementBandProps) {
  const isExternal = Boolean(href?.startsWith("http"));
  const target = href && !isExternal ? `/${locale}${href}` : href;
  return (
    <section className={`statement-band tone-${index % 3}`}>
      <p className="statement-eyebrow">{eyebrow}</p>
      <h2 className="statement-heading">{heading}</h2>
      <p className="statement-body">{body}</p>
      {linkLabel && target && (
        <Link className="statement-link" href={target}>
          {linkLabel}
          <FiArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}