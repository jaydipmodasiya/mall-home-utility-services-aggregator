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
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-text-muted text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner size="lg" />
    </div>
  )
}
