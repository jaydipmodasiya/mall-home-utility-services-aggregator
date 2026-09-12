import { Calendar, ChevronRight, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'

export default function BookingsListPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [total, setTotal] = useState(0)

  const fetchBookings = (status = '') => {
    setLoading(true)
    const params = status ? `?status=${status}&limit=50` : '?limit=50'
    api.get(`/bookings${params}`)
      .then(({ data }) => { setBookings(data.bookings || []); setTotal(data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const handleFilter = (s) => { setFilter(s); fetchBookings(s) }

  const statusOptions = ['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled']

  return (
    <DashboardLayout role="customer">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Bookings</h1>
          <p className="text-text-muted text-sm mt-1">{total} total bookings</p>
        </div>
        <Link to="/providers" className="btn-primary text-sm">Book New Service</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Filter className="w-4 h-4 text-text-muted" />
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? 'bg-brand-navy text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <SectionLoader />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message="You haven't made any bookings yet. Find a provider to get started."
          icon={Calendar}
          action={<Link to="/providers" className="btn-primary text-sm">Find a Provider</Link>}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const provUser = b.providerId?.userId || {}
            return (
              <Link key={b._id} to={`/customer/bookings/${b._id}`} className="card-hover flex items-center gap-4 px-5 py-4">
                <div className="w-11 h-11 rounded-xl bg-brand-peach-warm flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary capitalize text-sm">{b.serviceCategory}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {provUser.name || 'Provider'} · {b.serviceLocation?.city} · {formatDate(b.createdAt)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{b.serviceDescription}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary hidden sm:block">{formatCurrency(b.estimatedAmount)}</span>
                  <ChevronRight className="w-4 h-4 text-text-light" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
