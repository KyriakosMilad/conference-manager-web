import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { RoleGate } from '@/components/RoleGate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'
import type { Session } from '@/lib/types'
import { formatDateTime, fromLocalInput, toLocalInput } from '@/lib/utils'

export function SessionsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation('sessions')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [name, setName] = useState('')
  const [datetime, setDatetime] = useState('')
  const [deleting, setDeleting] = useState<Session | null>(null)

  const list = useQuery({
    queryKey: ['sessions', id, page],
    queryFn: () => resources.sessions(id, page),
    enabled: Boolean(id),
  })

  const save = useMutation({
    mutationFn: async () => {
      const iso = fromLocalInput(datetime)
      if (editing) return resources.updateSession(editing.id, { name, datetime: iso })
      return resources.createSession({ conference_id: id, name, datetime: iso })
    },
    onSuccess: async () => {
      setOpen(false)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  const remove = useMutation({
    mutationFn: (sessionId: string) => resources.deleteSession(sessionId),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RoleGate gate="admin">
          <Button
            onClick={() => {
              setEditing(null)
              setName('')
              setDatetime('')
              setOpen(true)
            }}
          >
            {t('add')}
          </Button>
        </RoleGate>
      </div>
      <DataTable
        columns={[
          { key: 'name', header: t('name'), cell: (row) => row.name },
          {
            key: 'datetime',
            header: t('datetime'),
            cell: (row) => formatDateTime(row.datetime, i18n.language),
          },
          {
            key: 'actions',
            header: tc('actions'),
            cell: (row) => (
              <RoleGate gate="admin">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-slate-600 hover:underline"
                    onClick={() => {
                      setEditing(row)
                      setName(row.name)
                      setDatetime(toLocalInput(row.datetime))
                      setOpen(true)
                    }}
                  >
                    {tc('edit')}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => setDeleting(row)}
                  >
                    {tc('delete')}
                  </button>
                </div>
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

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate()
            }}
          >
            <h2 className="text-lg font-semibold">{editing ? t('edit') : t('add')}</h2>
            <FormField label={t('name')}>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>
            <FormField label={t('datetime')}>
              <Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {tc('save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={tc('delete')}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  )
}
