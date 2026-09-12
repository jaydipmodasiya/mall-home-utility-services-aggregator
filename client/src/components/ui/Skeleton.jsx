export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function ProviderCardSkeleton() {
  return (
    <div className="card card-body flex gap-4">
      <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

export function ProviderListSkeleton({ count = 4 }) {
  return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: count }, (_, index) => <ProviderCardSkeleton key={index} />)}</div>
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      <Skeleton className="h-56 w-full" />
    </div>
  )
}
