"use client";

import { useEffect, useRef, useState } from "react";
import MiniSearch from "minisearch";
import Link from "next/link";
import styles from "./search.module.css";

type IndexEntry = { id: string; title: string; excerpt: string; body: string; url: string; type: string; folder: string; tags: string[] };

export default function SearchBox({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [facet, setFacet] = useState<string>("");
  const engine = useRef<MiniSearch<IndexEntry> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((entries: IndexEntry[]) => {
        if (!mounted || !Array.isArray(entries)) return;
        const ms = new MiniSearch<IndexEntry>({
          fields: ["title", "excerpt", "body"],
          storeFields: ["title", "excerpt", "url", "type", "folder", "tags"],
          searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3, excerpt: 1.5, body: 1 } },
        });
        ms.addAll(entries);
        engine.current = ms;
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const runSearch = (value: string, facetFilter: string) => {
    const trimmed = value.trim();
    if (!engine.current || !trimmed) return [];
    return engine.current
      .search(trimmed)
      .filter((r) => !facetFilter || (r as unknown as IndexEntry).folder === facetFilter)
      .slice(0, 8) as unknown as IndexEntry[];
  };

  const onInput = (value: string) => {
    setQ(value);
    const trimmed = value.trim();
    setOpen(trimmed.length > 0);
    setActive(-1);
    setResults(trimmed ? runSearch(value, facet) : []);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      window.location.assign(results[active].url);
    }
  };

  const folders = [...new Set(results.map((r) => r.folder).filter(Boolean))];

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results"
        aria-activedescendant={active >= 0 ? `search-option-${active}` : undefined}
        aria-autocomplete="list"
        value={q}
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className={styles.input}
      />
      {open && folders.length > 1 && (
        <div className={styles.facets}>
          <button type="button" className={facet === "" ? styles.facetActive : styles.facet} onClick={() => { setFacet(""); setResults(runSearch(q, "")); setActive(-1); }}>
            All
          </button>
          {folders.map((f) => (
            <button key={f} type="button" className={facet === f ? styles.facetActive : styles.facet} onClick={() => { setFacet(f); setResults(runSearch(q, f)); setActive(-1); }}>
              {f}
            </button>
          ))}
        </div>
      )}
      {open && (
        <ul ref={listRef} id="search-results" className={styles.results} role="listbox" aria-label="Search results">
          {results.length === 0 && <li className={styles.empty}>No matches</li>}
          {results.map((r, i) => (
            <li key={r.id} id={`search-option-${i}`} role="option" aria-selected={i === active} className={i === active ? styles.optionActive : undefined}>
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