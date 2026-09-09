import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { GroupChip } from '@/components/GroupChip'
import { QrDisplay } from '@/components/QrDisplay'
import { RoleGate } from '@/components/RoleGate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'
import type { Group } from '@/lib/types'

export function GroupsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation('groups')
  const { t: tc } = useTranslation('common')
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#2563eb')
  const [badgeImageUrl, setBadgeImageUrl] = useState('')
  const [deleting, setDeleting] = useState<Group | null>(null)

  const list = useQuery({
    queryKey: ['groups', id, page],
    queryFn: () => resources.groups(id, page),
    enabled: Boolean(id),
  })

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return resources.updateGroup(editing.id, { name, color, badge_image_url: badgeImageUrl })
      return resources.createGroup({ conference_id: id, name, color, badge_image_url: badgeImageUrl })
    },
    onSuccess: async () => {
      setOpen(false)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['groups', id] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  const remove = useMutation({
    mutationFn: (groupId: string) => resources.deleteGroup(groupId),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['groups', id] })
      await queryClient.invalidateQueries({ queryKey: ['contacts', id] })
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
              setColor('#2563eb')
              setBadgeImageUrl('')
              setOpen(true)
            }}
          >
            {t('add')}
          </Button>
        </RoleGate>
      </div>
      <DataTable
        columns={[
          {
            key: 'name',
            header: t('name'),
            cell: (row) => <GroupChip name={row.name} color={row.color} />,
          },
          {
            key: 'badge',
            header: t('badgeImageUrl'),
            cell: (row) =>
              row.badge_image_url ? (
                <img src={row.badge_image_url} alt="" className="h-24 w-36 rounded-md bg-slate-50 object-contain" />
              ) : null,
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
                      setColor(row.color)
                      setBadgeImageUrl(row.badge_image_url)
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
            className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-5 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate()
            }}
          >
            <h2 className="text-lg font-semibold">{editing ? t('edit') : t('add')}</h2>
            <FormField label={t('name')}>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>
            <FormField label={t('color')}>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={color.length === 7 ? color : '#2563eb'}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-14 p-1"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} required />
              </div>
            </FormField>
            <FormField label={t('badgeImageUrl')} hint={t('badgePreviewHint')}>
              <Input value={badgeImageUrl} onChange={(e) => setBadgeImageUrl(e.target.value)} />
            </FormField>
            {badgeImageUrl ? (
              <QrDisplay value="preview" label={t('sampleContactName')} badgeImageUrl={badgeImageUrl} />
            ) : null}
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
