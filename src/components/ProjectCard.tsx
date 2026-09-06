import Link from "next/link";
import {
  LuBrain,
  LuCalendarDays,
  LuGlobe,
  LuMusic,
  LuServer,
  LuArrowUpRight,
} from "react-icons/lu";
import type { ContentProject } from "@/lib/i18n";

const projectIcons: Record<string, typeof LuGlobe> = {
  globe: LuGlobe,
  brain: LuBrain,
  server: LuServer,
  music: LuMusic,
  calendar: LuCalendarDays,
};

type Props = {
  project: ContentProject;
  locale: string;
  featuredLabel?: string;
  readMoreLabel?: string;
  headingLevel?: "h2" | "h3";
};

export default function ProjectCard({
  project: p,
  locale,
  featuredLabel,
  readMoreLabel,
  headingLevel: Heading = "h2",
}: Props) {
  const Icon = projectIcons[p.icon ?? ""] ?? LuGlobe;
  return (
    <Link
      key={p.slug}
      href={`/${locale}${p.href ?? `/projects/${p.slug}`}`}
      className={`card project-card${p.featured ? " featured" : ""}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {p.featured && featuredLabel && (
        <span className="featured-tag">{featuredLabel}</span>
      )}
      <div className="project-card-head">
        <span className="project-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <Heading>{p.title}</Heading>
      </div>
      <p className="project-summary">{p.summary}</p>
      <div className="project-card-foot">
        <p className="project-meta">
          {p.stack.join(" · ")} · {p.year}
        </p>
        <span className="read-more">
          {readMoreLabel}
          <LuArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}