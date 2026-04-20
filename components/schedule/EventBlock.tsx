"use client";

import { useMemo } from "react";
import type { EventContentArg } from "@fullcalendar/core";

function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function EventBlock({ arg }: { arg: EventContentArg }) {
  const { event, view } = arg;
  const { eventType } = (event.extendedProps as any) ?? {};

  const accent = useMemo(() => {
    if (typeof event.borderColor === "string" && event.borderColor) return event.borderColor;
    if (typeof event.backgroundColor === "string" && event.backgroundColor) return event.backgroundColor;

    if (eventType === "shared") return "#32D278";
    if (eventType === "event") return "#FFA726";
    if (eventType === "booking") return "#A78BFA";
    return "#3C8CFF";
  }, [event.backgroundColor, event.borderColor, eventType]);

  const isList = view.type.startsWith("list");
  const isTimed = !event.allDay;
  const start = event.start;
  const showTime = Boolean(isList && isTimed && start);

  return (
    <div
      className={
        "group relative flex w-full items-start gap-2 rounded-[10px] border border-border/60 bg-card/70 px-2 py-1.5 text-foreground shadow-sm transition-colors " +
        "hover:bg-card/90 focus-within:ring-2 focus-within:ring-ring/50"
      }
      style={{
        borderLeftWidth: 4,
        borderLeftColor: accent,
      }}
      aria-label={event.title ? `予定: ${event.title}` : "予定"}
    >
      {showTime ? (
        <div className={"shrink-0 text-[11px] font-semibold tabular-nums " + (isList ? "pt-0.5" : "")}
          aria-label={`開始時刻 ${formatTime(start!)}`}
        >
          {formatTime(start!)}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold leading-4">{event.title}</div>
        {!isList && event.extendedProps?.location ? (
          <div className="truncate text-[10px] text-muted-foreground">{String(event.extendedProps.location)}</div>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent 65%)" }}
      />
    </div>
  );
}
