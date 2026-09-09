import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'

export function SetAttendancePage() {
  const { t } = useTranslation('attendance')
  const { t: tc } = useTranslation('common')
  const queryClient = useQueryClient()
  const [conferenceId, setConferenceId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [contactId, setContactId] = useState('')
  const [search, setSearch] = useState('')

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
    queryKey: ['contacts', conferenceId, 'all'],
    queryFn: () => resources.allContacts(conferenceId),
    enabled: Boolean(conferenceId),
  })

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = contacts.data ?? []
    if (!query) return rows
    return rows.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        String(contact.seq_id).includes(query) ||
        contact.phone.toLowerCase().includes(query),
    )
  }, [contacts.data, search])

  const save = useMutation({
    mutationFn: () => resources.scan({ session_id: sessionId, contact_id: contactId }),
    onSuccess: async () => {
      toast.success(t('scannedOk'))
      setContactId('')
      await queryClient.invalidateQueries({ queryKey: ['attendances'] })
      await queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!conferenceId) {
      toast.error(t('needConference'))
      return
    }
    if (!sessionId) {
      toast.error(t('needSession'))
      return
    }
    if (!contactId) {
      toast.error(t('needContact'))
      return
    }
    save.mutate()
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={t('setTitle')} description={t('setHint')} />
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label={t('pickConference')}>
          <Select
            value={conferenceId}
            onChange={(e) => {
              setConferenceId(e.target.value)
              setSessionId('')
              setContactId('')
              setSearch('')
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
            onChange={(e) => setSessionId(e.target.value)}
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
        <FormField label={t('pickContact')}>
          <Input
            className="mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchContact')}
            disabled={!conferenceId}
          />
          <Select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            disabled={!conferenceId}
          >
            <option value="" />
            {filteredContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.seq_id} — {contact.name}
              </option>
            ))}
          </Select>
        </FormField>
        <Button type="submit" className="w-full" disabled={save.isPending || !sessionId || !contactId}>
          {t('submitSet')}
        </Button>
      </form>
    </div>
  )
}
