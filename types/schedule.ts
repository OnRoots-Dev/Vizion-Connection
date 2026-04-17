export type ScheduleCategory = 'match' | 'practice' | 'event' | 'other'

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

export const CATEGORY_CONFIG: Record<ScheduleCategory, { label: string; color: string }> = {
  match: { label: '試合', color: '#FF4646' },
  practice: { label: '練習', color: '#3282FF' },
  event: { label: 'イベント', color: '#28D26E' },
  other: { label: 'その他', color: '#888888' },
}
