import { ChevronRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import api from '../../services/api'
import { formatDate } from '../../utils/constants'

export default function ServiceHistoryPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings?status=completed&limit=50')
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="customer">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Service History</h1>
        <p className="text-text-muted text-sm mt-1">{bookings.length} completed services</p>
      </div>

      {loading ? <SectionLoader /> : bookings.length === 0 ? (
        <EmptyState title="No completed services yet" message="Your completed bookings will appear here." icon={Star} />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const provUser = b.providerId?.userId || {}
            return (
              <Link key={b._id} to={`/customer/bookings/${b._id}`} className="card-hover flex items-center gap-4 px-5 py-4">
                <Avatar name={provUser.name} size="md" src={provUser.avatar} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary capitalize text-sm">{b.serviceCategory}</p>
                  <p className="text-xs text-text-muted">{provUser.name} · {b.serviceLocation?.city} · {formatDate(b.completedAt || b.updatedAt)}</p>
                  {b.isReviewed ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5"><Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Reviewed</span>
                  ) : (
                    <span className="text-xs text-brand-coral-dark font-medium">Tap to leave a review</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-light" />
              </Link>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
