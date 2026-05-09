"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getYearlySavingsTrack } from "@/lib/budget";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const CURRENT_MONTH = new Date().getMonth(); // 0-indexed

interface MonthlyCheckboxTrackerProps {
  userId: string;
}

export function MonthlyCheckboxTracker({
  userId,
}: MonthlyCheckboxTrackerProps) {
  const [checkedMonths, setCheckedMonths] = useState<Set<number>>(new Set());
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const data = await getYearlySavingsTrack(
          userId,
          new Date().getFullYear(),
        );
        const saved = new Set<number>();
        let total = 0;
        data.forEach((item, idx) => {
          if (item.saved) saved.add(idx);
          total += item.amount;
        });
        setCheckedMonths(saved);
        setTotalSaved(total);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const completedCount = checkedMonths.size;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title">📅 {new Date().getFullYear()} Savings</h2>
        <span className="text-xs font-mono text-muted-foreground">
          {completedCount}/12 months
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {MONTHS.map((month, idx) => {
          const isDone = checkedMonths.has(idx);
          const isCurrent = idx === CURRENT_MONTH;
          const isFuture = idx > CURRENT_MONTH;

          return (
            <div
              key={month}
              className={cn(
                "aspect-square rounded-lg text-[10px] font-mono font-semibold",
                "flex items-center justify-center border transition-all",
                isFuture &&
                  "opacity-25 cursor-default border-border bg-muted/20 text-muted-foreground",
                !isFuture &&
                  !isDone &&
                  !isCurrent &&
                  "border-border bg-muted/30 text-muted-foreground",
                isCurrent &&
                  !isDone &&
                  "border-violet-500 text-violet-400 bg-violet-500/10",
                isDone &&
                  "border-green-500/40 bg-green-500/15 text-green-400 shadow-[0_0_6px_rgba(74,222,128,0.2)]",
              )}
            >
              {isDone ? "✓" : month}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 font-mono">
        ₹{totalSaved.toLocaleString("en-IN")} saved this year
      </p>
    </div>
  );
}
