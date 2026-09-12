import { AlertCircle, PackageOpen, RefreshCw, SearchX } from 'lucide-react'

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="font-semibold text-text-primary mb-1">Something went wrong</h3>
      <p className="text-text-muted text-sm mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button className="btn-secondary text-sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message, icon: Icon = PackageOpen, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-xl bg-surface-tertiary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-brand-aqua-dark" />
      </div>
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      {message && <p className="text-text-muted text-sm mb-5 max-w-xs">{message}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export function NoResults({ query, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-xl bg-surface-tertiary flex items-center justify-center mb-4">
        <SearchX className="w-7 h-7 text-brand-aqua-dark" />
      </div>
      <h3 className="font-semibold text-text-primary mb-1">No results found</h3>
      <p className="text-text-muted text-sm max-w-xs">No providers found nearby. {query ? `Nothing matched "${query}".` : 'Try changing your category or location.'}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
