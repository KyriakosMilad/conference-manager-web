import type { User } from './types'

export type Gate = 'staff' | 'admin' | 'owner'

export function can(user: User | null | undefined, gate: Gate) {
  if (!user) return false
  if (gate === 'staff') return true
  if (gate === 'owner') return user.is_owner
  return user.is_owner || user.role === 'admin'
}

export function roleKey(user: User) {
  if (user.is_owner) return 'owner'
  if (user.role === 'admin') return 'admin'
  return 'moderator'
}
