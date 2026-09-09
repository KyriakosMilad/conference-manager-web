import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { PageHeader } from '@/components/PageHeader'
import { QrScanner } from '@/components/QrScanner'
import { FormField } from '@/components/FormField'
import { Select } from '@/components/ui/select'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'

export function ScanPage() {
  const { t } = useTranslation('attendance')
  const { t: tc } = useTranslation('common')
  const [conferenceId, setConferenceId] = useState('')
  const [sessionId, setSessionId] = useState('')

  const conferences = useQuery({
    queryKey: ['conferences', 1],
    queryFn: () => resources.conferences(1),
  })
  const sessions = useQuery({
    queryKey: ['sessions', conferenceId, 1],
    queryFn: () => resources.sessions(conferenceId, 1),
    enabled: Boolean(conferenceId),
  })

  const onScan = useCallback(
    async (value: string) => {
      if (!sessionId) {
        toast.error(t('needSession'))
        return
      }
      try {
        await resources.scan({ session_id: sessionId, contact_id: value.trim() })
        toast.success(t('scannedOk'))
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : tc('error'))
      }
    },
    [sessionId, t, tc],
  )

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={t('scanTitle')} description={t('scanHint')} />
      <FormField label={t('pickConference')}>
        <Select
          value={conferenceId}
          onChange={(e) => {
            setConferenceId(e.target.value)
            setSessionId('')
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
        <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={!conferenceId}>
          <option value="" />
          {(sessions.data?.data ?? []).map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </Select>
      </FormField>
      <QrScanner enabled={Boolean(sessionId)} onScan={(value) => void onScan(value)} />
    </div>
  )
}
