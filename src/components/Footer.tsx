import Link from "next/link";
import SocialIcon from "./SocialIcon";
import BackToTopButton from "./BackToTopButton";
import { socialLabel } from "@/lib/socials";

type Social = { name: string; href: string };
type NavLabels = {
  home: string;
  team: string;
  projects: string;
  about: string;
  news: string;
  contact: string;
  back: string;
};
type FooterColumns = {
  brand_tagline: string;
  nav_heading: string;
  connect_heading: string;
  legal_heading: string;
  back_to_top: string;
  privacy: string;
  colophon: string;
};
type FooterProps = {
  locale: string;
  brand: string;
  tagline: string;
  navLabels: NavLabels;
  footerColumns: FooterColumns;
  socials?: Social[];
  socialHeading?: string;
};

/**
 * Footer — 4-column professional layout.
 *
 *   [ Brand + tagline ]   [ Navigate ]   [ Connect ]   [ Legal + back-to-top ]
 *
 * Plus a "back to top" button anchored bottom-right. The page-end CTA
 * section (ClosingCta) sits above the footer; this footer is the
 * final structural close.
 */
export default function Footer({
  locale,
  brand,
  tagline,
  navLabels,
  footerColumns,
  socials = [],
  socialHeading,
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid container">
        {/* Column 1 — Brand */}
        <div className="footer-col footer-col-brand">
          <span className="footer-brand-mark">{brand}</span>
          <p className="footer-brand-tagline">{tagline}</p>
        </div>

        {/* Column 2 — Navigate */}
        <nav className="footer-col" aria-label={footerColumns.nav_heading}>
          <h4 className="footer-col-heading">{footerColumns.nav_heading}</h4>
          <ul className="footer-col-list">
            <li>
              <Link href={`/${locale}`}>{navLabels.home}</Link>
            </li>
            <li>
              <Link href={`/${locale}/projects`}>{navLabels.projects}</Link>
            </li>
            <li>
              <Link href={`/${locale}/team`}>{navLabels.team}</Link>
            </li>
            <li>
              <Link href={`/${locale}/about`}>{navLabels.about}</Link>
            </li>
            <li>
              <Link href={`/${locale}/news`}>{navLabels.news}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`}>{navLabels.contact}</Link>
            </li>
          </ul>
        </nav>

        {/* Column 3 — Connect */}
        <div className="footer-col">
          <h4 className="footer-col-heading">{footerColumns.connect_heading}</h4>
          <ul className="footer-col-list">
            <li>
              <a href="mailto:info@rhinesolution.com">info@rhinesolution.com</a>
            </li>
            <li>
              <a href="mailto:contact@rhinesolution.com">
                contact@rhinesolution.com
              </a>
            </li>
            <li>
              <a href="mailto:support@rhinesolution.com">
                support@rhinesolution.com
              </a>
            </li>
          </ul>
          {socials.length > 0 && (
            <nav className="footer-socials" aria-label={socialHeading}>
              {socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={socialLabel(s.name)}
                  aria-label={socialLabel(s.name)}
                  className="footer-social"
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Column 4 — Legal + back-to-top */}
        <div className="footer-col footer-col-legal">
          <h4 className="footer-col-heading">{footerColumns.legal_heading}</h4>
          <ul className="footer-col-list">
            <li>
              <Link href={`/${locale}/privacy`}>{footerColumns.privacy}</Link>
            </li>
            <li>
              <Link href={`/${locale}/colophon`}>
                {footerColumns.colophon}
              </Link>
            </li>
          </ul>
          <BackToTopButton label={footerColumns.back_to_top} />
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {year} <span className="footer-brand">{brand}</span>
        </span>
        <span className="footer-tagline">{footerColumns.brand_tagline}</span>
      </div>
    </footer>
  );
}
