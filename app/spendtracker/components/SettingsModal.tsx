"use client";

import { useState } from "react";
import Modal from "./Modal";
import Btn from "./Btn";
import { Trash2 } from "lucide-react";
import type { Settings } from "../lib/types";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "BRL", "JPY", "AUD", "CAD"];

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export default function SettingsModal({
  open,
  settings,
  onClose,
  onSave,
  onReset,
}: SettingsModalProps) {
  const [budget, setBudget] = useState(String(settings.budget));
  const [goalName, setGoalName] = useState(settings.goalName);
  const [goalAmount, setGoalAmount] = useState(String(settings.goalAmount));
  const [currency, setCurrency] = useState(settings.currency);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? "open" : "closed";
  if (key !== lastKey) {
    setLastKey(key);
    if (open) {
      setBudget(String(settings.budget));
      setGoalName(settings.goalName);
      setGoalAmount(String(settings.goalAmount));
      setCurrency(settings.currency);
    }
  }

  const save = () => {
    onSave({
      budget: Math.max(0, parseFloat(budget) || 0),
      goalName: goalName.trim() || "Goal",
      goalAmount: Math.max(0, parseFloat(goalAmount) || 0),
      currency,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Monthly budget
          </span>
          <input
            type="number"
            name="budget"
            min="0"
            step="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-4 py-2.5 text-sm font-bold hard-shadow-sm outline-none focus:bg-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
              Savings goal
            </span>
            <input
              type="text"
              name="goalName"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              maxLength={24}
              className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-3 py-2.5 text-sm font-bold hard-shadow-sm outline-none focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
              Goal amount
            </span>
            <input
              type="number"
              name="goalAmount"
              min="0"
              step="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full rounded-2xl border-[3px] border-[var(--ink)] bg-card px-3 py-2.5 text-sm font-bold hard-shadow-sm outline-none focus:bg-white"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Currency
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-xl border-2 border-[var(--ink)] px-3 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                  currency === c ? "bg-[var(--lavender)] hard-shadow-sm" : "bg-card"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </label>

        <div className="flex flex-col gap-2 pt-1">
          <Btn size="md" onClick={save} color="#f6d0f1" className="w-full">
            Save settings
          </Btn>
          <button
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm("Delete ALL your entries and start fresh?")
              ) {
                onReset();
                onClose();
              }
            }}
            className="btn-lift-sm w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--red)] px-4 py-2 text-xs font-bold hard-shadow-sm"
          >
            <Trash2 className="mr-1.5 inline-block h-3.5 w-3.5" strokeWidth={2.5} />
            Reset all data
          </button>
        </div>
      </div>
    </Modal>
  );
}
