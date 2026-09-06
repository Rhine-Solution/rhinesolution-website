"use client";

import type { Entry } from "../lib/types";
import { getCategory } from "../lib/categories";
import { Pencil, X } from "lucide-react";
import { money, prettyDate } from "../lib/format";

interface EntryRowProps {
  entry: Entry;
  currency: string;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export default function EntryRow({ entry, currency, onEdit, onDelete }: EntryRowProps) {
  const cat = getCategory(entry.category);
  const isSave = entry.type === "save";
  return (
    <div
      className="group flex items-center gap-3 rounded-2xl border-2 border-[var(--ink)] bg-card px-3 py-2.5 hard-shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--ink)]"
        style={{ backgroundColor: cat.color }}
      >
        <cat.icon className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight">
          {entry.note || cat.label}
        </p>
        <p className="text-xs font-medium text-[var(--muted-foreground)]">
          {cat.label} · {prettyDate(entry.date)}
        </p>
      </div>
      <span
        className={`text-sm font-bold ${
          isSave ? "text-[#3fa86e]" : "text-[var(--ink)]"
        }`}
      >
        {isSave ? "+" : "−"}
        {money(entry.amount, currency)}
      </span>
      <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          onClick={() => onEdit(entry)}
          aria-label={`Edit ${entry.note || cat.label}`}
          className="btn-lift-sm flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-[var(--muted)] font-bold hard-shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          aria-label={`Delete ${entry.note || cat.label}`}
          className="btn-lift-sm flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-[var(--red)] font-bold hard-shadow-sm"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
