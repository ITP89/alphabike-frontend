import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { classNames } from '../../utils/formatters'

const variants = {
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  info: {
    icon: Info,
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
}

function Alert({ children, type = 'info', className = '' }) {
  const variant = variants[type] || variants.info
  const Icon = variant.icon

  return (
    <div className={classNames('flex items-start gap-2 rounded-md border px-3 py-2 text-sm', variant.className, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export default Alert
