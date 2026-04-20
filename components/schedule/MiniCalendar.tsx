"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatYearMonth(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default function MiniCalendar({
  month,
  selected,
  onChangeMonth,
  onSelectDate,
}: {
  month: Date;
  selected: Date;
  onChangeMonth: (next: Date) => void;
  onSelectDate: (d: Date) => void;
}) {
  const today = useMemo(() => new Date(), []);

  const grid = useMemo(() => {
    const mStart = startOfMonth(month);
    const mEnd = endOfMonth(month);
    const gridStart = startOfWeek(mStart);

    const days: Date[] = [];
    const cur = new Date(gridStart);
    for (let i = 0; i < 42; i += 1) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return {
      title: formatYearMonth(month),
      monthStart: mStart,
      monthEnd: mEnd,
      days,
    };
  }, [month]);

  return (
    <div className="w-full rounded-2xl border border-border bg-card/60 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChangeMonth(addMonths(month, -1))}
          aria-label="前の月"
        >
          <span aria-hidden>←</span>
        </Button>

        <div className="min-w-0 truncate text-[12px] font-extrabold tracking-wide text-foreground/90" aria-label={grid.title}>
          {grid.title}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChangeMonth(addMonths(month, 1))}
          aria-label="次の月"
        >
          <span aria-hidden>→</span>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <div key={d} className="pb-1 text-center text-[10px] font-bold tracking-wide text-muted-foreground" aria-label={d}>
            {d}
          </div>
        ))}

        {grid.days.map((d) => {
          const inMonth = d.getMonth() === month.getMonth();
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selected);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDate(d)}
              className={
                "flex h-7 w-full items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 " +
                (inMonth ? "text-foreground" : "text-muted-foreground/55") +
                (isSelected ? " bg-primary text-primary-foreground" : " hover:bg-muted/50") +
                (isToday && !isSelected ? " ring-1 ring-primary/70" : "")
              }
              aria-label={`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
