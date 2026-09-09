import { useTranslation } from 'react-i18next'

import { Button } from './ui/button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  danger = true,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
}) {
  const { t } = useTranslation('common')
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description ?? t('confirmDelete')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant={danger ? 'danger' : 'default'} onClick={onConfirm}>
            {confirmLabel ?? t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
