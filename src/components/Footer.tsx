import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

type Social = { href: string; label: string };
type FooterProps = {
  locale: string;
  backLabel: string;
  socials?: Social[];
  socialHeading?: string;
};

export default function Footer({ locale, backLabel, socials = [], socialHeading }: FooterProps) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <Link href={`/${locale}`} className="footer-back">
          {backLabel}
        </Link>
        {socials.length > 0 && (
          <nav className="footer-socials" aria-label={socialHeading}>
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
              >
                {s.label.slice(0, 2).toUpperCase()}
              </a>
            ))}
          </nav>
        )}
        <div className="footer-actions">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
