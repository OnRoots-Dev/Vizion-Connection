"use client";

import type { EventInput } from "@fullcalendar/core";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function DayEventList({
  selected,
  events,
  onClickEvent,
  onCreateAt,
  canEdit,
  showAll,
}: {
  selected: Date;
  events: EventInput[];
  onClickEvent: (id: string) => void;
  onCreateAt: (d: Date) => void;
  canEdit: boolean;
  showAll?: boolean;
}) {
  const dayStart = startOfDay(selected);
  const dayEnd = endOfDay(selected);

  const showAllResolved = Boolean(showAll);

  const items = events
    .map((e) => {
      const start = e.start ? new Date(e.start as any) : null;
      const end = e.end ? new Date(e.end as any) : null;
      const allDay = Boolean((e as any).allDay);
      return { e, start, end, allDay };
    })
    .filter(({ start }) => {
      if (!start) return false;
      if (showAllResolved) return true;
      return start >= dayStart && start <= dayEnd;
    })
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

  const grouped = showAllResolved
    ? items.reduce((acc, item) => {
        const key = item.start ? startOfDay(item.start).toISOString() : "unknown";
        const list = acc.get(key) ?? [];
        list.push(item);
        acc.set(key, list);
        return acc;
      }, new Map<string, typeof items>())
    : null;

  return (
    <div className="w-full p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="text-[12px] font-extrabold tracking-wide text-foreground" aria-label="表示中の予定一覧">
          {showAllResolved ? "この週の予定" : "この日の予定"}
        </div>

        {canEdit ? (
          <button
            type="button"
            onClick={() => onCreateAt(selected)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="この日に予定を追加"
          >
            ＋ 追加
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="px-2 py-8 text-center text-sm text-muted-foreground" aria-label="予定はありません">
          予定はありません
        </div>
      ) : showAllResolved && grouped ? (
        <div className="flex flex-col gap-3 px-1 pb-2">
          {Array.from(grouped.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([k, list]) => {
              const d = new Date(k);
              const label = `${d.getMonth() + 1}/${d.getDate()} (${["日", "月", "火", "水", "木", "金", "土"][d.getDay()]})`;
              return (
                <div key={k} className="flex flex-col gap-2">
                  <div className="px-1 text-[11px] font-extrabold tracking-wide text-foreground/80">{label}</div>
                  <div className="flex flex-col gap-2">
                    {list.map(({ e, start, allDay }) => {
                      const title = typeof e.title === "string" ? e.title : "(無題)";
                      const timeLabel = allDay ? "終日" : start ? formatTime(start) : "";

                      const borderColor = typeof (e as any).borderColor === "string" ? ((e as any).borderColor as string) : null;
                      const bgColor = typeof (e as any).backgroundColor === "string" ? ((e as any).backgroundColor as string) : null;
                      const accent = borderColor ?? bgColor ?? "#3C8CFF";

                      return (
                        <button
                          key={String(e.id)}
                          type="button"
                          onClick={() => onClickEvent(String(e.id))}
                          className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card/70 px-3 py-3 text-left transition-colors hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          aria-label={`予定: ${title}`}
                        >
                          <div className="shrink-0 pt-0.5 text-[11px] font-extrabold tabular-nums text-foreground/85" aria-label={`時刻 ${timeLabel}`}>
                            {timeLabel}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-semibold text-foreground">{title}</div>
                            {e.extendedProps?.location ? (
                              <div className="truncate text-[11px] text-muted-foreground">{String(e.extendedProps.location)}</div>
                            ) : null}
                          </div>

                          <div className="h-6 w-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-1 pb-2">
          {items.map(({ e, start, allDay }) => {
            const title = typeof e.title === "string" ? e.title : "(無題)";
            const timeLabel = allDay ? "終日" : start ? formatTime(start) : "";

            const borderColor = typeof (e as any).borderColor === "string" ? ((e as any).borderColor as string) : null;
            const bgColor = typeof (e as any).backgroundColor === "string" ? ((e as any).backgroundColor as string) : null;
            const accent = borderColor ?? bgColor ?? "#3C8CFF";

            return (
              <button
                key={String(e.id)}
                type="button"
                onClick={() => onClickEvent(String(e.id))}
                className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card/70 px-3 py-3 text-left transition-colors hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={`予定: ${title}`}
              >
                <div className="shrink-0 pt-0.5 text-[11px] font-extrabold tabular-nums text-foreground/85" aria-label={`時刻 ${timeLabel}`}>
                  {timeLabel}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-foreground">{title}</div>
                  {e.extendedProps?.location ? (
                    <div className="truncate text-[11px] text-muted-foreground">{String(e.extendedProps.location)}</div>
                  ) : null}
                </div>

                <div className="h-6 w-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
