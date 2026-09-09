import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth'
import { resources } from '@/lib/resources'
import { formatPercent } from '@/lib/utils'

export function DashboardPage() {
  const { t } = useTranslation('analytics')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const { organisation } = useAuth()
  const analytics = useQuery({ queryKey: ['analytics'], queryFn: () => resources.analytics() })
  const conferences = useQuery({ queryKey: ['conferences', 1], queryFn: () => resources.conferences(1) })

  return (
    <div>
      <PageHeader title={organisation?.name ?? t('homeTitle')} description={t('homeTitle')} />
      {analytics.isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : analytics.isError ? (
        <p className="text-sm text-red-600">{tc('error')}</p>
      ) : analytics.data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label={t('rate')} value={formatPercent(analytics.data.overall.rate, i18n.language)} />
          <StatCard label={t('attendance')} value={String(analytics.data.overall.attendance_count)} />
          <StatCard label={t('sessions')} value={String(analytics.data.overall.session_count)} />
          <StatCard label={t('contacts')} value={String(analytics.data.overall.contact_count)} />
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('allConferences')}</h2>
          <Link to="/conferences" className="text-sm font-medium text-blue-700 hover:underline">
            {tc('next')}
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(conferences.data?.data ?? []).slice(0, 4).map((conference) => (
            <Link key={conference.id} to={`/conferences/${conference.id}`}>
              <Card className="transition hover:border-blue-200">
                <CardContent>
                  <p className="font-medium">{conference.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
