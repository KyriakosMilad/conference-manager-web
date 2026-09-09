import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { RateBar } from '@/components/RateBar'
import { StatCard } from '@/components/StatCard'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { resources } from '@/lib/resources'
import { formatDate, formatDateTime, formatPercent } from '@/lib/utils'

export function AnalyticsPage() {
  const { t } = useTranslation('analytics')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const [conferenceId, setConferenceId] = useState('')

  const conferences = useQuery({
    queryKey: ['conferences', 1],
    queryFn: () => resources.conferences(1),
  })
  const analytics = useQuery({
    queryKey: ['analytics', conferenceId || 'all'],
    queryFn: () => resources.analytics(conferenceId || undefined),
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />
      <FormField label={t('pickConference')}>
        <Select value={conferenceId} onChange={(e) => setConferenceId(e.target.value)}>
          <option value="">{t('allConferences')}</option>
          {(conferences.data?.data ?? []).map((conference) => (
            <option key={conference.id} value={conference.id}>
              {conference.name}
            </option>
          ))}
        </Select>
      </FormField>

      {analytics.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : analytics.isError || !analytics.data ? (
        <p className="text-sm text-red-600">{tc('error')}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label={t('rate')} value={formatPercent(analytics.data.overall.rate, i18n.language)} />
            <StatCard label={t('attendance')} value={String(analytics.data.overall.attendance_count)} />
            <StatCard label={t('sessions')} value={String(analytics.data.overall.session_count)} />
            <StatCard label={t('contacts')} value={String(analytics.data.overall.contact_count)} />
          </div>
          <RateBar rate={analytics.data.overall.rate} />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('byDay')}</h2>
            <DataTable
              columns={[
                { key: 'date', header: t('byDay'), cell: (row) => formatDate(row.date, i18n.language) },
                {
                  key: 'rate',
                  header: t('rate'),
                  cell: (row) => formatPercent(row.rate, i18n.language),
                },
                { key: 'attendance', header: t('attendance'), cell: (row) => row.attendance_count },
              ]}
              rows={analytics.data.by_day}
              rowKey={(row) => row.date}
              page={1}
              totalPages={1}
              onPageChange={() => undefined}
              empty={<EmptyState title={t('empty')} />}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('bySession')}</h2>
            <DataTable
              columns={[
                { key: 'name', header: t('bySession'), cell: (row) => row.name },
                {
                  key: 'datetime',
                  header: tc('datetime'),
                  cell: (row) => formatDateTime(row.datetime, i18n.language),
                },
                {
                  key: 'rate',
                  header: t('rate'),
                  cell: (row) => formatPercent(row.rate, i18n.language),
                },
              ]}
              rows={analytics.data.by_session}
              rowKey={(row) => row.session_id}
              page={1}
              totalPages={1}
              onPageChange={() => undefined}
              empty={<EmptyState title={t('empty')} />}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('byContact')}</h2>
            <DataTable
              columns={[
                { key: 'name', header: t('byContact'), cell: (row) => row.name },
                {
                  key: 'rate',
                  header: t('rate'),
                  cell: (row) => formatPercent(row.rate, i18n.language),
                },
                { key: 'attendance', header: t('attendance'), cell: (row) => row.attendance_count },
              ]}
              rows={analytics.data.by_contact}
              rowKey={(row) => row.contact_id}
              page={1}
              totalPages={1}
              onPageChange={() => undefined}
              empty={<EmptyState title={t('empty')} />}
            />
          </section>
        </>
      )}
    </div>
  )
}
