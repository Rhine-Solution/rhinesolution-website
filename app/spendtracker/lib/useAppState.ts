"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppState, Entry, Settings } from "./types";
import { getCategory } from "./categories";
import { monthKey, todayISO, uid } from "./format";

const STORAGE_KEY = "purr-ts-state-v1";

const DEFAULT_SETTINGS: Settings = {
  budget: 500,
  goalName: "Switch Console",
  goalAmount: 1500,
  currency: "USD",
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const SEED: Entry[] = [
  { id: uid(), type: "spend", amount: 12, category: "food", note: "Ramen lunch", date: daysAgo(0) },
  { id: uid(), type: "spend", amount: 35, category: "transport", note: "Train pass", date: daysAgo(1) },
  { id: uid(), type: "save", amount: 40, category: "other", note: "Payday stash", date: daysAgo(1) },
  { id: uid(), type: "spend", amount: 9, category: "games", note: "Skin pack", date: daysAgo(2) },
  { id: uid(), type: "spend", amount: 8, category: "treats", note: "Boba + cupcake", date: daysAgo(3) },
  { id: uid(), type: "save", amount: 25, category: "other", note: "Side gig", date: daysAgo(4) },
];

function seedState(): AppState {
  return { entries: SEED, settings: DEFAULT_SETTINGS };
}

function load(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return seedState();
  }
}

export interface Stats {
  balance: number;
  monthSpend: number;
  monthSave: number;
  spentPct: number;
  remaining: number;
  streak: number;
  savedToday: boolean;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [state, ready]);

  const addEntry = (e: Omit<Entry, "id">) =>
    setState((s) => ({ ...s, entries: [{ ...e, id: uid() }, ...s.entries] }));

  const updateEntry = (id: string, e: Omit<Entry, "id">) =>
    setState((s) => ({
      ...s,
      entries: s.entries.map((x) => (x.id === id ? { ...e, id } : x)),
    }));

  const deleteEntry = (id: string) =>
    setState((s) => ({ ...s, entries: s.entries.filter((x) => x.id !== id) }));

  const setSettings = (patch: Partial<Settings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const resetAll = () => {
    setState({ entries: [], settings: DEFAULT_SETTINGS });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const stats: Stats = useMemo(() => {
    const mk = monthKey(new Date());
    const today = todayISO();
    let balance = 0;
    let monthSpend = 0;
    let monthSave = 0;
    let savedToday = false;
    const daysWithActivity = new Set<string>();

    for (const e of state.entries) {
      const delta = e.type === "save" ? e.amount : -e.amount;
      balance += delta;
      if (e.type === "save" && e.date === today) savedToday = true;
      if (monthKey(new Date(e.date + "T00:00:00")) === mk) {
        if (e.type === "spend") monthSpend += e.amount;
        else monthSave += e.amount;
      }
      daysWithActivity.add(e.date);
    }

    const streak = computeStreak(daysWithActivity);
    const spentPct =
      state.settings.budget > 0 ? Math.min(monthSpend / state.settings.budget, 1) : 0;

    return {
      balance,
      monthSpend,
      monthSave,
      spentPct,
      remaining: state.settings.budget - monthSpend,
      streak,
      savedToday,
    };
  }, [state]);

  const categoryTotals = useMemo(() => {
    const mk = monthKey(new Date());
    const totals = new Map<string, { spent: number; saved: number }>();
    for (const c of ["food", "transport", "games", "treats", "home", "other"]) {
      totals.set(c, { spent: 0, saved: 0 });
    }
    for (const e of state.entries) {
      if (monthKey(new Date(e.date + "T00:00:00")) !== mk) continue;
      const t = totals.get(e.category)!;
      if (e.type === "spend") t.spent += e.amount;
      else t.saved += e.amount;
    }
    return Array.from(totals.entries()).map(([id, t]) => ({
      cat: getCategory(id as Entry["category"]),
      ...t,
    }));
  }, [state]);

  return {
    state,
    ready,
    stats,
    categoryTotals,
    addEntry,
    updateEntry,
    deleteEntry,
    setSettings,
    resetAll,
  };
}

function computeStreak(days: Set<string>): number {
  const today = new Date(todayISO() + "T00:00:00");
  // allow streak that starts today OR yesterday
  const cursor = new Date(today);
  if (!days.has(toLocalISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toLocalISO(cursor))) return 0;
  }
  let count = 0;
  while (days.has(toLocalISO(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
