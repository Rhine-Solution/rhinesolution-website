import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { defaultLocale, getContent } from "@/lib/i18n";

export default function MusicFooter() {
  const content = getContent(defaultLocale);
  const year = new Date().getFullYear();
  return (
    <footer className="music-footer">
      <div className="music-footer-main">
        <Link href="/" className="music-footer-back">
          <FiArrowLeft size={16} aria-hidden="true" />
          {content.nav.back}
        </Link>
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