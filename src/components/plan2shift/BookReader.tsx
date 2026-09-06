"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Mermaid from "./Mermaid";
import styles from "./book.module.css";

type Node = { level: number; text: string; id: string; children: Node[] };
type Category = { text: string; id: string; children: Node[] };

export default function BookReader({ content }: { content: string }) {
  const categories = useMemo(() => parseCategories(content), [content]);
  const [active, setActive] = useState<string>("");

  // Scrollspy: highlight the topmost section intersecting the reading band.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-book-section]");
    if (targets.length === 0) return;
    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        }
        let bestEl: HTMLElement | null = null;
        for (const el of visible) {
          if (!bestEl || el.getBoundingClientRect().top < bestEl.getBoundingClientRect().top) {
            bestEl = el;
          }
        }
        if (bestEl) setActive(bestEl.id);
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [content]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>Contents</p>
        <nav className={styles.sidebarNav} aria-label="Table of contents">
          {categories.map((cat) => (
            <div className={styles.category} key={cat.id}>
              <a
                className={active === cat.id ? styles.catActive : undefined}
                href={`#${cat.id}`}
              >
                {cat.text}
              </a>
              {cat.children.length > 0 && (
                <ul className={styles.catList}>
                  {cat.children.map((item) => (
                    <li key={item.id}>
                      <a
                        className={active === item.id ? styles.linkActive : undefined}
                        href={`#${item.id}`}
                      >
                        {item.text}
                      </a>
                      {item.children.length > 0 && (
                        <ul className={styles.subList}>
                          {item.children.map((sub) => (
                            <li key={sub.id}>
                              <a
                                className={active === sub.id ? styles.linkActive : undefined}
                                href={`#${sub.id}`}
                              >
                                {sub.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.book}>
        <div className={styles.actions}>
          <span className={styles.printHint}>Save as PDF via your browser&apos;s print dialog</span>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Download as PDF
          </button>
        </div>
        <div className={styles.markdown}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <HeadingTag tag="h1">{children}</HeadingTag>,
  h2: ({ children }) => <HeadingTag tag="h2">{children}</HeadingTag>,
  h3: ({ children }) => <HeadingTag tag="h3">{children}</HeadingTag>,
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  // react-markdown nests fenced blocks as pre > code; flatten so our code
  // component can control the wrapper (and swap mermaid for a rendered diagram).
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    const lang = /language-([\w-]+)/.exec(className ?? "")?.[1];
    const raw = textFromChildren(children);
    if (lang === "mermaid") {
      return <Mermaid code={raw.trim()} />;
    }
    if (!className) {
      return <code {...props}>{children}</code>;
    }
    return (
      <pre>
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
};

function HeadingTag({ tag, children }: { tag: "h1" | "h2" | "h3"; children: React.ReactNode }) {
  const id = slugify(textFromChildren(children));
  const Tag = tag as "h1";
  return (
    <Tag id={id} data-book-section={id}>
      {children}
    </Tag>
  );
}

function textFromChildren(children: React.ReactNode): string {
  if (Array.isArray(children)) return children.map(String).join("");
  return String(children ?? "");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Parse the heading outline into categories (the `#` layer headings, e.g.
// "L1 — THE PITCH LAYER") with their `##` sections and `###` sub-sections.
// Fenced code blocks are skipped so `#` in SQL or config samples is ignored.
function parseCategories(md: string): Category[] {
  const cats: Category[] = [];
  let current: Category | null = null;
  let inFence = false;

  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{1,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (!m) continue;

    const level = m[1].length;
    const text = m[2].replace(/[*_`~]/g, "").trim();
    if (!text) continue;

    if (level === 1) {
      current = { text, id: slugify(text), children: [] };
      cats.push(current);
      continue;
    }
    if (!current) continue;

    const node: Node = { level, text, id: slugify(text), children: [] };
    if (level === 2) {
      current.children.push(node);
    } else if (level === 3) {
      const last = current.children[current.children.length - 1];
      if (last) last.children.push(node);
    }
  }

  return cats;
}