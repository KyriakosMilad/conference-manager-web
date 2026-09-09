import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { RoleGate } from '@/components/RoleGate'
import { Select } from '@/components/ui/select'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'
import type { Attendance } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export function AttendancePage() {
  const { t } = useTranslation('attendance')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [conferenceId, setConferenceId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Attendance | null>(null)

  const conferences = useQuery({
    queryKey: ['conferences', 1],
    queryFn: () => resources.conferences(1),
  })
  const sessions = useQuery({
    queryKey: ['sessions', conferenceId, 1],
    queryFn: () => resources.sessions(conferenceId, 1),
    enabled: Boolean(conferenceId),
  })
  const contacts = useQuery({
    queryKey: ['contacts', conferenceId, 1],
    queryFn: () => resources.contacts(conferenceId, 1),
    enabled: Boolean(conferenceId),
  })
  const list = useQuery({
    queryKey: ['attendances', { session_id: sessionId, page }],
    queryFn: () => resources.attendances({ session_id: sessionId, page }),
    enabled: Boolean(sessionId),
  })

  const contactName = useMemo(() => {
    const map = new Map((contacts.data?.data ?? []).map((contact) => [contact.id, contact.name]))
    return (id: string) => map.get(id) ?? id
  }, [contacts.data])

  const sessionName = useMemo(() => {
    const map = new Map((sessions.data?.data ?? []).map((session) => [session.id, session.name]))
    return (id: string) => map.get(id) ?? id
  }, [sessions.data])

  const remove = useMutation({
    mutationFn: (id: string) => resources.deleteAttendance(id),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('pickConference')}>
          <Select
            value={conferenceId}
            onChange={(e) => {
              setConferenceId(e.target.value)
              setSessionId('')
              setPage(1)
            }}
          >
            <option value="" />
            {(conferences.data?.data ?? []).map((conference) => (
              <option key={conference.id} value={conference.id}>
                {conference.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('pickSession')}>
          <Select
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              setPage(1)
            }}
            disabled={!conferenceId}
          >
            <option value="" />
            {(sessions.data?.data ?? []).map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {sessionId ? (
        <DataTable
          columns={[
            { key: 'contact', header: t('contact'), cell: (row) => contactName(row.contact_id) },
            { key: 'session', header: t('session'), cell: (row) => sessionName(row.session_id) },
            {
              key: 'when',
              header: t('scannedAt'),
              cell: (row) => formatDateTime(row.created_at, i18n.language),
            },
            {
              key: 'actions',
              header: tc('actions'),
              cell: (row) => (
                <RoleGate gate="admin">
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => setDeleting(row)}
                  >
                    {t('unattend')}
                  </button>
                </RoleGate>
              ),
            },
          ]}
          rows={list.data?.data ?? []}
          rowKey={(row) => row.id}
          page={list.data?.page ?? page}
          totalPages={list.data?.total_pages ?? 1}
          onPageChange={setPage}
          loading={list.isLoading}
          empty={<EmptyState title={t('empty')} />}
        />
      ) : (
        <EmptyState title={t('needSession')} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t('unattend')}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  )
}
