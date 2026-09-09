export type Role = 'admin' | 'moderator'

export type User = {
  id: string
  name: string
  email: string
  is_active: boolean
  is_owner: boolean
  org_id: string
  role: Role | string
  created_at: string
  updated_at: string
}

export type Organisation = {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export type Conference = {
  id: string
  name: string
  org_id: string
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  name: string
  datetime: string
  conference_id: string
  org_id: string
  created_at: string
  updated_at: string
}

export type Group = {
  id: string
  name: string
  color: string
  badge_image_url: string
  conference_id: string
  org_id: string
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  seq_id: number
  name: string
  city: string
  phone: string
  notes: string
  is_member: boolean
  group_id: string
  conference_id: string
  org_id: string
  created_at: string
  updated_at: string
}

export type Attendance = {
  id: string
  session_id: string
  contact_id: string
  conference_id: string
  org_id: string
  created_at: string
  updated_at: string
}

export type Paginated<T> = {
  data: T[]
  page: number
  page_size: number
  total_count: number
  total_pages: number
}

export type RateCounts = {
  attendance_count: number
  contact_count: number
  possible_count: number
  rate: number
  session_count: number
}

export type DayRate = RateCounts & { date: string }

export type SessionRate = RateCounts & {
  session_id: string
  conference_id: string
  name: string
  datetime: string
}

export type ContactRate = RateCounts & {
  contact_id: string
  conference_id: string
  name: string
  seq_id: number
}

export type AnalyticsData = {
  overall: RateCounts
  by_day: DayRate[]
  by_session: SessionRate[]
  by_contact: ContactRate[]
}

export type AuthData = {
  token: string
  user: User
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  status_code: number
  data: T
}
