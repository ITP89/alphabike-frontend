import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
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
    <div className={classNames('flex h-full w-full flex-col items-center justify-center bg-gray-100 text-xs text-gray-400', className)}>
      <ImageOff className="mb-1 h-5 w-5" aria-hidden="true" />
      Sin imagen
    </div>
  )
}

export default ImageFallback
