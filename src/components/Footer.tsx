import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import SocialIcon from "./SocialIcon";
import { socialLabel } from "@/lib/socials";

type Social = { name: string; href: string };
type FooterProps = {
  locale: string;
  backLabel: string;
  brand: string;
  tagline: string;
  showBack?: boolean;
  socials?: Social[];
  socialHeading?: string;
  themeLabels?: { theme_toggle_light: string; theme_toggle_dark: string };
};

export default function Footer({
  locale,
  backLabel,
  brand,
  tagline,
  showBack = true,
  socials = [],
  socialHeading,
  themeLabels,
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        {showBack && (
          <Link href={`/${locale}`} className="footer-back">
            <FiArrowLeft size={16} aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        <nav className="footer-socials" aria-label={socialHeading}>
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={socialLabel(s.name)}
              aria-label={socialLabel(s.name)}
            >
              <SocialIcon name={s.name} />
            </a>
          ))}
        </nav>
        <div className="footer-actions">
          <ThemeToggle labels={themeLabels} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {year} <span className="footer-brand">{brand}</span>
        </span>
        <span className="footer-tagline">{tagline}</span>
      </div>
    </footer>
  );
}