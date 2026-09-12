import { MapPin, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/Layout'
import { DropdownSelect } from '../../components/ui/DropdownSelect'
import { ErrorState, NoResults } from '../../components/ui/EmptyState'
import ProviderCard from '../../components/ui/ProviderCard'
import { ProviderListSkeleton } from '../../components/ui/Skeleton'
import api from '../../services/api'
import { CATEGORIES } from '../../utils/constants'

export default function ProviderSearchPage() {
  const [searchParams] = useSearchParams()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    available: '',
    minRating: '',
  })

  const fetchProviders = async (p = 1, f = filters) => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ page: p, limit: 12 })
      if (f.category)  params.set('category', f.category)
      if (f.city)      params.set('city', f.city)
      if (f.available) params.set('available', f.available)
      if (f.minRating) params.set('minRating', f.minRating)
      const { data } = await api.get(`/providers?${params}`)
      setProviders(data.providers || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(p)
    } catch { setProviders([]); setError(true) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProviders() }, [])

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    fetchProviders(1, newFilters)
  }

  const clearFilter = (key) => {
    const nf = { ...filters, [key]: '' }
    applyFilters(nf)
  }

  const activeFilters = Object.entries(filters).filter(([, v]) => v)

  return (
    <PublicLayout>
      <div className="page-container py-8 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-text-primary">Find service providers</h1>
          <p className="text-text-muted text-sm mt-1">{total} verified professionals available</p>
        </div>

        {/* Filter bar */}
        <div className="relative z-20 bg-white rounded-xl border border-brand-peach-warm/60 p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-[minmax(240px,1.8fr)_repeat(3,minmax(150px,1fr))]">
            {/* City search */}
            <div className="relative min-w-0">
              <label className="form-label" htmlFor="provider-location">City or area</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <input
                  id="provider-location"
                  type="text"
                  placeholder="Search by city or area..."
                  className="form-input h-11 pl-10"
                  value={filters.city}
                  onChange={(e) => applyFilters({ ...filters, city: e.target.value })}
                />
              </div>
            </div>

            <DropdownSelect className="min-w-[170px]" value={filters.category} onChange={(value) => applyFilters({ ...filters, category: value })} options={[{ value: '', label: 'All Services' }, ...CATEGORIES.map(({ key, label }) => ({ value: key, label }))]} label="Service category" />
            <DropdownSelect className="min-w-[150px]" value={filters.available} onChange={(value) => applyFilters({ ...filters, available: value })} options={[{ value: '', label: 'Any Availability' }, { value: 'true', label: 'Available Now' }]} label="Availability" />
            <DropdownSelect className="min-w-[140px]" value={filters.minRating} onChange={(value) => applyFilters({ ...filters, minRating: value })} options={[{ value: '', label: 'Any Rating' }, { value: '4', label: '4+ Stars' }, { value: '4.5', label: '4.5+ Stars' }]} label="Minimum rating" />
          </div>

          {/* Active chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-brand-peach-warm/60">
              {activeFilters.map(([key, val]) => (
                <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-aqua/10 text-brand-aqua-deep text-xs font-semibold rounded-full">
                  {key}: {val}
                  <button onClick={() => clearFilter(key)} className="hover:text-red-500 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => applyFilters({ category: '', city: '', available: '', minRating: '' })}
                className="text-xs text-text-muted hover:text-red-500 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <ProviderListSkeleton />
        ) : error ? (
          <ErrorState message="We couldn't load providers right now. Please try again." onRetry={() => fetchProviders(1)} />
        ) : providers.length === 0 ? (
          <NoResults query={filters.city} action={<button type="button" className="btn-secondary text-sm" onClick={() => applyFilters({ category: '', city: '', available: '', minRating: '' })}>Clear Filters</button>} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {providers.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchProviders(page - 1)}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-text-muted px-3">Page {page} of {pages}</span>
                <button
                  disabled={page >= pages}
                  onClick={() => fetchProviders(page + 1)}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  )
}
