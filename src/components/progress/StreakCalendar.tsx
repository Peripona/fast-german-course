"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StreakCalendar({ days = 90 }: { days?: number }) {
  const dailyStats = useAppStore((s) => s.dailyStats);

  const activity = useMemo(() => {
    const map = new Map(dailyStats.map((d) => [d.date, d.cardsReviewed + d.lessonsCompleted]));
    const out: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, count: map.get(key) ?? 0 });
    }
    return out;
  }, [dailyStats, days]);

  const max = Math.max(1, ...activity.map((a) => a.count));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Last {days} days</p>
      <div className="flex flex-wrap gap-0.5">
        {activity.map((a) => {
          const intensity = a.count === 0 ? 0 : 0.25 + (a.count / max) * 0.75;
          return (
            <div
              key={a.date}
              title={`${a.date}: ${a.count} activities`}
              className={cn(
                "size-2.5 rounded-sm",
                a.count === 0 ? "bg-muted" : "bg-destructive",
              )}
              style={{ opacity: a.count === 0 ? 1 : intensity }}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Darker = more activity that day</p>
    </div>
  );
}
