"use client";

import { useState } from "react";
import Modal from "./Modal";
import Btn from "./Btn";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { CategoryId, Entry, EntryType } from "../lib/types";
import { CATEGORIES } from "../lib/categories";
import { money, todayISO } from "../lib/format";

interface AddEntryModalProps {
  open: boolean;
  editing: Entry | null;
  initialType?: EntryType;
  currency: string;
  onClose: () => void;
  onSave: (entry: Omit<Entry, "id">) => void;
}

export default function AddEntryModal({
  open,
  editing,
  initialType = "spend",
  currency,
  onClose,
  onSave,
}: AddEntryModalProps) {
  const [type, setType] = useState<EntryType>("spend");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [touched, setTouched] = useState(false);

  // reset fields whenever the modal opens (or editing target changes)
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = editing ? editing.id : `new-${initialType}`;
  if (key !== lastKey) {
    setLastKey(key);
    setType(editing?.type ?? initialType);
    setAmount(editing ? String(editing.amount) : "");
    setCategory(editing?.category ?? "food");
    setNote(editing?.note ?? "");
    setDate(editing?.date ?? todayISO());
    setTouched(false);
  }

  const parsed = parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSave({ type, amount: parsed, category, note: note.trim(), date });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Entry" : "New Entry"}>
      <div className="flex flex-col gap-4">
        {/* type toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(["spend", "save"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-2xl border-[3px] border-[var(--ink)] px-4 py-2.5 text-sm font-bold hard-shadow-sm transition-transform duration-150 hover:-translate-y-0.5 ${
                type === t
                  ? t === "spend"
                    ? "bg-[var(--red)]"
                    : "bg-[var(--mint)]"
                  : "bg-[var(--muted)]"
              }`}
            >
              {t === "spend" ? (
                <TrendingDown className="mr-1.5 inline-block h-4 w-4" strokeWidth={2.5} />
              ) : (
                <TrendingUp className="mr-1.5 inline-block h-4 w-4" strokeWidth={2.5} />
              )}
              {t === "spend" ? "Spent" : "Saved"}
            </button>
          ))}
        </div>

        {/* amount */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Amount
          </span>
          <input
            type="number"
            name="amount"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-4 py-3 text-2xl font-bold hard-shadow-sm outline-none focus:bg-white"
          />
          {touched && !valid && (
            <span className="text-xs font-bold text-[var(--destructive)]">
              {type === "spend" ? "How much did you spend?" : "How much did you save?"}
            </span>
          )}
        </label>

        {/* category */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Category
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                  category === c.id ? "hard-shadow-sm" : ""
                }`}
                style={{
                  backgroundColor: category === c.id ? c.color : "#fff",
                  borderColor: "var(--ink)",
                }}
              >
                <c.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* note */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Note <span className="normal-case">(optional)</span>
          </span>
          <input
            type="text"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Boba, train pass, side gig…"
            maxLength={60}
            className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-4 py-2.5 text-sm font-bold hard-shadow-sm outline-none focus:bg-white"
          />
        </label>

        {/* date */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Date
          </span>
          <input
            type="date"
            name="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-4 py-2.5 text-sm font-bold hard-shadow-sm outline-none focus:bg-white"
          />
        </label>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {valid ? money(parsed, currency) : money(0, currency)}
          </span>
          <div className="flex gap-2">
            <Btn size="md" onClick={onClose} className="bg-[var(--muted)]">
              Cancel
            </Btn>
            <Btn
              size="md"
              onClick={submit}
              color={type === "spend" ? "#ffd0d0" : "#bdecd0"}
            >
              {editing ? (
                "Save"
              ) : type === "spend" ? (
                <>
                  <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
                  Log spend
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
                  Log save
                </>
              )}
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}
