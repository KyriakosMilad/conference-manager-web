import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function Logo({ compact = false, to = '/' }: { compact?: boolean; to?: string }) {
  const { t } = useTranslation('common')

  return (
    <Link to={to} className="flex items-center gap-3 text-slate-900">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#2563eb" />
        <rect x="9" y="11" width="22" height="19" rx="2.5" stroke="white" strokeWidth="2" fill="none" />
        <path d="M9 16.5h22" stroke="white" strokeWidth="2" />
        <path d="M14 8.5v5M26 8.5v5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16.5" cy="23" r="2" fill="white" />
        <circle cx="23.5" cy="23" r="2" fill="white" />
      </svg>
      <span className={cn('font-semibold leading-tight', compact && 'sr-only')}>{t('appName')}</span>
    </Link>
  )
}
