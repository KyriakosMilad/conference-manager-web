import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/lib/auth'
import { can, type Gate } from '@/lib/roles'
import { isUiPreview } from '@/lib/ui-preview'

import { Skeleton } from './ui/skeleton'

export function ProtectedRoute({ gate = 'staff' }: { gate?: Gate }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    )
  }

  if (!isAuthenticated && !isUiPreview()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!can(user, gate)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
