"use client";

import Card from "../Card";
import PixelMeter from "../PixelMeter";
import { ChartColumn, Leaf } from "lucide-react";
import { money } from "../../lib/format";
import type { Category } from "../../lib/categories";

export interface CategoryTotal {
  cat: Category;
  spent: number;
  saved: number;
}

interface InsightsProps {
  totals: CategoryTotal[];
  currency: string;
  monthSpend: number;
  monthSave: number;
}

export default function Insights({ totals, currency, monthSpend, monthSave }: InsightsProps) {
  const ranked = [...totals]
    .filter((t) => t.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const max = ranked[0]?.spent ?? 1;
  const top = ranked[0];
  const percent = (v: number) => (max > 0 ? v / max : 0);

  return (
    <div className="animate-fade-in-up flex flex-col gap-5">
      {/* summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card color="#ffd0d0" className="p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em]">Spent</p>
          <p className="text-xl font-bold">{money(monthSpend, currency)}</p>
        </Card>
        <Card color="#bdecd0" className="p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em]">Saved</p>
          <p className="text-xl font-bold">{money(monthSave, currency)}</p>
        </Card>
      </div>

      {top && (
        <Card color="#fffbf3" className="flex items-center gap-3 p-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--ink)]"
            style={{ backgroundColor: top.cat.color }}
          >
            <top.cat.icon className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-bold">
              Most spent on <span style={{ color: top.cat.deep }}>{top.cat.label}</span> this month
            </p>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              {money(top.spent, currency)} so far
            </p>
          </div>
        </Card>
      )}

      {/* breakdown */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
          Where the coins went
        </h3>
        {ranked.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Leaf className="h-9 w-9 text-[var(--mint-deep)]" strokeWidth={2} />
            <p className="text-sm font-bold">Nothing spent this month.</p>
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              Your wallet is resting.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ranked.map((t) => (
              <div key={t.cat.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <t.cat.icon className="h-4 w-4" strokeWidth={2.5} />
                    {t.cat.label}
                  </span>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {money(t.spent, currency)}
                  </span>
                </div>
                <PixelMeter
                  value={percent(t.spent)}
                  squares={18}
                  color={t.cat.deep}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col items-center gap-2 p-5 text-center">
        <ChartColumn className="h-9 w-9" strokeWidth={2} style={{ color: "#b39af5" }} />
        <p className="text-sm font-bold">Pixel insights</p>
        <p className="max-w-xs text-xs font-semibold text-[var(--muted-foreground)]">
          This shows just the current month. Log more days and watch the bars grow.
        </p>
      </Card>
    </div>
  );
}
