import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { resources } from '@/lib/resources'

export function OrganisationPage() {
  const { t } = useTranslation('org')
  const { t: tc } = useTranslation('common')
  const { organisation } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState(organisation?.name ?? '')

  useEffect(() => {
    if (organisation?.name) setName(organisation.name)
  }, [organisation?.name])

  const save = useMutation({
    mutationFn: () => {
      if (!organisation) throw new Error('missing organisation')
      return resources.updateOrganisation(organisation.id, { name })
    },
    onSuccess: async () => {
      toast.success(t('saved'))
      await queryClient.invalidateQueries({ queryKey: ['organisation'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : tc('error')),
  })

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title={t('title')} />
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <FormField label={t('name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>
        <Button type="submit" disabled={save.isPending || !organisation}>
          {tc('save')}
        </Button>
      </form>
    </div>
  )
}
