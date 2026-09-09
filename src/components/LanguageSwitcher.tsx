import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-xs">
      <button
        type="button"
        className={cn('px-2.5 py-1.5', current.startsWith('ar') ? 'bg-blue-600 text-white' : 'text-slate-600')}
        onClick={() => void i18n.changeLanguage('ar-EG')}
      >
        {t('arabic')}
      </button>
      <button
        type="button"
        className={cn('px-2.5 py-1.5', current.startsWith('en') ? 'bg-blue-600 text-white' : 'text-slate-600')}
        onClick={() => void i18n.changeLanguage('en')}
      >
        {t('english')}
      </button>
    </div>
  )
}
