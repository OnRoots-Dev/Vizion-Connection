"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import type { EventType, Schedule, ScheduleCategory } from "@/types/schedule";
import { CATEGORY_CONFIG, EVENT_TYPE_CONFIG } from "@/types/schedule";
import EventModal from "@/components/schedule/EventModal";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { SLabel, SectionCard, ViewHeader } from "@/app/(app)/dashboard/components/ui";

import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { type DateClickArg, type EventResizeDoneArg } from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import EventBlock from "@/components/schedule/EventBlock";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalDatetimeValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

const LOCK_ICON_PATH =
  "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6A2.25 2.25 0 016.75 10.5z";

type DraftSchedule = {
  id?: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string;
  site_url: string;
  description: string;
  category: ScheduleCategory;
  is_public: boolean;
};

function toDraft(s: Schedule): DraftSchedule {
  return {
    id: s.id,
    title: s.title,
    start_at: toLocalDatetimeValue(new Date(s.start_at)),
    end_at: s.end_at ? toLocalDatetimeValue(new Date(s.end_at)) : "",
    location: s.location ?? "",
    site_url: s.site_url ?? "",
    description: s.description ?? "",
    category: s.category,
    is_public: Boolean(s.is_public),
  };
}

export default function ScheduleClient({
  profile,
  embedded = false,
  onBack,
  t,
  roleColor,
}: {
  profile: ProfileData;
  embedded?: boolean;
  onBack?: () => void;
  t?: ThemeColors;
  roleColor?: string;
}) {
  const router = useRouter();
  const canEdit = true;

  const calendarRef = useRef<FullCalendar | null>(null);
  const fetchSeqRef = useRef(0);
  const lastFetchedRangeRef = useRef<{ startMs: number; endMs: number } | null>(null);
  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek">("dayGridMonth");
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [isMobile, setIsMobile] = useState(false);

  const [visibleRange, setVisibleRange] = useState<{ start: Date; end: Date }>(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    end.setDate(end.getDate() + 14);
    return { start, end };
  });

  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<DraftSchedule>(() => ({
    title: "",
    start_at: toLocalDatetimeValue(new Date()),
    end_at: "",
    location: "",
    site_url: "",
    description: "",
    category: "practice",
    is_public: true,
  }));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCalendarView((prev) => {
        if (!mobile) return prev === "listWeek" ? "timeGridWeek" : prev;
        return prev;
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (isMobile) setCalendarView("listWeek");
  }, [isMobile]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (api.view.type === calendarView) return;
    api.changeView(calendarView);
  }, [calendarView]);

  const fetchRange = useCallback(async (from: Date, to: Date) => {
    const startMs = from.getTime();
    const endMs = to.getTime();
    const last = lastFetchedRangeRef.current;
    if (last && last.startMs === startMs && last.endMs === endMs) return;
    lastFetchedRangeRef.current = { startMs, endMs };

    const seq = (fetchSeqRef.current += 1);
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        start: from.toISOString(),
        end: to.toISOString(),
      });
      const res = await fetch(`/api/schedules/mine?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        console.error("[ScheduleClient] fetchRange failed", { status: res.status, json });
        if (fetchSeqRef.current === seq) setItems([]);
        return;
      }
      if (fetchSeqRef.current === seq) {
        setItems(Array.isArray(json.schedules) ? (json.schedules as Schedule[]) : []);
      }
    } catch (err) {
      console.error("[ScheduleClient] fetchRange error", err);
      if (fetchSeqRef.current === seq) setItems([]);
    } finally {
      if (fetchSeqRef.current === seq) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRange(visibleRange.start, visibleRange.end).catch(() => undefined);
  }, [fetchRange, visibleRange.end, visibleRange.start]);

  const openCreate = () => {
    setErrorMessage(null);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(new Date()),
      end_at: "",
      location: "",
      site_url: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openCreateAtTime = (day: Date, hour: number) => {
    openCreateAtSlot(day, hour, 0);
  };

  const openCreateAtSlot = (day: Date, hour: number, minute: number) => {
    setErrorMessage(null);
    const d = new Date(day);
    d.setHours(hour, minute, 0, 0);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(d),
      end_at: "",
      location: "",
      site_url: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openCreateAt = (day: Date) => {
    setErrorMessage(null);
    const d = new Date(day);
    d.setHours(9, 0, 0, 0);
    setSelected(null);
    setDraft({
      title: "",
      start_at: toLocalDatetimeValue(d),
      end_at: "",
      location: "",
      site_url: "",
      description: "",
      category: "practice",
      is_public: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setErrorMessage(null);
    setSelected(s);
    setDraft(toDraft(s));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setErrorMessage(null);
  };

  const save = async () => {
    if (!canEdit) return;
    if (!draft.title.trim()) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        id: draft.id,
        title: draft.title,
        start_at: new Date(draft.start_at).toISOString(),
        end_at: draft.end_at ? new Date(draft.end_at).toISOString() : null,
        location: draft.location.trim() ? draft.location.trim() : null,
        site_url: draft.site_url.trim() ? draft.site_url.trim() : null,
        description: draft.description.trim() ? draft.description.trim() : null,
        category: draft.category,
        is_public: draft.is_public,
      };

      let savedSchedule: Schedule | null = null;

      if (draft.id) {
        const res = await fetch("/api/schedules", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          console.error("[ScheduleClient] PUT /api/schedules failed", { status: res.status, json });
          throw new Error(typeof json?.error === "string" ? json.error : "予定の更新に失敗しました");
        }
        savedSchedule = (json.schedule as Schedule | undefined) ?? null;
      } else {
        const res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          console.error("[ScheduleClient] POST /api/schedules failed", { status: res.status, json });
          throw new Error(typeof json?.error === "string" ? json.error : "予定の作成に失敗しました");
        }
        savedSchedule = (json.schedule as Schedule | undefined) ?? null;
      }

      if (savedSchedule) {
        setItems((current) => {
          const next = draft.id
            ? current.map((item) => (item.id === savedSchedule!.id ? savedSchedule! : item))
            : [savedSchedule!, ...current];
          return next.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
        });
      }

      // TODO: FanTrise連携 - ファンクラブメンバーへの予定通知
      // TODO: VZ MAP連携 - locationをMapbox上にピン表示
      // TODO: Arena連携 - イベントカテゴリの予定をArenaに自動投稿

      await fetchRange(visibleRange.start, visibleRange.end);
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      setErrorMessage(msg);
      console.error("[ScheduleClient] save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!canEdit) return;
    if (!selected) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        console.error("[ScheduleClient] DELETE /api/schedules failed", { status: res.status, json });
        throw new Error(typeof json?.error === "string" ? json.error : "予定の削除に失敗しました");
      }
      await fetchRange(visibleRange.start, visibleRange.end);
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "削除に失敗しました";
      setErrorMessage(msg);
      console.error("[ScheduleClient] remove failed", err);
    } finally {
      setSaving(false);
    }
  };

  const accentColor = roleColor ?? (profile.role === "Athlete" ? "#C1272D" : profile.role === "Trainer" ? "#1A7A4A" : "#FFD600");
  const theme: ThemeColors = t ?? {
    bg: "#0B0B0F",
    surface: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.10)",
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.68)",
  };
  const handleBack = onBack ?? (() => router.push("/dashboard"));

  const getEventType = useCallback((s: Schedule): EventType => {
    const t = (s as any)?.event_type as EventType | undefined;
    if (t === "personal" || t === "shared" || t === "event" || t === "booking") return t;
    if (s.category === "practice") return "personal";
    if (s.category === "match") return "event";
    if (s.category === "event") return "event";
    return "personal";
  }, []);

  const fcEvents: EventInput[] = useMemo(() => {
    return items.map((s) => {
      const eventType = getEventType(s);
      const cfg = EVENT_TYPE_CONFIG[eventType];
      const start = new Date(s.start_at);
      const end = s.end_at ? new Date(s.end_at) : null;
      const allDayFlag = Boolean((s as any)?.all_day);
      const crossesMidnight = Boolean(
        end && (
          start.getFullYear() !== end.getFullYear() ||
          start.getMonth() !== end.getMonth() ||
          start.getDate() !== end.getDate()
        )
      );
      const allDay = allDayFlag || crossesMidnight;
      const endForAllDay = allDay
        ? (end ?? new Date(new Date(start).setDate(start.getDate() + 1)))
        : end;

      return {
        id: s.id,
        title: s.title,
        start,
        end: endForAllDay ?? undefined,
        allDay,
        backgroundColor: `${cfg.color}22`,
        borderColor: `${cfg.color}AA`,
        textColor: "rgba(255,255,255,0.92)",
        extendedProps: { schedule: s, eventType },
      };
    });
  }, [getEventType, items]);

  const onDatesSet = useCallback((arg: DatesSetArg) => {
    const start = new Date(arg.start);
    const end = new Date(arg.end);
    setVisibleRange({ start, end });
    setCalendarDate(new Date(arg.view.currentStart));
  }, []);

  const handlePrev = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      return;
    }
    setCalendarDate((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      return;
    }
    setCalendarDate((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const handleToday = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      return;
    }
    setCalendarDate(new Date());
  }, []);

  const onEventClick = useCallback((arg: EventClickArg) => {
    const s = (arg.event.extendedProps as any)?.schedule as Schedule | undefined;
    if (!s) return;
    openEdit(s);
  }, []);

  const renderEventContent = useCallback((arg: EventContentArg) => {
    return <EventBlock arg={arg} />;
  }, []);

  const onDateClick = useCallback(
    (arg: DateClickArg) => {
      if (!canEdit) return;
      const d = new Date(arg.date);
      if (arg.allDay) {
        openCreateAt(d);
        return;
      }
      openCreateAtSlot(d, d.getHours(), d.getMinutes());
    },
    [canEdit]
  );

  const onChangeView = useCallback(
    (v: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek") => {
      setCalendarView(v);
      calendarRef.current?.getApi()?.changeView(v);
    },
    []
  );

  const patchEventTime = useCallback(
    async (id: string, nextStart: Date, nextEnd: Date | null) => {
      const current = items.find((x) => x.id === id);
      if (!current) return;

      const payload = {
        id,
        title: current.title,
        start_at: nextStart.toISOString(),
        end_at: nextEnd ? nextEnd.toISOString() : null,
        location: current.location ?? null,
        site_url: (current as any).site_url ?? null,
        description: current.description ?? null,
        category: current.category,
        is_public: Boolean((current as any).is_public),
      };

      const res = await fetch("/api/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        console.error("[ScheduleClient] drag update failed", { status: res.status, json });
        throw new Error(typeof json?.error === "string" ? json.error : "予定の更新に失敗しました");
      }
      await fetchRange(visibleRange.start, visibleRange.end);
    },
    [fetchRange, items, visibleRange.end, visibleRange.start]
  );

  const onEventDrop = useCallback(
    async (arg: EventDropArg) => {
      try {
        await patchEventTime(arg.event.id, arg.event.start!, arg.event.end ? new Date(arg.event.end) : null);
      } catch {
        arg.revert();
      }
    },
    [patchEventTime]
  );

  const onEventResize = useCallback(
    async (arg: EventResizeDoneArg) => {
      try {
        await patchEventTime(arg.event.id, arg.event.start!, arg.event.end ? new Date(arg.event.end) : null);
      } catch {
        arg.revert();
      }
    },
    [patchEventTime]
  );

  return (
    <div style={embedded ? { overflowX: "hidden" } : { minHeight: "100vh", background: "#0B0B0F", color: "#fff", overflowX: "hidden" }}>
      <div style={embedded ? { width: "100%", maxWidth: "100%" } : { maxWidth: 980, margin: "0 auto", padding: "28px 16px 80px", width: "100%" }}>
        <div style={{ marginBottom: 14 }}>
          <ViewHeader title="Schedule" sub="スケジュール管理" onBack={handleBack} t={theme} roleColor={accentColor} />
        </div>

        {!embedded ? (
          <SectionCard t={theme}>
            <SLabel text="AD SLOT" color="#FFD600" />
            <p style={{ margin: 0, fontSize: 11, color: theme.sub, opacity: 0.5 }}>スポンサー広告枠（空き枠）</p>
          </SectionCard>
        ) : null}

        <ScheduleCalendar
          calendarRef={calendarRef as any}
          view={calendarView}
          date={calendarDate}
          canEdit={canEdit}
          embedded={embedded}
          loading={loading}
          events={fcEvents}
          onChangeView={onChangeView}
          onPrev={handlePrev}
          onToday={handleToday}
          onNext={handleNext}
          onCreate={openCreate}
          onCreateAt={(d) => openCreateAt(d)}
          onDatesSet={onDatesSet}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          renderEventContent={renderEventContent}
        />

        {loading ? <p style={{ marginTop: 12, color: "rgba(255,255,255,0.45)" }}>読み込み中...</p> : null}

        {!embedded ? (
          <div style={{ marginTop: 16 }}>
            <SectionCard t={theme}>
              <SLabel text="AD SLOT" color="#FFD600" />
              <p style={{ margin: 0, fontSize: 11, color: theme.sub, opacity: 0.5 }}>スポンサー広告枠（空き枠）</p>
            </SectionCard>
          </div>
        ) : null}
      </div>

      <EventModal
        open={modalOpen}
        selected={selected}
        draft={draft}
        canEdit={canEdit}
        saving={saving}
        errorMessage={errorMessage}
        accentColor={accentColor}
        onClose={closeModal}
        onSave={save}
        onRemove={remove}
        onOpenEdit={openEdit}
        setDraft={setDraft}
      />
    </div>
  );
}
