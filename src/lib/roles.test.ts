import { describe, expect, it } from 'vitest'

import type { User } from './types'
import { can, roleKey } from './roles'

function user(partial: Partial<User>): User {
  return {
    id: '1',
    name: 'Test',
    email: 't@example.com',
    is_active: true,
    is_owner: false,
    org_id: 'org',
    role: 'moderator',
    created_at: '',
    updated_at: '',
    ...partial,
  }
}

describe('roles', () => {
  it('lets owners through every gate', () => {
    const owner = user({ is_owner: true, role: 'admin' })
    expect(can(owner, 'staff')).toBe(true)
    expect(can(owner, 'admin')).toBe(true)
    expect(can(owner, 'owner')).toBe(true)
    expect(roleKey(owner)).toBe('owner')
  })

  it('lets admins manage but not own', () => {
    const admin = user({ role: 'admin' })
    expect(can(admin, 'admin')).toBe(true)
    expect(can(admin, 'owner')).toBe(false)
    expect(roleKey(admin)).toBe('admin')
  })

  it('keeps moderators on staff-only actions', () => {
    const moderator = user({ role: 'moderator' })
    expect(can(moderator, 'staff')).toBe(true)
    expect(can(moderator, 'admin')).toBe(false)
    expect(can(moderator, 'owner')).toBe(false)
    expect(roleKey(moderator)).toBe('moderator')
  })
})
