import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  UserPlus,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/auth'
import { can, roleKey } from '@/lib/roles'
import { cn } from '@/lib/utils'

// import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { Button } from './ui/button'

const links = [
  { to: '/', key: 'home', icon: LayoutDashboard, end: true, gate: 'staff' as const },
  { to: '/conferences', key: 'conferences', icon: CalendarDays, gate: 'staff' as const },
  { to: '/scan', key: 'scan', icon: QrCode, gate: 'staff' as const },
  { to: '/set-attendance', key: 'setAttendance', icon: UserPlus, gate: 'staff' as const },
  { to: '/attendance', key: 'attendance', icon: UserCheck, gate: 'staff' as const },
  { to: '/analytics', key: 'analytics', icon: BarChart3, gate: 'staff' as const },
  { to: '/staff', key: 'staff', icon: Users, gate: 'owner' as const },
  { to: '/organisation', key: 'organisation', icon: Building2, gate: 'owner' as const },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation('nav')
  const { user, organisation, logout } = useAuth()
  const { t: tc } = useTranslation('common')

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-4 py-4">
        <Logo />
        {organisation ? <p className="mt-3 truncate text-sm text-slate-500">{organisation.name}</p> : null}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links
          .filter((link) => can(user, link.gate))
          .map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50',
                  )
                }
              >
                <Icon className="size-4" />
                {t(link.key)}
              </NavLink>
            )
          })}
      </nav>
      <div className="space-y-3 border-t border-slate-100 px-4 py-4">
        {/* <LanguageSwitcher /> */}
        {user ? (
          <div className="text-sm">
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-slate-500">{tc(`roles.${roleKey(user)}`)}</p>
          </div>
        ) : null}
        <Button variant="outline" className="w-full" onClick={() => void logout()}>
          <LogOut className="size-4" />
          {tc('logout')}
        </Button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children?: ReactNode }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-e border-slate-200 bg-white md:block">
        <SidebarNav />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 bg-white shadow-xl">
            <button type="button" className="absolute end-3 top-3 text-slate-500" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Logo compact />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={t('openMenu')}>
            <Menu className="size-5" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
