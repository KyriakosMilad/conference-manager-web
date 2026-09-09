import type { Organisation, User } from './types'

export function isUiPreview() {
  if (!import.meta.env.DEV) return false
  const value = import.meta.env.VITE_UI_PREVIEW
  return value === '1' || value === 'true'
}

export const previewUser: User = {
  id: 'preview',
  name: 'UI Preview',
  email: 'preview@local',
  is_active: true,
  is_owner: true,
  org_id: 'preview',
  role: 'admin',
  created_at: '',
  updated_at: '',
}

export const previewOrganisation: Organisation = {
  id: 'preview',
  name: 'Preview Org',
  owner_id: 'preview',
  created_at: '',
  updated_at: '',
}
