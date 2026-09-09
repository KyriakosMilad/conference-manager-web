import { api } from './api'
import type {
  AnalyticsData,
  Attendance,
  AuthData,
  Conference,
  Contact,
  Group,
  Organisation,
  Paginated,
  Session,
  User,
} from './types'

async function allPages<T>(load: (page: number) => Promise<Paginated<T>>) {
  const items: T[] = []
  let page = 1
  for (let guard = 0; guard < 200; guard += 1) {
    const result = await load(page)
    const rows = result.data ?? []
    items.push(...rows)
    const pageSize = result.page_size || rows.length
    const doneByCount = Boolean(result.total_count) && items.length >= result.total_count
    const shortPage = pageSize > 0 && rows.length < pageSize
    if (rows.length === 0 || doneByCount || shortPage) break
    page += 1
  }
  return items
}

export const resources = {
  login: (body: { email: string; password: string }) =>
    api<AuthData>('/auth/login', { method: 'POST', body }),
  // register: (body: { name: string; email: string; password: string; organisation_name: string }) =>
  //   api<AuthData>('/auth/register', { method: 'POST', body }),
  conferences: (page = 1) => api<Paginated<Conference>>('/conferences', { query: { page } }),
  conference: (id: string) => api<Conference>(`/conferences/${id}`),
  createConference: (body: { name: string }) => api<Conference>('/conferences', { method: 'POST', body }),
  updateConference: (id: string, body: { name: string }) =>
    api<Conference>(`/conferences/${id}`, { method: 'PUT', body }),
  deleteConference: (id: string) => api<unknown>(`/conferences/${id}`, { method: 'DELETE' }),
  sessions: (conferenceId: string, page = 1) =>
    api<Paginated<Session>>('/sessions', { query: { conference_id: conferenceId, page } }),
  createSession: (body: { conference_id: string; name: string; datetime: string }) =>
    api<Session>('/sessions', { method: 'POST', body }),
  updateSession: (id: string, body: { name: string; datetime: string }) =>
    api<Session>(`/sessions/${id}`, { method: 'PUT', body }),
  deleteSession: (id: string) => api<unknown>(`/sessions/${id}`, { method: 'DELETE' }),
  groups: (conferenceId: string, page = 1, pageSize?: number) =>
    api<Paginated<Group>>('/groups', { query: { conference_id: conferenceId, page, page_size: pageSize } }),
  createGroup: (body: { conference_id: string; name: string; color: string; badge_image_url: string }) =>
    api<Group>('/groups', { method: 'POST', body }),
  updateGroup: (id: string, body: { name: string; color: string; badge_image_url: string }) =>
    api<Group>(`/groups/${id}`, { method: 'PUT', body }),
  deleteGroup: (id: string) => api<unknown>(`/groups/${id}`, { method: 'DELETE' }),
  allGroups: (conferenceId: string) => allPages((page) => resources.groups(conferenceId, page, 100)),
  contacts: (conferenceId: string, page = 1, pageSize?: number) =>
    api<Paginated<Contact>>('/contacts', { query: { conference_id: conferenceId, page, page_size: pageSize } }),
  allContacts: (conferenceId: string) => allPages((page) => resources.contacts(conferenceId, page, 100)),
  contact: (id: string) => api<Contact>(`/contacts/${id}`),
  createContact: (body: {
    conference_id: string
    name: string
    city: string
    phone: string
    notes: string
    is_member: boolean
    group_id?: string
  }) => api<Contact>('/contacts', { method: 'POST', body }),
  updateContact: (
    id: string,
    body: { name: string; city: string; phone: string; notes: string; is_member: boolean; group_id: string },
  ) =>
    api<Contact>(`/contacts/${id}`, { method: 'PUT', body }),
  deleteContact: (id: string) => api<unknown>(`/contacts/${id}`, { method: 'DELETE' }),
  attendances: (query: { page?: number; session_id?: string; contact_id?: string }) =>
    api<Paginated<Attendance>>('/attendances', { query }),
  scan: (body: { session_id: string; contact_id: string }) =>
    api<Attendance>('/attendances', { method: 'POST', body }),
  deleteAttendance: (id: string) => api<unknown>(`/attendances/${id}`, { method: 'DELETE' }),
  analytics: (conferenceId?: string) =>
    api<AnalyticsData>('/analytics', { query: { conference_id: conferenceId } }),
  users: (page = 1) => api<Paginated<User>>('/users', { query: { page } }),
  createUser: (body: { name: string; email: string; password: string; role: string }) =>
    api<User>('/users', { method: 'POST', body }),
  updateUser: (
    id: string,
    body: { name: string; email: string; role: string; is_active: boolean; password?: string },
  ) => api<User>(`/users/${id}`, { method: 'PUT', body }),
  deleteUser: (id: string) => api<unknown>(`/users/${id}`, { method: 'DELETE' }),
  updateOrganisation: (id: string, body: { name: string }) =>
    api<Organisation>(`/organisations/${id}`, { method: 'PUT', body }),
}
