import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { RoleGate } from '@/components/RoleGate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'
import type { Conference } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function ConferencesPage() {
  const { t } = useTranslation('conferences')
  const { t: tc } = useTranslation('common')
  const { i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Conference | null>(null)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<Conference | null>(null)

  const list = useQuery({
    queryKey: ['conferences', page],
    queryFn: () => resources.conferences(page),
  })

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return resources.updateConference(editing.id, { name })
      return resources.createConference({ name })
    },
    onSuccess: async () => {
      setOpen(false)
      setName('')
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['conferences'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  const remove = useMutation({
    mutationFn: (id: string) => resources.deleteConference(id),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['conferences'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <RoleGate gate="admin">
            <Button
              onClick={() => {
                setEditing(null)
                setName('')
                setOpen(true)
              }}
            >
              {t('add')}
            </Button>
          </RoleGate>
        }
      />
      <DataTable
        columns={[
          { key: 'name', header: t('name'), cell: (row) => row.name },
          {
            key: 'created',
            header: tc('createdAt'),
            cell: (row) => formatDate(row.created_at, i18n.language),
          },
          {
            key: 'actions',
            header: tc('actions'),
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link to={`/conferences/${row.id}`} className="text-sm font-medium text-blue-700 hover:underline">
                  {t('open')}
                </Link>
                <RoleGate gate="admin">
                  <button
                    type="button"
                    className="text-sm text-slate-600 hover:underline"
                    onClick={() => {
                      setEditing(row)
                      setName(row.name)
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
                </RoleGate>
              </div>
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
