"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DatesSetArg, DayHeaderContentArg, EventClickArg, EventContentArg, EventDropArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import CalendarHeader from "@/components/schedule/CalendarHeader";
import CalendarSidebar from "@/components/schedule/CalendarSidebar";
import DaySlider from "@/components/schedule/DaySlider";
import DayEventList from "@/components/schedule/DayEventList";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export default function ScheduleCalendar({
  calendarRef,
  view,
  date,
  canEdit,
  embedded,
  loading,
  events,
  onChangeView,
  onPrev,
  onToday,
  onNext,
  onCreate,
  onCreateAt,
  onDatesSet,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  renderEventContent,
}: {
  calendarRef: React.RefObject<FullCalendar | null>;
  view: CalendarView;
  date: Date;
  canEdit: boolean;
  embedded: boolean;
  loading: boolean;
  events: EventInput[];
  onChangeView: (v: CalendarView) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onCreate: () => void;
  onCreateAt: (d: Date) => void;
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onDateClick: (arg: DateClickArg) => void;
  onEventDrop: (arg: EventDropArg) => void;
  onEventResize: (arg: EventResizeDoneArg) => void;
  renderEventContent: (arg: EventContentArg) => React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSelected, setMobileSelected] = useState<Date>(() => date);
  const hasAppliedMobileDefaultViewRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    hasAppliedMobileDefaultViewRef.current = false;
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    setMobileSelected(date);
  }, [date, isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    if (hasAppliedMobileDefaultViewRef.current) return;
    hasAppliedMobileDefaultViewRef.current = true;
    if (view === "listWeek") return;
    onChangeView("listWeek");
  }, [isMobile, onChangeView, view]);

  const onClickEventFromList = (id: string) => {
    const api = calendarRef.current?.getApi();
    const ev = api?.getEventById(id);
    if (!ev) return;
    onEventClick({ event: ev } as any);
  };

  const mobileEvents = useMemo(() => events, [events]);

  const isMobileList = isMobile && view === "listWeek";

  const renderDayHeader = useCallback((arg: DayHeaderContentArg) => {
    const d = arg.date;
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    return (
      <div className="flex flex-col items-center leading-none">
        <div className="text-[10px] font-bold text-muted-foreground">{weekday}</div>
        <div className="mt-0.5 text-[12px] font-extrabold text-foreground">{dateLabel}</div>
      </div>
    );
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3">
        <CalendarHeader
          date={date}
          view={view}
          canEdit={canEdit}
          onPrev={onPrev}
          onToday={onToday}
          onNext={onNext}
          onCreate={onCreate}
          onChangeView={onChangeView}
        />
      </div>

      {isMobileList ? (
        <div className="flex flex-col gap-3">
          <div className="hidden">
            <FullCalendar
              ref={calendarRef as any}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView={view}
              initialDate={date}
              headerToolbar={false}
              height="auto"
              editable={canEdit}
              selectable={false}
              dayMaxEvents={true}
              nowIndicator={true}
              expandRows={true}
              weekends={true}
              listDayFormat={{ month: "numeric", day: "numeric", weekday: "short" }}
              listDaySideFormat={{ weekday: "short" }}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotDuration="00:30:00"
              events={events}
              datesSet={onDatesSet}
              eventClick={onEventClick}
              dateClick={onDateClick}
              eventDrop={onEventDrop}
              eventResize={onEventResize}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventContent={renderEventContent}
            />
          </div>

          <div className="rounded-[18px] border border-border bg-card/40 p-2">
            <DaySlider
              selected={mobileSelected}
              onChangeSelected={(d) => {
                setMobileSelected(d);
                calendarRef.current?.getApi()?.gotoDate(d);
              }}
            />
          </div>

          <div className="rounded-[18px] border border-border bg-card/40">
            <DayEventList
              selected={mobileSelected}
              events={mobileEvents}
              canEdit={canEdit}
              showAll
              onCreateAt={(d) => onCreateAt(d)}
              onClickEvent={onClickEventFromList}
            />
          </div>
        </div>
      ) : isMobile ? (
        <div className="min-w-0 overflow-hidden rounded-[18px] border border-border bg-card/40">
          <div className="relative bg-background p-2">
            <div className="overflow-hidden rounded-2xl border border-border">
              <FullCalendar
                ref={calendarRef as any}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={view}
                headerToolbar={false}
                height={embedded ? "auto" : "auto"}
                editable={canEdit}
                selectable={false}
                dayMaxEvents={true}
                nowIndicator={true}
                expandRows={true}
                weekends={true}
                dayHeaderContent={renderDayHeader}
                listDayFormat={{ month: "numeric", day: "numeric", weekday: "short" }}
                listDaySideFormat={{ weekday: "short" }}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                slotDuration="00:30:00"
                events={events}
                datesSet={onDatesSet}
                eventClick={onEventClick}
                dateClick={onDateClick}
                eventDrop={onEventDrop}
                eventResize={onEventResize}
                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                eventContent={renderEventContent}
              />
            </div>

            {loading ? (
              <div className="pointer-events-none absolute inset-2 rounded-2xl border border-border bg-black/35 p-4">
                <div className="mb-2 h-3.5 rounded-lg bg-white/6" />
                <div className="h-[260px] rounded-2xl bg-white/4" />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <CalendarSidebar
            selectedDate={date}
            onSelectDate={(d) => calendarRef.current?.getApi()?.gotoDate(d)}
            onCreate={onCreate}
            canEdit={canEdit}
          />

          <div className="min-w-0 flex-1 overflow-hidden rounded-[18px] border border-border bg-card/40">
            <div className="relative bg-background p-2">
              <div className="overflow-hidden rounded-2xl border border-border">
                <FullCalendar
                  ref={calendarRef as any}
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView={view}
                  headerToolbar={false}
                  height={embedded ? "auto" : "auto"}
                  editable={canEdit}
                  selectable={false}
                  dayMaxEvents={true}
                  nowIndicator={true}
                  expandRows={true}
                  weekends={true}
                  dayHeaderContent={renderDayHeader}
                  listDayFormat={{ month: "numeric", day: "numeric", weekday: "short" }}
                  listDaySideFormat={{ weekday: "short" }}
                  slotMinTime="00:00:00"
                  slotMaxTime="24:00:00"
                  slotDuration="00:30:00"
                  events={events}
                  datesSet={onDatesSet}
                  eventClick={onEventClick}
                  dateClick={onDateClick}
                  eventDrop={onEventDrop}
                  eventResize={onEventResize}
                  eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                  eventContent={renderEventContent}
                />
              </div>

              {loading ? (
                <div className="pointer-events-none absolute inset-2 rounded-2xl border border-border bg-black/35 p-4">
                  <div className="mb-2 h-3.5 rounded-lg bg-white/6" />
                  <div className="h-[260px] rounded-2xl bg-white/4" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
