import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";

type NavProps = {
  locale: string;
  brand: string;
  labels: { home: string; team: string; projects: string; about: string; news: string; contact: string };
  current?: "home" | "team" | "projects" | "about" | "news" | "contact";
};

export default function Nav({ locale, brand, labels, current }: NavProps) {
  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-island">
        <Link href={`/${locale}`} className="nav-brand" aria-current={current === "home" ? "page" : undefined}>
          {brand}
          <FiChevronDown className="nav-menu-indicator" size={14} aria-hidden="true" />
        </Link>
        <div className="nav-menu-col">
          <ul className="nav-links">
            <li>
              <Link href={`/${locale}`} aria-current={current === "home" ? "page" : undefined}>
                {labels.home}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/team`} aria-current={current === "team" ? "page" : undefined}>
                {labels.team}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/projects`} aria-current={current === "projects" ? "page" : undefined}>
                {labels.projects}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/about`} aria-current={current === "about" ? "page" : undefined}>
                {labels.about}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/news`} aria-current={current === "news" ? "page" : undefined}>
                {labels.news}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} aria-current={current === "contact" ? "page" : undefined}>
                {labels.contact}
              </Link>
            </li>
          </ul>
        </div>
        <LanguageSwitcher locale={locale} variant="dock" />
      </div>
    </nav>
  );
}