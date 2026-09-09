import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from './ui/button'

export function QrScanner({
  onScan,
  enabled,
}: {
  onScan: (value: string) => void
  enabled: boolean
}) {
  const { t } = useTranslation('attendance')
  const elementId = useId().replace(/:/g, '')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastValue = useRef('')
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [wanted, setWanted] = useState(true)

  useEffect(() => {
    if (!enabled) setWanted(true)
  }, [enabled])

  useEffect(() => {
    const shouldRun = enabled && wanted
    if (!shouldRun) {
      const scanner = scannerRef.current
      scannerRef.current = null
      if (scanner?.isScanning) {
        void scanner.stop().finally(() => scanner.clear())
      }
      setRunning(false)
      return
    }

    const scanner = new Html5Qrcode(elementId)
    scannerRef.current = scanner
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (decoded === lastValue.current) return
          lastValue.current = decoded
          onScan(decoded)
          window.setTimeout(() => {
            if (lastValue.current === decoded) lastValue.current = ''
          }, 2500)
        },
        () => undefined,
      )
      .then(() => {
        setRunning(true)
        setError(null)
      })
      .catch(() => {
        setError(t('cameraError'))
        setRunning(false)
      })

    return () => {
      if (scanner.isScanning) {
        void scanner.stop().finally(() => scanner.clear())
      }
    }
  }, [elementId, enabled, onScan, t, wanted])

  return (
    <div className="space-y-3">
      <div id={elementId} className="min-h-64 overflow-hidden rounded-xl border border-slate-200 bg-black" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!enabled ? <p className="text-sm text-slate-500">{t('needSession')}</p> : null}
      {enabled ? (
        <Button variant="outline" onClick={() => setWanted((value) => !value)}>
          {running || wanted ? t('stopCamera') : t('startCamera')}
        </Button>
      ) : null}
    </div>
  )
}
