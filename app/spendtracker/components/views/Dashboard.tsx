"use client";

import Card from "../Card";
import Btn from "../Btn";
import EntryRow from "../EntryRow";
import PixelMeter from "../PixelMeter";
import { PixelCat, PixelCoin } from "../PixelArt";
import { CircleMinus, CirclePlus, Flame, Settings } from "lucide-react";
import type { Entry, TabId } from "../../lib/types";
import type { Stats } from "../../lib/useAppState";
import { money } from "../../lib/format";

interface DashboardProps {
  stats: Stats;
  entries: Entry[];
  currency: string;
  budget: number;
  onOpenAdd: (type: "spend" | "save") => void;
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenSettings: () => void;
  goTo: (tab: TabId) => void;
}

export default function Dashboard({
  stats,
  entries,
  currency,
  budget,
  onOpenAdd,
  onEditEntry,
  onDeleteEntry,
  onOpenSettings,
  goTo,
}: DashboardProps) {
  const over = stats.remaining < 0;
  const recent = entries.slice(0, 4);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-fade-in-up flex flex-col gap-5">
      {/* hero */}
      <Card color="#fffbf3" glow>
        <div className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              {greeting} · {today}
            </p>
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              {money(stats.balance, currency)}
            </p>
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              {stats.balance >= 0 ? "you're in the green" : "digging a hole"}
            </p>
          </div>
          <div className="animate-pet-bounce">
            <PixelCat fur="#ffc4e1" px={14} />
          </div>
        </div>
      </Card>

      {/* quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpenAdd("spend")}
          className="btn-lift rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--red)] px-4 py-3 text-sm font-bold hard-shadow"
        >
          <CircleMinus className="mr-1.5 inline-block h-4 w-4" strokeWidth={2.5} />
          Log spend
        </button>
        <button
          onClick={() => onOpenAdd("save")}
          className="btn-lift rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--mint)] px-4 py-3 text-sm font-bold hard-shadow"
        >
          <CirclePlus className="mr-1.5 inline-block h-4 w-4" strokeWidth={2.5} />
          Log save
        </button>
      </div>

      {/* this month + streak */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card color="#fffbf3" className="p-4 sm:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
              This month
            </h3>
            <button
              onClick={onOpenSettings}
              className="btn-lift-sm rounded-lg border-2 border-[var(--ink)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-bold hard-shadow-sm"
            >
              <Settings className="mr-1 inline-block h-3 w-3" strokeWidth={2.5} />
              budget
            </button>
          </div>
          <div className="mb-2 flex items-end justify-between">
            <p className="text-2xl font-bold">
              {money(stats.monthSpend, currency)}
              <span className="ml-1 text-sm font-semibold text-[var(--muted-foreground)]">
                of {money(budget, currency)}
              </span>
            </p>
            <span
              className={`rounded-xl border-2 border-[var(--ink)] px-2 py-0.5 text-xs font-bold ${
                over ? "bg-[var(--red)]" : "bg-[var(--mint)]"
              }`}
            >
              {over ? `${money(Math.abs(stats.remaining), currency)} over` : `${money(stats.remaining, currency)} left`}
            </span>
          </div>
          <PixelMeter
            value={stats.spentPct}
            color={over ? "#ff8f8f" : "#7fd6a6"}
          />
        </Card>

        <Card color="#d7c9ff" className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ink)]">
            <Flame className="mr-1 inline-block h-3 w-3" strokeWidth={2.5} />
            Streak
          </p>
          <p className="text-3xl font-bold leading-tight">{stats.streak}</p>
          <p className="text-xs font-semibold">
            {stats.streak === 0 ? "log a day to start" : stats.streak === 1 ? "day tracked" : "days tracked"}
          </p>
        </Card>
      </div>

      {/* savings bonus */}
      {stats.savedToday && (
        <Card color="#fff3c4" className="flex items-center gap-3 p-4">
          <span className="animate-coin-pop">
            <PixelCoin px={14} />
          </span>
          <div>
            <p className="text-sm font-bold">Saved something today — nice!</p>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              Your kitty is proud of you.
            </p>
          </div>
        </Card>
      )}

      {/* recent */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
            Recent
          </h3>
          <button
            onClick={() => goTo("history")}
            className="btn-lift-sm rounded-xl border-2 border-[var(--ink)] bg-[var(--lavender)] px-3 py-1 text-xs font-bold hard-shadow-sm"
          >
            See all →
          </button>
        </div>
        {recent.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-6 text-center">
            <PixelCat fur="#ffc4e1" px={10} />
            <p className="text-sm font-bold">No entries yet!</p>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              Tap “Log spend” or “Log save” to start.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((e) => (
              <EntryRow
                key={e.id}
                entry={e}
                currency={currency}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-center pb-2">
        <Btn size="sm" onClick={onOpenSettings} className="bg-[var(--muted)]">
          Settings
        </Btn>
      </div>
    </div>
  );
}
