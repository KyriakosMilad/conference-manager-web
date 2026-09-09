import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
// import { toast } from 'sonner'

import { AuthShell } from '@/components/AuthShell'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { ApiError } from '@/lib/api'
// import { useAuth } from '@/lib/auth'
// import { resources } from '@/lib/resources'

export function RegisterPage() {
  const { t } = useTranslation('auth')
  // const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organisationName, setOrganisationName] = useState('')
  const submitting = false

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    // registration disabled — login only
    // const data = await resources.register({
    //   name,
    //   email,
    //   password,
    //   organisation_name: organisationName,
    // })
    // await login(data.token, data.user)
  }

  return (
    <AuthShell>
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <h1 className="text-xl font-semibold">{t('registerTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('registerSubtitle')}</p>
        </div>
        <FormField label={t('name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>
        <FormField label={t('email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>
        <FormField label={t('password')} hint={t('passwordHint')}>
          <Input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>
        <FormField label={t('organisationName')}>
          <Input value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} required />
        </FormField>
        <Button type="submit" className="w-full" disabled={submitting}>
          {t('submitRegister')}
        </Button>
        <Link to="/login" className="block text-center text-sm text-blue-700 hover:underline">
          {t('toLogin')}
        </Link>
      </form>
    </AuthShell>
  )
}
