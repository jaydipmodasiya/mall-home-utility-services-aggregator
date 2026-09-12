import { Skeleton } from './Skeleton'

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-14 h-14' }
  return (
    <div className={`inline-block ${sizes[size]} ${className}`}>
      <div className="w-full h-full border-2 border-surface-tertiary border-t-brand-aqua-dark rounded-full animate-spin" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-secondary p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export function SectionLoader() {
  return (
    <div className="space-y-4 py-4" role="status" aria-label="Loading content">
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
    </div>
  )
}
