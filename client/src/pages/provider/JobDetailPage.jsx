import { CheckCircle, FileText, MapPin, Phone, Play, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import { BookingTimeline, StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDateTime } from '../../utils/constants'

export default function JobDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`)
      setBooking(data.booking)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to load job details') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBooking() }, [id])

  const updateStatus = async (status, note = '') => {
    setUpdating(true)
    try {
      await api.patch(`/bookings/${id}/status`, { status, note })
      toast.success(`Job ${status === 'assigned' ? 'assigned' : status === 'rejected' ? 'rejected' : status === 'in_progress' ? 'marked as in progress' : 'marked as completed'}!`)
      fetchBooking()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update status') }
    finally { setUpdating(false) }
  }

  if (loading) return <DashboardLayout role="provider"><SectionLoader /></DashboardLayout>
  if (!booking) return <DashboardLayout role="provider"><ErrorState /></DashboardLayout>

  const customer = booking.customerId || {}

  const ActionButtons = () => {
    if (booking.status === 'pending') return (
      <div className="flex gap-3">
        <button onClick={() => updateStatus('assigned')} disabled={updating} className="btn-primary flex-1 py-3 justify-center">
          {updating ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Accept Job</>}
        </button>
        <button onClick={() => updateStatus('rejected')} disabled={updating} className="btn-danger flex-1 py-3 justify-center">
          {updating ? <Spinner size="sm" /> : <><XCircle className="w-4 h-4" /> Reject</>}
        </button>
      </div>
    )
    if (booking.status === 'assigned') return (
      <button onClick={() => updateStatus('in_progress')} disabled={updating} className="btn-primary w-full py-3 justify-center">
        {updating ? <Spinner size="sm" /> : <><Play className="w-4 h-4" /> Start Job</>}
      </button>
    )
    if (booking.status === 'in_progress') return (
      <button onClick={() => updateStatus('completed')} disabled={updating} className="btn-primary w-full py-3 justify-center bg-emerald-500 hover:bg-emerald-400">
        {updating ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Mark as Completed</>}
      </button>
    )
    return null
  }

  return (
    <DashboardLayout role="provider">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Job Details</h1>
          <StatusBadge status={booking.status} />
        </div>

        {/* Timeline */}
        <div className="card card-body mb-5">
          <h2 className="font-bold text-text-primary mb-5">Job Status</h2>
          <BookingTimeline status={booking.status} statusHistory={booking.statusHistory} />
        </div>

        {/* Customer info */}
        <div className="card card-body mb-5">
          <h2 className="font-bold text-text-primary mb-4">Customer</h2>
          <div className="flex items-center gap-4">
            <Avatar name={customer.name} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-text-primary">{customer.name}</p>
              <p className="text-sm text-text-muted">{customer.email}</p>
            </div>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="btn-secondary text-sm">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
          </div>
        </div>

        {/* Job details */}
        <div className="card card-body mb-5 space-y-4">
          <h2 className="font-bold text-text-primary">Job Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Category</p>
              <p className="font-semibold text-text-primary capitalize">{booking.serviceCategory}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Type</p>
              <p className="font-semibold text-text-primary capitalize">{booking.bookingType}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Requested On</p>
              <p className="font-semibold text-text-primary">{formatDateTime(booking.createdAt)}</p>
            </div>
            {booking.scheduledAt && (
              <div>
                <p className="text-xs text-text-muted mb-1">Scheduled For</p>
                <p className="font-semibold text-brand-aqua-deep">{formatDateTime(booking.scheduledAt)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted mb-1">Estimated Amount</p>
              <p className="font-bold text-emerald-600 text-lg">{formatCurrency(booking.estimatedAmount)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Description</p>
            <p className="text-sm text-text-secondary bg-brand-cream-y rounded-xl p-3">{booking.serviceDescription}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Service Location</p>
            <p className="text-sm text-text-secondary">{booking.serviceLocation?.address}, {booking.serviceLocation?.city} {booking.serviceLocation?.pincode}</p>
            {booking.serviceLocation?.landmark && <p className="text-xs text-text-muted mt-0.5">Near: {booking.serviceLocation.landmark}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <ActionButtons />
      </div>
    </DashboardLayout>
  )
}
