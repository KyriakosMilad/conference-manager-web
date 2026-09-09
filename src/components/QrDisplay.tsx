import { Printer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'

import { ContactBadge } from './ContactBadge'
import { Button } from './ui/button'

type QrDisplayProps = {
  value: string
  label?: string
  badgeImageUrl?: string
  printable?: boolean
}

function PlainQr({ value, label }: { value: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6">
      <QRCodeSVG value={value} size={220} level="M" marginSize={2} title={label} />
      {label ? <p className="text-sm text-slate-600">{label}</p> : null}
    </div>
  )
}

function PrintButton() {
  const { t } = useTranslation('common')
  return (
    <div className="mb-3 flex justify-end print:hidden">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        {t('print')}
      </Button>
    </div>
  )
}

export function QrDisplay({ value, label, badgeImageUrl, printable = false }: QrDisplayProps) {
  const [badgeFailed, setBadgeFailed] = useState(false)

  if (!badgeImageUrl || badgeFailed) {
    return (
      <div>
        {printable ? <PrintButton /> : null}
        <div className={printable ? 'badge-print-sheet' : undefined}>
          <PlainQr value={value} label={label} />
        </div>
      </div>
    )
  }

  return (
    <div>
      {printable ? <PrintButton /> : null}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white print:overflow-visible print:rounded-none print:border-0">
        <div className={printable ? 'badge-print-sheet' : undefined}>
          <ContactBadge
            value={value}
            label={label ?? ''}
            badgeImageUrl={badgeImageUrl}
            className="w-full max-w-4xl [aspect-ratio:9/5.5]"
            onImageError={() => setBadgeFailed(true)}
          />
        </div>
      </div>
    </div>
  )
}
