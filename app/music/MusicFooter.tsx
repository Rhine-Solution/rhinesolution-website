import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { defaultLocale, getContent } from "@/lib/i18n";
import { getCompanySocials, socialLabel } from "@/lib/socials";
import SocialIcon from "@/components/SocialIcon";

export default function MusicFooter() {
  const content = getContent(defaultLocale);
  const socials = getCompanySocials(content);
  const year = new Date().getFullYear();
  return (
    <footer className="music-footer">
      <div className="music-footer-main">
        <Link href="/" className="music-footer-back">
          <FiArrowLeft size={16} aria-hidden="true" />
          {content.nav.back}
        </Link>
        <nav className="music-footer-socials" aria-label={content.footer.social_heading}>
          {socials.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={socialLabel(s.name)}
              aria-label={socialLabel(s.name)}
            >
              <SocialIcon name={s.name} size={16} />
            </a>
          ))}
        </nav>
        <span className="music-footer-meta">MUSIC_TRENDS_LOCAL v1.0</span>
      </div>
      <div className="music-footer-bottom">
        <span>
          © {year} <span className="music-footer-brand">Rhine Solution</span>
        </span>
        <span className="music-footer-tagline">{content.brand.tagline}</span>
      </div>
    </footer>
  );
}