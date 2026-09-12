import { useEffect, useState } from 'react'
import alphaLogo from '../../assets/alphabike-logo.png'
import { classNames } from '../../utils/formatters'

function ImageFallback({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={classNames('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div className={classNames('relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-zinc-100 text-xs text-zinc-500', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(220,38,38,0.16),transparent_30%),linear-gradient(135deg,#fafafa_0%,#e4e4e7_100%)]" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[14px] border-zinc-950/10" />
      <img src={alphaLogo} alt="" aria-hidden="true" className="relative h-20 w-20 object-contain opacity-80 grayscale" />
      <span className="relative mt-2 rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-200">
        AlphaBike
      </span>
    </div>
  )
}

export default ImageFallback
