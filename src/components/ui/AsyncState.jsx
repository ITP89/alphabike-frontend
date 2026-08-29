import { RefreshCw, SearchX } from 'lucide-react'

export function LoadingState({ text = 'Cargando informacion...' }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-hidden="true" />
      {text}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'No hay resultados', description = 'Prueba con otros filtros.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <SearchX className="mb-3 h-8 w-8 text-gray-400" aria-hidden="true" />
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}
