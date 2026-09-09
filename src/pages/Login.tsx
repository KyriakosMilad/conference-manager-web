import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
// import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthShell } from '@/components/AuthShell'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { resources } from '@/lib/resources'

export function LoginPage() {
  const { t } = useTranslation('auth')
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const data = await resources.login({ email, password })
      await login(data.token, data.user)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t('submitLogin'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <h1 className="text-xl font-semibold">{t('loginTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('loginSubtitle')}</p>
        </div>
        <FormField label={t('email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>
        <FormField label={t('password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </FormField>
        <Button type="submit" className="w-full" disabled={submitting}>
          {t('submitLogin')}
        </Button>
        {/* <Link to="/register" className="block text-center text-sm text-blue-700 hover:underline">
          {t('toRegister')}
        </Link> */}
      </form>
    </AuthShell>
  )
}
