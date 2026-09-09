import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { RateBar } from '@/components/RateBar'
import { StatCard } from '@/components/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { resources } from '@/lib/resources'
import { formatPercent } from '@/lib/utils'

export function ConferenceOverviewPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation('analytics')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const analytics = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => resources.analytics(id),
    enabled: Boolean(id),
  })

  if (analytics.isLoading) return <Skeleton className="h-32 w-full" />
  if (analytics.isError || !analytics.data) return <p className="text-sm text-red-600">{tc('error')}</p>

  const overall = analytics.data.overall
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={t('rate')} value={formatPercent(overall.rate, i18n.language)} />
        <StatCard label={t('attendance')} value={String(overall.attendance_count)} />
        <StatCard label={t('sessions')} value={String(overall.session_count)} />
        <StatCard label={t('contacts')} value={String(overall.contact_count)} />
      </div>
      <div>
        <p className="mb-2 text-sm text-slate-500">{t('rate')}</p>
        <RateBar rate={overall.rate} />
      </div>
    </div>
  )
}
