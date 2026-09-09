import { QRCodeSVG } from 'qrcode.react'

import { cn } from '@/lib/utils'

export function ContactBadge({
  value,
  label,
  badgeImageUrl,
  className,
  onImageError,
}: {
  value: string
  label: string
  badgeImageUrl?: string
  className?: string
  onImageError?: () => void
}) {
  return (
    <div
      className={cn(
        'contact-badge relative overflow-hidden bg-white [container-type:inline-size]',
        className,
      )}
    >
      {badgeImageUrl ? (
        <img
          src={badgeImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-fill"
          onError={onImageError}
        />
      ) : null}
      <div
        className="contact-badge-qr"
        style={{
          position: 'absolute',
          top: '30%',
          left: '5.5%',
          width: '30%',
          height: '47%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '90%', height: '90%', aspectRatio: '1' }}>
          <QRCodeSVG
            value={value}
            size={256}
            level="M"
            marginSize={1}
            title={label}
            bgColor="#ffffff"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </div>
      <p
        dir="rtl"
        className="contact-badge-name"
        style={{
          position: 'absolute',
          top: '42.5%',
          left: '40%',
          width: '43.5%',
          height: '14%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          margin: 0,
          fontWeight: 700,
          fontSize: '4.4cqw',
          lineHeight: 1.25,
          color: '#18181b',
        }}
      >
        <span
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </span>
      </p>
    </div>
  )
}

export async function waitForPrintAssets(root: ParentNode) {
  const images = [...root.querySelectorAll('img')]
  await Promise.all(
    images.map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          }),
    ),
  )
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

export async function printBadgeSheet(sheet: HTMLElement, title?: string) {
  await waitForPrintAssets(sheet)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const frameWindow = iframe.contentWindow
  if (!doc || !frameWindow) {
    iframe.remove()
    window.print()
    return
  }

  const safeTitle = (title ?? 'badges').replace(/[<>]/g, '')
  doc.open()
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
    <style>
      @page { size: A4 portrait; margin: 0.6cm; }
      html, body { margin: 0; background: #fff; font-family: Cairo, ui-sans-serif, sans-serif; }
      .badge-print-sheet {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 0.2cm;
        position: static !important;
        left: auto !important;
        top: auto !important;
      }
      .contact-badge {
        position: relative;
        width: 9cm;
        height: 5.5cm;
        overflow: hidden;
        background: #fff;
        flex-shrink: 0;
        break-inside: avoid;
        page-break-inside: avoid;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        container-type: inline-size;
      }
      .contact-badge img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
      .contact-badge-qr {
        position: absolute;
        top: 30%;
        left: 5.5%;
        width: 30%;
        height: 47%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .contact-badge-qr svg { width: 100% !important; height: 100% !important; display: block; }
      .contact-badge-name {
        position: absolute;
        top: 42.5%;
        left: 40%;
        width: 43.5%;
        height: 14%;
        display: flex;
        align-items: center;
        overflow: hidden;
        margin: 0;
        font-weight: 700;
        font-size: 4.4cqw;
        line-height: 1.25;
        color: #18181b;
      }
    </style>
  </head>
  <body></body>
</html>`)
  doc.close()

  const clone = sheet.cloneNode(true) as HTMLElement
  clone.style.position = 'static'
  clone.style.left = 'auto'
  clone.style.top = 'auto'
  clone.removeAttribute('aria-hidden')
  doc.body.appendChild(clone)
  await waitForPrintAssets(doc)

  const cleanup = () => {
    iframe.remove()
    frameWindow.removeEventListener('afterprint', cleanup)
  }
  frameWindow.addEventListener('afterprint', cleanup)
  window.setTimeout(cleanup, 60_000)
  frameWindow.focus()
  frameWindow.print()
}
