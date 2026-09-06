"use client";

import Card from "../Card";
import Btn from "../Btn";
import PixelMeter from "../PixelMeter";
import { PixelJar, PixelStar } from "../PixelArt";
import { Coins, Lightbulb, Plus } from "lucide-react";
import { money } from "../../lib/format";
import type { Settings } from "../../lib/types";

interface GoalsProps {
  settings: Settings;
  totalSaved: number;
  onOpenAdd: (type: "save") => void;
  onOpenSettings: () => void;
}

export default function Goals({
  settings,
  totalSaved,
  onOpenAdd,
  onOpenSettings,
}: GoalsProps) {
  const pct = settings.goalAmount > 0 ? Math.min(totalSaved / settings.goalAmount, 1) : 0;
  const done = settings.goalAmount > 0 && totalSaved >= settings.goalAmount;

  return (
    <div className="animate-fade-in-up flex flex-col gap-5">
      <Card color="#fff3c4" glow>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            Savings Jar <Coins className="ml-1 inline-block h-5 w-5" strokeWidth={2.5} />
          </h3>
          <div className="flex items-end gap-3">
            <div className="animate-cat-breathe">
              <PixelJar fill={pct} px={12} />
            </div>
            <div className="flex flex-col gap-1 pb-1">
              {[0.75, 1, 1.25].map((s, i) => (
                <span
                  key={i}
                  className="animate-sparkle-twinkle text-xs"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <PixelStar color="#ffc4e1" px={7} />
                </span>
              ))}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1 flex items-end justify-between">
              <p className="text-sm font-bold">{settings.goalName}</p>
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                {money(totalSaved, settings.currency)} of {money(settings.goalAmount, settings.currency)}
              </p>
            </div>
            <PixelMeter value={pct} squares={14} color="#ffd76b" />
          </div>
          {done ? (
            <p className="text-sm font-bold">Goal reached — treat yourself!</p>
          ) : (
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              {money(settings.goalAmount - totalSaved, settings.currency)} to go
            </p>
          )}
          <div className="flex gap-2">
            <Btn size="md" onClick={() => onOpenAdd("save")} color="#bdecd0">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add savings
            </Btn>
            <Btn size="md" onClick={onOpenSettings} className="bg-[var(--muted)]">
              Edit goal
            </Btn>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <Lightbulb className="h-9 w-9" strokeWidth={2} style={{ color: "#ffd76b" }} />
        <p className="text-sm font-bold">Tip</p>
        <p className="max-w-xs text-xs font-semibold text-[var(--muted-foreground)]">
          Log tiny saves too — a jar fills faster with many little coins than one big one.
        </p>
      </Card>
    </div>
  );
}
