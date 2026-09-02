"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiFolder, FiUsers, FiMail } from "react-icons/fi";
import { getContent } from "@/lib/i18n";

type NavKey = "home" | "projects" | "team" | "contact";

type MobileFooterProps = {
  locale: string;
};

/**
 * MobileFooter — compact sticky bottom action bar. Visible only <768px.
 * Gives thumb-reachable primary navigation.
 * Derives `current` from pathname so it can be mounted once in the layout.
 */
export default function MobileFooter({ locale }: MobileFooterProps) {
  const pathname = usePathname() || "";
  const labels = getContent(locale).nav;

  const current: NavKey = (() => {
    if (pathname.startsWith(`/${locale}/team`)) return "team";
    if (pathname.startsWith(`/${locale}/projects`)) return "projects";
    if (pathname.startsWith(`/${locale}/contact`)) return "contact";
    return "home";
  })();

  const items: Array<{
    key: NavKey;
    label: string;
    Icon: typeof FiHome;
    href: string;
  }> = [
    { key: "home", label: labels.home, Icon: FiHome, href: `/${locale}` },
    {
      key: "projects",
      label: labels.projects,
      Icon: FiFolder,
      href: `/${locale}/projects`,
    },
    { key: "team", label: labels.team, Icon: FiUsers, href: `/${locale}/team` },
    {
      key: "contact",
      label: labels.contact,
      Icon: FiMail,
      href: `/${locale}/contact`,
    },
  ];

  return (
    <nav className="mobile-footer" aria-label="Primary">
      {items.map(({ key, label, Icon, href }) => {
        const isCurrent = current === key;
        return (
          <Link
            key={key}
            href={href}
            className={`mobile-footer-item${isCurrent ? " is-current" : ""}`}
            aria-current={isCurrent ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
