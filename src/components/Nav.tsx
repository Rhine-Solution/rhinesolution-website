import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

type NavProps = {
  locale: string;
  brand: string;
  labels: { home: string; team: string; projects: string };
  themeLabels?: { theme_toggle_light: string; theme_toggle_dark: string };
  current: "home" | "team" | "projects";
};

export default function Nav({ locale, brand, labels, themeLabels, current }: NavProps) {
  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-inner">
        <Link href={`/${locale}`} className="nav-brand" aria-current={current === "home" ? "page" : undefined}>
          {brand}
        </Link>
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
        </ul>
        <ThemeToggle labels={themeLabels} />
      </div>
    </nav>
  );
}