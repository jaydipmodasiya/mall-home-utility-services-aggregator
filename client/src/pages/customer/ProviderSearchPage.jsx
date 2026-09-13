import { Loader2, LocateFixed, MapPin, X } from 'lucide-react'
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
  const [providerLoading, setProviderLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [providerLoadError, setProviderLoadError] = useState(false)
  const [coordinates, setCoordinates] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [locationStatus, setLocationStatus] = useState('')

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    available: '',
    minRating: '',
  })

  const fetchProviders = async (p = 1, f = filters, location = coordinates) => {
    setProviderLoading(true)
    setProviderLoadError(false)
    try {
      const params = new URLSearchParams({ page: p, limit: 12 })
      if (f.category)  params.set('category', f.category)
      if (f.city)      params.set('city', f.city)
      if (f.available) params.set('available', f.available)
      if (f.minRating) params.set('minRating', f.minRating)
      if (location) {
        params.set('latitude', location.latitude)
        params.set('longitude', location.longitude)
      }
      const { data } = await api.get(`/providers?${params}`)
      setProviders(data.providers || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(p)
    } catch { setProviders([]); setProviderLoadError(true) }
    finally { setProviderLoading(false) }
  }

  useEffect(() => {
    const key = 'provider-discovery-session'
    const sessionId = sessionStorage.getItem(key) || (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
    sessionStorage.setItem(key, sessionId)
    api.post('/discovery/provider-search', {
      sessionId,
      category: filters.category,
      city: filters.city,
    }).catch((error) => {
      if (import.meta.env.DEV) console.warn('Optional provider discovery tracking failed', error)
    })
    fetchProviders()
  }, [])

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    const cityChanged = newFilters.city !== filters.city
    if (cityChanged) setCoordinates(null)
    fetchProviders(1, newFilters, cityChanged ? null : coordinates)
  }

  const clearFilter = (key) => {
    const nf = { ...filters, [key]: '' }
    applyFilters(nf)
  }

  const useCurrentLocation = () => {
    setLocationError('')
    setLocationStatus('')
    setCoordinates(null)
    if (!navigator.geolocation) {
      setLocationError('Location is not available in this browser. You can still search by city or area.')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          setLocationLoading(false)
          setLocationError('Your browser returned an invalid location. You can still search by city or area.')
          return
        }
        const location = { latitude, longitude }
        setCoordinates(location)
        setLocationLoading(false)
        setLocationStatus('Searching for providers near you...')
        fetchProviders(1, filters, location)
      },
      (geoError) => {
        setLocationLoading(false)
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? 'Location permission was denied. You can still search by city or area.'
          : geoError.code === geoError.TIMEOUT
            ? 'Location detection timed out. Please try again or search by city or area.'
            : geoError.code === geoError.POSITION_UNAVAILABLE
              ? 'Your location is currently unavailable. You can still search by city or area.'
              : 'Your location could not be detected. You can still search by city or area.'
        setLocationError(message)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
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
                  className="form-input h-11 pl-10 pr-12"
                  value={filters.city}
                  onChange={(e) => applyFilters({ ...filters, city: e.target.value })}
                />
                <button type="button" onClick={useCurrentLocation} disabled={locationLoading} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-brand-aqua-deep hover:bg-brand-aqua/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua/40 disabled:opacity-50" aria-label={locationLoading ? 'Detecting your location' : 'Use my current location'} title="Use my current location">
                  {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                </button>
              </div>
              {locationError && <p className="mt-1 text-xs text-red-600" role="alert">{locationError}</p>}
              {locationStatus && <p className="mt-1 text-xs text-text-muted" role="status">{locationStatus}</p>}
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
        {providerLoading ? (
          <ProviderListSkeleton />
        ) : providerLoadError ? (
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
