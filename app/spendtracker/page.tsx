"use client";

import { useState } from "react";
import {
  ChartColumn,
  Coins,
  Home,
  PawPrint,
  PiggyBank,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import PawCursor from "./components/PawCursor";
import AddEntryModal from "./components/AddEntryModal";
import SettingsModal from "./components/SettingsModal";
import Dashboard from "./components/views/Dashboard";
import History from "./components/views/History";
import Goals from "./components/views/Goals";
import Insights from "./components/views/Insights";
import { useAppState } from "./lib/useAppState";
import type { Entry, TabId } from "./lib/types";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "dashboard", label: "Home", Icon: Home },
  { id: "history", label: "History", Icon: Receipt },
  { id: "goals", label: "Goals", Icon: PiggyBank },
  { id: "insights", label: "Insights", Icon: ChartColumn },
];

export default function Page() {
  const app = useAppState();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<"spend" | "save">("spend");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openAdd = (type: "spend" | "save") => {
    setEditing(null);
    setAddType(type);
    setAddOpen(true);
  };

  const openEdit = (entry: Entry) => {
    setEditing(entry);
    setAddOpen(true);
  };

  const handleSave = (e: Omit<Entry, "id">) => {
    if (editing) app.updateEntry(editing.id, e);
    else app.addEntry(e);
    setEditing(null);
  };

  const totalSaved = app.state.entries
    .filter((e) => e.type === "save")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <PawCursor />
      <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 px-4 py-8 pb-16 sm:px-6">
        {/* header */}
        <header className="flex flex-col items-center gap-1 text-center">
          <div className="animate-wiggle">
            <PawPrint className="h-9 w-9" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Purr-ts <Coins className="mb-1 inline-block h-6 w-6" strokeWidth={2.5} />
          </h1>
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
            A tiny money log for your daily coinz
          </p>
        </header>

        {/* tab nav */}
        <nav className="grid grid-cols-4 gap-2" aria-label="Views">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 rounded-2xl border-[3px] border-[var(--ink)] px-2 py-2.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                tab === t.id ? "hard-shadow bg-[var(--accent)]" : "bg-card"
              }`}
            >
              <t.Icon className="h-5 w-5" strokeWidth={2.5} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* views */}
        {tab === "dashboard" && (
          <Dashboard
            stats={app.stats}
            entries={app.state.entries}
            currency={app.state.settings.currency}
            budget={app.state.settings.budget}
            onOpenAdd={openAdd}
            onEditEntry={openEdit}
            onDeleteEntry={app.deleteEntry}
            onOpenSettings={() => setSettingsOpen(true)}
            goTo={setTab}
          />
        )}
        {tab === "history" && (
          <History
            entries={app.state.entries}
            currency={app.state.settings.currency}
            onOpenAdd={openAdd}
            onEditEntry={openEdit}
            onDeleteEntry={app.deleteEntry}
          />
        )}
        {tab === "goals" && (
          <Goals
            settings={app.state.settings}
            totalSaved={totalSaved}
            onOpenAdd={openAdd}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {tab === "insights" && (
          <Insights
            totals={app.categoryTotals}
            currency={app.state.settings.currency}
            monthSpend={app.stats.monthSpend}
            monthSave={app.stats.monthSave}
          />
        )}
      </main>

      {/* floating add button */}
      <button
        onClick={() => openAdd("spend")}
        aria-label="Add entry"
        className="btn-lift fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--pink)] text-2xl font-bold hard-shadow"
      >
        +
      </button>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
        <span className="rounded-lg bg-[var(--card)]/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          purr-ts · data stays on your device
        </span>
      </footer>

      <AddEntryModal
        open={addOpen}
        editing={editing}
        initialType={addType}
        currency={app.state.settings.currency}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <SettingsModal
        open={settingsOpen}
        settings={app.state.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={app.setSettings}
        onReset={app.resetAll}
      />
    </>
  );
}
