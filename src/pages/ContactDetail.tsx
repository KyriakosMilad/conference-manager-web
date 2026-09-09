import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { GroupChip } from '@/components/GroupChip'
import { PageHeader } from '@/components/PageHeader'
import { QrDisplay } from '@/components/QrDisplay'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { resources } from '@/lib/resources'
import { formatDateTime } from '@/lib/utils'

export function ContactDetailPage() {
  const { id = '', contactId = '' } = useParams()
  const { t } = useTranslation('contacts')
  const { t: ta } = useTranslation('attendance')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()

  const contact = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => resources.contact(contactId),
    enabled: Boolean(contactId),
  })
  const attendance = useQuery({
    queryKey: ['attendances', { contact_id: contactId }],
    queryFn: () => resources.attendances({ contact_id: contactId, page: 1 }),
    enabled: Boolean(contactId),
  })
  const sessions = useQuery({
    queryKey: ['sessions', id, 1],
    queryFn: () => resources.sessions(id, 1),
    enabled: Boolean(id),
  })

  const groups = useQuery({
    queryKey: ['groups', id, 1],
    queryFn: () => resources.groups(id, 1),
    enabled: Boolean(id),
  })

  if (contact.isLoading) return <Skeleton className="h-48 w-full" />
  if (contact.isError || !contact.data) return <p className="text-sm text-red-600">{tc('error')}</p>

  const group = (groups.data?.data ?? []).find((item) => item.id === contact.data.group_id)
  const sessionName = (sessionId: string) =>
    sessions.data?.data.find((session) => session.id === sessionId)?.name ?? sessionId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/conferences/${id}/contacts`} className="text-sm text-blue-700 hover:underline">
          {tc('back')}
        </Link>
      </div>
      <PageHeader
        title={contact.data.name}
        description={[contact.data.phone, contact.data.city].filter(Boolean).join(' · ')}
        actions={
          <div className="flex items-center gap-2">
            {group ? <GroupChip name={group.name} color={group.color} /> : null}
            <Badge className={contact.data.is_member ? undefined : 'bg-slate-100 text-slate-600'}>
              {contact.data.is_member ? tc('member') : tc('notMember')}
            </Badge>
          </div>
        }
      />
      <div className={group?.badge_image_url ? 'space-y-6' : 'grid gap-6 md:grid-cols-2'}>
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t('qrTitle')}</h2>
          <p className="mb-3 text-sm text-slate-500">{t('qrHint')}</p>
          <div className={group?.badge_image_url ? 'max-w-4xl' : undefined}>
            <QrDisplay
              value={contact.data.id}
              label={contact.data.name}
              badgeImageUrl={group?.badge_image_url}
              printable
            />
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t('attendance')}</h2>
          <DataTable
            columns={[
              { key: 'session', header: ta('session'), cell: (row) => sessionName(row.session_id) },
              {
                key: 'when',
                header: ta('scannedAt'),
                cell: (row) => formatDateTime(row.created_at, i18n.language),
              },
            ]}
            rows={attendance.data?.data ?? []}
            rowKey={(row) => row.id}
            page={1}
            totalPages={1}
            onPageChange={() => undefined}
            loading={attendance.isLoading}
            empty={<EmptyState title={ta('empty')} />}
          />
        </div>
      </div>
    </div>
  )
}
