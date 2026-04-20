"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

function formatYearMonth(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}年${m}月`;
}

function viewLabel(view: CalendarView) {
  if (view === "dayGridMonth") return "月";
  if (view === "timeGridWeek") return "週";
  if (view === "timeGridDay") return "日";
  return "予定";
}

export default function CalendarHeader({
  date,
  view,
  onPrev,
  onToday,
  onNext,
  onChangeView,
  onCreate,
  canEdit,
}: {
  date: Date;
  view: CalendarView;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onChangeView: (v: CalendarView) => void;
  onCreate: () => void;
  canEdit: boolean;
}) {
  const title = useMemo(() => formatYearMonth(date), [date]);

  const views: CalendarView[] = ["dayGridMonth", "timeGridWeek", "timeGridDay", "listWeek"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onPrev}
          aria-label="前へ"
          className="text-foreground bg-background/20 hover:bg-muted/30"
        >
          <span aria-hidden>←</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToday}
          aria-label="今日"
          className="font-mono text-foreground bg-background/20 hover:bg-muted/30"
        >
          TODAY
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onNext}
          aria-label="次へ"
          className="text-foreground bg-background/20 hover:bg-muted/30"
        >
          <span aria-hidden>→</span>
        </Button>

        <div
          className="rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-foreground/85"
          aria-label={`表示中: ${title}`}
        >
          {title}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border border-border bg-muted/20">
          {views.map((v) => {
            const active = v === view;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onChangeView(v)}
                className={
                  "px-3 py-1.5 text-[10px] font-black tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 " +
                  (active
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground")
                }
                aria-label={`ビュー切り替え: ${viewLabel(v)}`}
                aria-pressed={active ? "true" : "false"}
              >
                {viewLabel(v)}
              </button>
            );
          })}
        </div>

        {canEdit ? (
          <Button type="button" onClick={onCreate} className="font-semibold">
            ＋ 予定を追加
          </Button>
        ) : null}
      </div>
    </div>
  );
}
