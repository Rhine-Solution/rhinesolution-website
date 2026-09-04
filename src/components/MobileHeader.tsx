"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import SocialIcon from "./SocialIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import { socialLabel } from "@/lib/socials";
import { getCompanySocials } from "@/lib/socials";
import { getContent } from "@/lib/i18n";

type Social = { name: string; href: string };
type NavKey = "home" | "team" | "projects" | "about" | "news" | "contact";

type MobileHeaderProps = {
  locale: string;
  socials?: Social[];
  socialHeading?: string;
};

/**
 * MobileHeader — sticky top bar with hamburger. Visible only <768px.
 * Hamburger opens a full-screen transparent overlay so the WebGL background
 * shows through. Closes on: link tap, X tap, Escape, or backdrop tap.
 * Derives `current` from pathname to avoid prop-drilling on every page.
 */
export default function MobileHeader({
  locale,
  socials,
  socialHeading,
}: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "";

  const content = getContent(locale);
  const brand = content.brand.name;
  const labels = content.nav;
  const socialList = socials ?? getCompanySocials(content);

  const current: NavKey = (() => {
    if (pathname.startsWith(`/${locale}/team`)) return "team";
    if (pathname.startsWith(`/${locale}/projects`)) return "projects";
    if (pathname.startsWith(`/${locale}/about`)) return "about";
    if (pathname.startsWith(`/${locale}/news`)) return "news";
    if (pathname.startsWith(`/${locale}/contact`)) return "contact";
    return "home";
  })();

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables[0]) focusables[0].focus();
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onTab);
    return () => dialog.removeEventListener("keydown", onTab);
  }, [open]);

  const linkFor = (key: NavKey) => {
    if (key === "home") return `/${locale}`;
    return `/${locale}/${key}`;
  };

  return (
    <>
      <header className="mobile-header" role="banner" data-current={current}>
        <Link
          href={`/${locale}`}
          className="mobile-header-brand"
          aria-current={current === "home" ? "page" : undefined}
        >
          {brand}
        </Link>
        <button
          type="button"
          className="mobile-header-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={dialogRef}
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <nav className="mobile-menu-nav">
            <Link
              href={linkFor("home")}
              onClick={() => setOpen(false)}
              aria-current={current === "home" ? "page" : undefined}
            >
              {labels.home}
            </Link>
            <Link
              href={linkFor("projects")}
              onClick={() => setOpen(false)}
              aria-current={current === "projects" ? "page" : undefined}
            >
              {labels.projects}
            </Link>
            <Link
              href={linkFor("team")}
              onClick={() => setOpen(false)}
              aria-current={current === "team" ? "page" : undefined}
            >
              {labels.team}
            </Link>
            <Link
              href={linkFor("about")}
              onClick={() => setOpen(false)}
              aria-current={current === "about" ? "page" : undefined}
            >
              {labels.about}
            </Link>
            <Link
              href={linkFor("news")}
              onClick={() => setOpen(false)}
              aria-current={current === "news" ? "page" : undefined}
            >
              {labels.news}
            </Link>
            <Link
              href={linkFor("contact")}
              onClick={() => setOpen(false)}
              aria-current={current === "contact" ? "page" : undefined}
            >
              {labels.contact}
            </Link>
          </nav>

          <LanguageSwitcher locale={locale} variant="menu" onNavigate={() => setOpen(false)} />

          {socialList.length > 0 && (
            <nav
              className="mobile-menu-socials"
              aria-label={socialHeading}
            >
              {socialList.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLabel(s.name)}
                  title={socialLabel(s.name)}
                  onClick={() => setOpen(false)}
                >
                  <SocialIcon name={s.name} size={22} />
                </a>
              ))}
            </nav>
          )}
        </div>
      )}
    </>
  );
}
