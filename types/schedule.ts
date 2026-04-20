export type ScheduleCategory = 'match' | 'practice' | 'event' | 'other'

export type EventType = "personal" | "shared" | "event" | "booking";

export type ReminderMinutesBefore = 15 | 30 | 60 | 1440;

export type EventInviteStatus = "pending" | "accepted" | "declined";

export type EventInvite = {
  id: string;
  event_id: string;
  invitee_id: string;
  inviter_id: string;
  status: EventInviteStatus;
  created_at: string;
  responded_at: string | null;
  read_at: string | null;
};

export type EventReminder = {
  id: string;
  event_id: string;
  user_id: string;
  remind_minutes_before: ReminderMinutesBefore;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
};

export type Schedule = {
  id: string
  user_slug: string
  title: string
  start_at: string
  end_at: string | null
  location: string | null
  site_url: string | null
  description: string | null
  category: ScheduleCategory
  is_public: boolean
  created_at: string
  updated_at: string
}

export type CalendarEvent = {
  id: string;
  owner_id?: string;
  title: string;
  description: string | null;
  location: string | null;
  site_url: string | null;
  start_at: string;
  end_at: string | null;
  all_day?: boolean;
  event_type: EventType;
  is_public: boolean;
  invite_status?: EventInviteStatus;
};

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  personal: { label: "Personal", color: "#3282FF" },
  shared: { label: "Shared", color: "#28D26E" },
  event: { label: "Event", color: "#FF8A2A" },
  booking: { label: "Booking", color: "#8B5CFF" },
};

export const CATEGORY_CONFIG: Record<ScheduleCategory, { label: string; color: string }> = {
  match: { label: '試合', color: '#FF4646' },
  practice: { label: '練習', color: '#3282FF' },
  event: { label: 'イベント', color: '#28D26E' },
  other: { label: 'その他', color: '#888888' },
}
