import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { resources } from '@/lib/resources'
import { cn, formatDate } from '@/lib/utils'

export function ConferenceLayout() {
  const { id = '' } = useParams()
  const { t } = useTranslation('conferences')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const conference = useQuery({
    queryKey: ['conference', id],
    queryFn: () => resources.conference(id),
    enabled: Boolean(id),
  })

  const tabs = [
    { to: `/conferences/${id}`, key: 'overview', end: true },
    { to: `/conferences/${id}/sessions`, key: 'sessions' },
    { to: `/conferences/${id}/groups`, key: 'groups' },
    { to: `/conferences/${id}/contacts`, key: 'contacts' },
  ]

  if (conference.isLoading) return <Skeleton className="h-40 w-full" />
  if (conference.isError || !conference.data) return <p className="text-sm text-red-600">{tc('error')}</p>

  return (
    <div>
      <PageHeader
        title={conference.data.name}
        description={t('created', { date: formatDate(conference.data.created_at, i18n.language) })}
      />
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex-1 rounded-md px-3 py-2 text-center text-sm font-medium',
                isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600',
              )
            }
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
      <Outlet context={conference.data} />
    </div>
  )
}
