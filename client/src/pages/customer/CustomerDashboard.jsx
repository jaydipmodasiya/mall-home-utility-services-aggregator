import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout/Layout'
import { SectionLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import api from '../../services/api'
import { formatDate, formatCurrency, CATEGORIES } from '../../utils/constants'
import { Calendar, Clock, ChevronRight, Star, Zap, Droplets, Hammer, Scissors, Wrench, ArrowRight, PlusCircle } from 'lucide-react'

const iconMap = { Zap, Droplets, Hammer, Scissors, Wrench }

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings?limit=10')
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active    = bookings.filter((b) => ['pending', 'assigned', 'in_progress'].includes(b.status))
  const completed = bookings.filter((b) => b.status === 'completed')
  const latest    = active[0] || completed[0]

  return (
    <DashboardLayout role="customer">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">What do you need help with today?</p>
      </div>

      {/* Active booking highlight */}
      {latest && (
        <Link
          to={`/customer/bookings/${latest._id}`}
          className="block bg-brand-navy rounded-xl p-5 mb-6 hover:bg-brand-navy-mid transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-aqua mb-1 uppercase tracking-wide">
                {['pending','assigned','in_progress'].includes(latest.status) ? 'Active Booking' : 'Last Booking'}
              </p>
              <p className="text-lg font-bold text-white capitalize">{latest.serviceCategory}</p>
              <p className="text-sm text-text-onDark/60 mt-0.5">{latest.serviceLocation?.city} · {formatDate(latest.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={latest.status} />
              <ChevronRight className="w-5 h-5 text-brand-aqua" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total', value: bookings.length, color: 'text-text-primary' },
          { label: 'Active', value: active.length, color: 'text-brand-aqua-deep' },
          { label: 'Done', value: completed.length, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-peach-warm/60 p-4 text-center">
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick book */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-text-primary">Book a service</h2>
          <Link to="/providers" className="text-xs font-semibold text-brand-coral hover:text-brand-coral-dark flex items-center gap-1">
            All services <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map(({ key, label, icon, color }) => {
            const Icon = iconMap[icon] || Zap
            return (
              <Link
                key={key}
                to={`/providers?category=${key}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-brand-peach-warm/60 hover:border-brand-aqua/40 hover:shadow-card-hover transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-text-secondary text-center leading-tight">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-text-primary">Recent bookings</h2>
          <Link to="/customer/bookings" className="text-xs font-semibold text-brand-coral hover:text-brand-coral-dark flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? <SectionLoader /> : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            message="Book your first service to get started."
            action={<Link to="/providers" className="btn-primary text-sm">Find a Provider</Link>}
          />
        ) : (
          <div className="bg-white rounded-xl border border-brand-peach-warm/60 divide-y divide-brand-peach-warm/40">
            {bookings.slice(0, 5).map((b) => (
              <Link
                key={b._id}
                to={`/customer/bookings/${b._id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-secondary transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-brand-aqua-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm capitalize">{b.serviceCategory}</p>
                  <p className="text-xs text-text-muted">{b.serviceLocation?.city} · {formatDate(b.createdAt)}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
