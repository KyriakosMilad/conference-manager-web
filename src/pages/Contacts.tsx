import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Printer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ContactBadge, printBadgeSheet } from '@/components/ContactBadge'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FormField } from '@/components/FormField'
import { GroupChip } from '@/components/GroupChip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api'
import { resources } from '@/lib/resources'
import type { Conference, Contact } from '@/lib/types'

export function ContactsPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation('contacts')
  const { t: tc } = useTranslation('common')
  const conference = useOutletContext<Conference>()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [groupId, setGroupId] = useState('')
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const [printRows, setPrintRows] = useState<{ contact: Contact; badgeImageUrl?: string }[] | null>(null)
  const [printing, setPrinting] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const list = useQuery({
    queryKey: ['contacts', id, page],
    queryFn: () => resources.contacts(id, page),
    enabled: Boolean(id),
  })

  const groups = useQuery({
    queryKey: ['groups', id, 1],
    queryFn: () => resources.groups(id, 1),
    enabled: Boolean(id),
  })

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return resources.updateContact(editing.id, {
          name,
          city,
          phone,
          notes,
          is_member: isMember,
          group_id: groupId,
        })
      }
      return resources.createContact({
        conference_id: id,
        name,
        city,
        phone,
        notes,
        is_member: isMember,
        group_id: groupId || undefined,
      })
    },
    onSuccess: async () => {
      setOpen(false)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['contacts', id] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  const remove = useMutation({
    mutationFn: (contactId: string) => resources.deleteContact(contactId),
    onSuccess: async () => {
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['contacts', id] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  function openCreate() {
    setEditing(null)
    setName('')
    setCity('')
    setPhone('')
    setNotes('')
    setIsMember(false)
    setGroupId('')
    setOpen(true)
  }

  async function printAll() {
    try {
      const [contacts, groupRows] = await Promise.all([resources.allContacts(id), resources.allGroups(id)])
      if (!contacts.length) {
        toast.error(t('printAllEmpty'))
        return
      }
      const badges = new Map(groupRows.map((group) => [group.id, group.badge_image_url]))
      setPrintRows(
        [...contacts]
          .sort((a, b) => a.seq_id - b.seq_id)
          .map((contact) => ({ contact, badgeImageUrl: badges.get(contact.group_id) })),
      )
      toast.success(t('printAllReady', { count: contacts.length }))
      setPrinting(true)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : tc('error'))
    }
  }

  useEffect(() => {
    if (!printing || !printRows || !sheetRef.current) return
    void printBadgeSheet(sheetRef.current, conference?.name ? `${conference.name} badges` : 'badges').finally(() => {
      setPrinting(false)
    })
  }, [conference?.name, printRows, printing])

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={() => void printAll()} disabled={printing}>
          <Printer className="size-4" />
          {t('printAll')}
        </Button>
        <Button onClick={openCreate}>{t('add')}</Button>
      </div>
      <DataTable
        columns={[
          { key: 'seq', header: t('seq'), cell: (row) => row.seq_id },
          { key: 'name', header: t('name'), cell: (row) => row.name },
          {
            key: 'group',
            header: t('group'),
            cell: (row) => {
              const group = (groups.data?.data ?? []).find((item) => item.id === row.group_id)
              return group ? <GroupChip name={group.name} color={group.color} /> : null
            },
          },
          { key: 'phone', header: t('phone'), cell: (row) => row.phone },
          { key: 'city', header: t('city'), cell: (row) => row.city },
          {
            key: 'notes',
            header: t('notes'),
            cell: (row) =>
              row.notes ? <p className="max-w-xs text-sm whitespace-pre-wrap text-slate-600">{row.notes}</p> : null,
          },
          {
            key: 'member',
            header: t('isMember'),
            cell: (row) => (
              <Badge className={row.is_member ? undefined : 'bg-slate-100 text-slate-600'}>
                {row.is_member ? tc('member') : tc('notMember')}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: tc('actions'),
            cell: (row) => (
              <div className="flex gap-2">
                <Link
                  to={`/conferences/${id}/contacts/${row.id}`}
                  className="text-sm font-medium text-blue-700 hover:underline"
                >
                  {t('qrTitle')}
                </Link>
                <button
                  type="button"
                  className="text-sm text-slate-600 hover:underline"
                  onClick={() => {
                    setEditing(row)
                    setName(row.name)
                    setCity(row.city)
                    setPhone(row.phone)
                    setNotes(row.notes)
                    setIsMember(row.is_member)
                    setGroupId(row.group_id ?? '')
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
            <FormField label={t('phone')}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label={t('city')}>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </FormField>
            <FormField label={t('group')}>
              <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                <option value="">{t('noGroup')}</option>
                {(groups.data?.data ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label={t('notes')}>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isMember} onChange={(e) => setIsMember(e.target.checked)} />
              {t('isMember')}
            </label>
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

      {printRows ? (
        <div
          ref={sheetRef}
          className="badge-print-sheet"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-10000px', top: 0 }}
        >
          {printRows.map(({ contact, badgeImageUrl }) => (
            <ContactBadge
              key={contact.id}
              value={contact.id}
              label={contact.name}
              badgeImageUrl={badgeImageUrl}
              className="h-[5.5cm] w-[9cm]"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
