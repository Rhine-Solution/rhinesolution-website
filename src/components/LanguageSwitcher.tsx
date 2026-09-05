"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { getContent, locales } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: string;
  variant?: "dock" | "menu";
  onNavigate?: () => void;
};

/**
 * LanguageSwitcher — locale selector that works with the i18n system.
 * A dropdown (<details>, no JS required) listing all locales as a list,
 * so adding more languages stays tidy. Reads the current pathname and
 * swaps the `/en`/`/nl` segment while keeping the rest of the route
 * (e.g. /en/team -> /nl/team). Non-localized paths (e.g. /dfir) fall
 * back to the target locale's home.
 */
export default function LanguageSwitcher({
  locale,
  variant = "dock",
  onNavigate,
}: LanguageSwitcherProps) {
  const pathname = usePathname() || "/";
  const a11y = getContent(locale).a11y;

  if (variant === "menu") {
    return (
      <div
        className="mobile-lang"
        role="group"
        aria-label={a11y.language_switcher}
      >
        <span className="mobile-lang-label">{a11y.language_switcher}</span>
        <div className="lang-pills">
          {locales.map((l) => {
            const active = l === locale;
            return (
              <Link
                key={l}
                href={buildHref(pathname, locale, l)}
                onClick={onNavigate}
                aria-current={active ? "true" : undefined}
                aria-label={a11y.language_names?.[l] ?? l}
                className={active ? "is-active" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <details className={`lang-switcher lang-switcher--${variant}`}>
      <summary aria-label={a11y.language_switcher}>
        <span className="lang-switcher-code">{locale.toUpperCase()}</span>
        <FiChevronDown className="lang-switcher-caret" size={12} aria-hidden="true" />
      </summary>
      <div className="lang-switcher-menu">
        {locales.map((l) => {
          const active = l === locale;
          return (
            <Link
              key={l}
              href={buildHref(pathname, locale, l)}
              onClick={(e) => {
                e.currentTarget.closest("details")?.removeAttribute("open");
                onNavigate?.();
              }}
              aria-current={active ? "true" : undefined}
              className={active ? "is-active" : undefined}
            >
              <span className="lang-switcher-code">{l.toUpperCase()}</span>
              <span className="lang-switcher-name">
                {a11y.language_names?.[l] ?? l}
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}

function buildHref(pathname: string, fromLocale: string, toLocale: string): string {
  if (pathname === `/${fromLocale}`) return `/${toLocale}`;
  const prefix = `/${fromLocale}/`;
  if (pathname.startsWith(prefix)) {
    return `/${toLocale}/${pathname.slice(prefix.length)}`;
  }
  return `/${toLocale}`;
}