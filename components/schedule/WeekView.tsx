"use client";

import type React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export default function WeekView({
  calendarRef,
  view,
  embedded,
  canEdit,
  events,
  onDatesSet,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  renderEventContent,
}: {
  calendarRef: React.RefObject<FullCalendar | null>;
  view: CalendarView;
  embedded: boolean;
  canEdit: boolean;
  events: EventInput[];
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onDateClick: (arg: DateClickArg) => void;
  onEventDrop: (arg: EventDropArg) => void;
  onEventResize: (arg: EventResizeDoneArg) => void;
  renderEventContent: (arg: EventContentArg) => React.ReactNode;
}) {
  return (
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
  );
}
