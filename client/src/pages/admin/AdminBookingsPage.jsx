import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/Layout'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchBookings = async (status = statusFilter, category = categoryFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (status) params.set('status', status)
      if (category) params.set('category', category)
      const { data } = await api.get(`/admin/bookings?${params}`)
      setBookings(data.bookings || [])
      setTotal(data.total || 0)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [])

  const statuses = ['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected']
  const categories = ['', 'electrician', 'plumber', 'carpenter', 'tailor', 'maintenance']

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Booking Monitoring</h1>
        <p className="text-text-muted text-sm mt-1">{total} total bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); fetchBookings(s, categoryFilter) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-brand-navy text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'}`}>
              {s || 'All Status'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => { setCategoryFilter(c); fetchBookings(statusFilter, c) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${categoryFilter === c ? 'bg-brand-aqua-dark text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'}`}>
              {c || 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <SectionLoader /> : bookings.length === 0 ? (
        <EmptyState title="No bookings found" icon={Calendar} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-cream-y border-b border-brand-peach-warm/60">
                <tr>
                  {['Category', 'Customer', 'Provider', 'City', 'Date', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-peach-warm/40">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-brand-cream-y transition-colors">
                    <td className="px-4 py-3 font-semibold capitalize text-text-primary">{b.serviceCategory}</td>
                    <td className="px-4 py-3 text-text-secondary">{b.customerId?.name || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{b.providerId?.userId?.name || '—'}</td>
                    <td className="px-4 py-3 text-text-muted">{b.serviceLocation?.city}</td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{formatCurrency(b.estimatedAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
