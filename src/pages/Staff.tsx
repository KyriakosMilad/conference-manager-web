import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { resources } from '@/lib/resources'
import { roleKey } from '@/lib/roles'
import type { User } from '@/lib/types'

export function StaffPage() {
  const { t } = useTranslation('staff')
  const { t: tc } = useTranslation('common')
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('moderator')
  const [isActive, setIsActive] = useState(true)
  const [deleting, setDeleting] = useState<User | null>(null)

  const list = useQuery({
    queryKey: ['users', page],
    queryFn: () => resources.users(page),
  })

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return resources.updateUser(editing.id, {
          name,
          email,
          role,
          is_active: isActive,
          password: password || undefined,
        })
      }
      return resources.createUser({ name, email, password, role })
    },
    onSuccess: async () => {
      setOpen(false)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  const remove = useMutation({
    mutationFn: (id: string) => resources.deleteUser(id),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setName('')
              setEmail('')
              setPassword('')
              setRole('moderator')
              setIsActive(true)
              setOpen(true)
            }}
          >
            {t('add')}
          </Button>
        }
      />
      <DataTable
        columns={[
          { key: 'name', header: t('name'), cell: (row) => row.name },
          { key: 'email', header: t('email'), cell: (row) => row.email },
          {
            key: 'role',
            header: t('role'),
            cell: (row) => <Badge>{tc(`roles.${roleKey(row)}`)}</Badge>,
          },
          {
            key: 'active',
            header: t('active'),
            cell: (row) => (row.is_active ? tc('yes') : tc('no')),
          },
          {
            key: 'actions',
            header: tc('actions'),
            cell: (row) =>
              row.id === me?.id ? null : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-slate-600 hover:underline"
                    onClick={() => {
                      setEditing(row)
                      setName(row.name)
                      setEmail(row.email)
                      setPassword('')
                      setRole(row.role)
                      setIsActive(row.is_active)
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
            <FormField label={t('email')}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormField>
            <FormField label={t('password')} hint={editing ? t('passwordOptional') : undefined}>
              <Input
                type="password"
                minLength={editing ? undefined : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editing}
              />
            </FormField>
            <FormField label={t('role')}>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">{t('admin')}</option>
                <option value="moderator">{t('moderator')}</option>
              </Select>
            </FormField>
            {editing ? (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                {t('active')}
              </label>
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
