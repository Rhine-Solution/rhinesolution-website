"use client";

import { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Mermaid from "./Mermaid";
import styles from "./book.module.css";

type TocItem = { level: number; text: string; id: string; children: TocItem[] };

export default function BookReader({ content }: { content: string }) {
  const toc = useMemo(() => parseHeadings(content), [content]);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Link href="/en/projects/plan2shift" className={styles.backLink}>
          ← Plan2Shift project
        </Link>
        <span className={styles.toolbarSpacer} />
        <span className={styles.printHint}>Save as PDF via your browser&apos;s print dialog</span>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Download as PDF
        </button>
      </div>

      <div className={styles.layout}>
        {toc.length > 0 && (
          <nav className={styles.toc} aria-label="Table of contents">
            <h2 className={styles.tocTitle}>Contents</h2>
            <TocList items={toc} />
          </nav>
        )}
        <article className={styles.markdown}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

function TocList({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.tocList}>
      {items.map((item) => (
        <li key={item.id} className={item.level === 1 ? styles.tocL1 : undefined}>
          <a href={`#${item.id}`}>{item.text}</a>
          {item.children.length > 0 && <TocList items={item.children} />}
        </li>
      ))}
    </ul>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 id={slugify(textFromChildren(children))}>{children}</h1>,
  h2: ({ children }) => <h2 id={slugify(textFromChildren(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(textFromChildren(children))}>{children}</h3>,
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

// Parse heading outline for the generated table of contents. Fenced code
// blocks are skipped so `#` in SQL or config samples never becomes an entry.
function parseHeadings(md: string): TocItem[] {
  const roots: TocItem[] = [];
  const stack: TocItem[] = [];
  let inFence = false;
  let isFirstHeading = true;

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

    if (isFirstHeading) {
      isFirstHeading = false; // the document title — not part of the outline
      continue;
    }

    const item: TocItem = { level, text, id: slugify(text), children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= level) stack.pop();
    const parent = stack.length > 0 ? stack[stack.length - 1] : undefined;
    if (parent) parent.children.push(item);
    else roots.push(item);
    stack.push(item);
  }

  return roots;
}