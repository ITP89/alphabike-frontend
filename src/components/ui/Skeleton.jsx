import { classNames } from '../../utils/formatters'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={classNames('animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80', className)}
      {...props}
    />
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-none">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-5 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-red-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 animate-pulse">
        Cargando AlphaBike...
      </p>
    </div>
  )
}

