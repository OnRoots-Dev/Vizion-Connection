"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default function DaySlider({
  selected,
  onChangeSelected,
}: {
  selected: Date;
  onChangeSelected: (d: Date) => void;
}) {
  const selectedDay = useMemo(() => startOfDay(selected), [selected]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const [windowStart, setWindowStart] = useState<Date>(() => addDays(selectedDay, -3));

  useEffect(() => {
    // keep selected roughly centered
    const diff = Math.round((selectedDay.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000));
    if (diff < 2 || diff > 4) {
      setWindowStart(addDays(selectedDay, -3));
    }
  }, [selectedDay, windowStart]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i += 1) out.push(addDays(windowStart, i));
    return out;
  }, [windowStart]);

  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    isDraggingRef.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (touchStartXRef.current == null) return;
    const x = e.touches[0]?.clientX;
    if (typeof x !== "number") return;
    touchDeltaXRef.current = x - touchStartXRef.current;
  }, []);

  const shiftWindow = useCallback(
    (dir: -1 | 1) => {
      const nextStart = addDays(windowStart, dir);
      const nextSelected = addDays(selectedDay, dir);
      setWindowStart(nextStart);
      onChangeSelected(nextSelected);
    },
    [onChangeSelected, selectedDay, windowStart]
  );

  const onTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = touchDeltaXRef.current;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;

    if (Math.abs(dx) < 40) return;
    // swipe left => next day
    if (dx < 0) {
      shiftWindow(1);
    } else {
      shiftWindow(-1);
    }
  }, [shiftWindow]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        shiftWindow(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        shiftWindow(1);
      }
    },
    [shiftWindow]
  );

  return (
    <div
      className="w-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label="日付スライダー"
    >
      <div className="grid grid-cols-7 gap-2 px-2">
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDay);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => {
                onChangeSelected(d);
                setWindowStart(addDays(d, -3));
              }}
              className="flex flex-col items-center gap-1 rounded-xl py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`}
            >
              <div className={"text-[10px] font-bold tracking-wide " + (isToday ? "text-primary" : "text-foreground/60")}>
                {DOW[d.getDay()]}
              </div>
              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums transition-colors " +
                  (isSelected ? "bg-primary text-primary-foreground" : "text-foreground/85 hover:bg-muted/50") +
                  (isToday && !isSelected ? " ring-1 ring-primary/70" : "")
                }
              >
                {d.getDate()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
