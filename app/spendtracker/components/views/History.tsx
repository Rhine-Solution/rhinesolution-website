"use client";

import { useMemo, useState } from "react";
import Card from "../Card";
import Btn from "../Btn";
import EntryRow from "../EntryRow";
import { PawPrint } from "lucide-react";
import type { CategoryId, Entry, EntryType } from "../../lib/types";
import { CATEGORIES } from "../../lib/categories";
import { money, prettyDate } from "../../lib/format";

interface HistoryProps {
  entries: Entry[];
  currency: string;
  onOpenAdd: (type: EntryType) => void;
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
}

type Filter = "all" | EntryType;

export default function History({
  entries,
  currency,
  onOpenAdd,
  onEditEntry,
  onDeleteEntry,
}: HistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");

  const filtered = useMemo(() => {
    return entries
      .filter((e) => (filter === "all" ? true : e.type === filter))
      .filter((e) => (category === "all" ? true : e.category === category))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [entries, filter, category]);

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const total = filtered.reduce((sum, e) => sum + (e.type === "save" ? e.amount : -e.amount), 0);

  return (
    <div className="animate-fade-in-up flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {(["all", "spend", "save"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl border-2 border-[var(--ink)] px-3 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                filter === f ? "bg-[var(--lavender)] hard-shadow-sm" : "bg-card"
              }`}
            >
              {f === "all" ? "All" : f === "spend" ? "Spent" : "Saved"}
            </button>
          ))}
        </div>
        <Btn size="sm" onClick={() => onOpenAdd("spend")} color="#f6d0f1">
          + Add
        </Btn>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-xl border-2 border-[var(--ink)] px-2.5 py-1 text-xs font-bold ${
            category === "all" ? "bg-[var(--muted)] hard-shadow-sm" : "bg-card"
          }`}
        >
          All cats
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex items-center gap-1 rounded-xl border-2 border-[var(--ink)] px-2.5 py-1 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
              category === c.id ? "hard-shadow-sm" : "bg-card"
            }`}
            style={{ backgroundColor: category === c.id ? c.color : undefined }}
          >
            <c.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {c.label}
          </button>
        ))}
      </div>

      <Card color="#fffbf3" className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
        <span
          className={`text-lg font-bold ${
            total < 0 ? "text-[var(--ink)]" : "text-[#3fa86e]"
          }`}
        >
          {total < 0 ? "−" : "+"}
          {money(Math.abs(total), currency)}
        </span>
      </Card>

      {groups.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <PawPrint className="h-10 w-10 text-[var(--lavender-deep)]" strokeWidth={2} />
          <p className="text-sm font-bold">Nothing here.</p>
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            Try a different filter, or log something new!
          </p>
        </Card>
      ) : (
        groups.map(([date, list]) => (
          <section key={date}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
              {prettyDate(date)}
            </p>
            <div className="flex flex-col gap-2">
              {list.map((e) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  currency={currency}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
