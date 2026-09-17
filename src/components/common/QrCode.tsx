import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

type QrCodeProps = {
  value: string
  label: string
}

export function QrCode({ value, label }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setDataUrl(null)
    setHasError(false)

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 240,
    })
      .then((nextDataUrl) => {
        if (isCurrent) setDataUrl(nextDataUrl)
      })
      .catch(() => {
        if (isCurrent) setHasError(true)
      })

    return () => {
      isCurrent = false
    }
  }, [value])

  if (hasError) {
    return (
      <div className="flex aspect-square w-full max-w-60 items-center justify-center rounded-2xl bg-stone-100 p-5 text-center text-sm font-semibold text-stone-500">
        QR code could not be generated.
      </div>
    )
  }

  if (!dataUrl) {
    return <div className="aspect-square w-full max-w-60 animate-pulse rounded-2xl bg-stone-100" aria-label="Generating QR code" role="status" />
  }

  return <img className="aspect-square w-full max-w-60 rounded-2xl" src={dataUrl} alt={label} />
}
