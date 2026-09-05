"use client";

import { useEffect, useRef, useState } from "react";
import MiniSearch from "minisearch";
import Link from "next/link";
import styles from "./search.module.css";

type IndexEntry = { id: string; title: string; excerpt: string; url: string; type: string };

export default function SearchBox({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const engine = useRef<MiniSearch<IndexEntry> | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((entries: IndexEntry[]) => {
        if (!mounted || !Array.isArray(entries)) return;
        const ms = new MiniSearch<IndexEntry>({
          fields: ["title", "excerpt"],
          storeFields: ["title", "excerpt", "url", "type"],
          searchOptions: { prefix: true, boost: { title: 2 } },
        });
        ms.addAll(entries);
        engine.current = ms;
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const onInput = (value: string) => {
    setQ(value);
    const trimmed = value.trim();
    setOpen(trimmed.length > 0);
    if (!engine.current || !trimmed) {
      setResults([]);
      return;
    }
    const hits = engine.current.search(trimmed).slice(0, 8);
    setResults(hits as unknown as IndexEntry[]);
  };

  return (
    <div className={styles.wrap}>
      <input
        type="search"
        value={q}
        onChange={(e) => onInput(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={styles.input}
      />
      {open && (
        <ul className={styles.results} role="listbox">
          {results.length === 0 && <li className={styles.empty}>No matches</li>}
          {results.map((r) => (
            <li key={r.id} role="option">
              <Link href={r.url} onClick={() => setOpen(false)}>
                <span className={styles.type}>{r.type}</span>
                <strong className={styles.title}>{r.title}</strong>
                {r.excerpt && <span className={styles.excerpt}>{r.excerpt}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}