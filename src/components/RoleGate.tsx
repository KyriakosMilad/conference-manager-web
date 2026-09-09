import type { ReactNode } from 'react'

import { useAuth } from '@/lib/auth'
import { can, type Gate } from '@/lib/roles'

export function RoleGate({ gate, children }: { gate: Gate; children: ReactNode }) {
  const { user } = useAuth()
  if (!can(user, gate)) return null
  return <>{children}</>
}
