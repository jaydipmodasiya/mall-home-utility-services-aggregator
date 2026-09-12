import { AlertTriangle, FileText, MapPin, Phone, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import { StarRating } from '../../components/ui/StarRating'
import { BookingTimeline, StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDateTime } from '../../utils/constants'

export default function BookingDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [disputeModal, setDisputeModal] = useState(false)
  const [review, setReview] = useState({ rating: 0, comment: '' })
  const [dispute, setDispute] = useState({ subject: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`)
      setBooking(data.booking)
    } catch (e) { setError(e.response?.data?.message || 'Failed to load booking') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBooking() }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled by customer' })
      toast.success('Booking cancelled')
      fetchBooking()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to cancel') }
    finally { setCancelling(false) }
  }

  const handleReview = async () => {
    if (!review.rating) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews', { bookingId: id, ...review })
      toast.success('Review submitted! Thank you.')
      setReviewModal(false)
      fetchBooking()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review') }
    finally { setSubmitting(false) }
  }

  const handleDispute = async () => {
    if (!dispute.subject || !dispute.description) { toast.error('Please fill all fields'); return }
    setSubmitting(true)
    try {
      await api.post('/disputes', { bookingId: id, ...dispute })
      toast.success('Dispute raised. Admin will review shortly.')
      setDisputeModal(false)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to raise dispute') }
    finally { setSubmitting(false) }
  }

  if (loading) return <DashboardLayout role="customer"><SectionLoader /></DashboardLayout>
  if (error || !booking) return <DashboardLayout role="customer"><ErrorState message={error} /></DashboardLayout>

  const provider = booking.providerId
  const provUser = provider?.userId || {}
  const canCancel = ['pending', 'assigned'].includes(booking.status)
  const canReview = booking.status === 'completed' && !booking.isReviewed

  return (
    <DashboardLayout role="customer">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Booking Details</h1>
            <p className="text-xs text-text-muted mt-1">ID: {booking._id}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Timeline */}
        <div className="card card-body mb-5">
          <h2 className="font-bold text-text-primary mb-5">Service Status</h2>
          <BookingTimeline status={booking.status} statusHistory={booking.statusHistory} />
        </div>

        {/* Provider info */}
        <div className="card card-body mb-5">
          <h2 className="font-bold text-text-primary mb-4">Service Provider</h2>
          <div className="flex items-center gap-4">
            <Avatar name={provUser.name} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-text-primary">{provUser.name}</p>
              <p className="text-sm text-text-muted capitalize">{booking.serviceCategory}</p>
            </div>
            {provUser.phone && (
              <a href={`tel:${provUser.phone}`} className="btn-secondary text-sm"><Phone className="w-4 h-4" /> Call</a>
            )}
          </div>
        </div>

        {/* Booking info */}
        <div className="card card-body mb-5 space-y-4">
          <h2 className="font-bold text-text-primary">Booking Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Service Category</p>
              <p className="font-semibold text-text-primary capitalize">{booking.serviceCategory}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Booking Type</p>
              <p className="font-semibold text-text-primary capitalize">{booking.bookingType}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Booked On</p>
              <p className="font-semibold text-text-primary">{formatDateTime(booking.createdAt)}</p>
            </div>
            {booking.scheduledAt && (
              <div>
                <p className="text-xs text-text-muted mb-1">Scheduled For</p>
                <p className="font-semibold text-text-primary">{formatDateTime(booking.scheduledAt)}</p>
              </div>
            )}
            {booking.completedAt && (
              <div>
                <p className="text-xs text-text-muted mb-1">Completed On</p>
                <p className="font-semibold text-emerald-600">{formatDateTime(booking.completedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted mb-1">Estimated Amount</p>
              <p className="font-bold text-text-primary">{formatCurrency(booking.estimatedAmount)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Description</p>
            <p className="text-sm text-text-secondary bg-brand-cream-y rounded-xl p-3">{booking.serviceDescription}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Service Location</p>
            <p className="text-sm text-text-secondary">{booking.serviceLocation?.address}, {booking.serviceLocation?.area ? `${booking.serviceLocation.area}, ` : ''}{booking.serviceLocation?.city} {booking.serviceLocation?.pincode}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {canReview && (
            <button onClick={() => setReviewModal(true)} className="btn-primary py-3 justify-center">
              <Star className="w-4 h-4" /> Rate & Review
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger py-3 justify-center">
              {cancelling ? <Spinner size="sm" /> : <><X className="w-4 h-4" /> Cancel Booking</>}
            </button>
          )}
          {booking.status === 'completed' && (
            <button onClick={() => setDisputeModal(true)} className="btn-ghost py-2 justify-center text-sm">
              <AlertTriangle className="w-4 h-4" /> Raise a Dispute
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card card-body w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-primary text-lg">Rate your experience</h3>
              <button onClick={() => setReviewModal(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-center mb-5">
              <StarRating rating={review.rating} size="lg" interactive onChange={(r) => setReview({ ...review, rating: r })} />
            </div>
            <p className="text-center text-sm text-text-muted mb-4">
              {review.rating === 0 ? 'Tap a star to rate' : review.rating <= 2 ? 'We\'re sorry to hear that' : review.rating <= 3 ? 'Good experience' : review.rating <= 4 ? 'Great!' : 'Excellent! 🎉'}
            </p>
            <textarea className="form-textarea mb-4" placeholder="Share your experience (optional)..." value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={3} />
            <button onClick={handleReview} disabled={submitting} className="btn-primary w-full py-3 justify-center">
              {submitting ? <Spinner size="sm" /> : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card card-body w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-primary text-lg">Raise a Dispute</h3>
              <button onClick={() => setDisputeModal(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Subject *</label>
                <input className="form-input" placeholder="Brief subject..." value={dispute.subject} onChange={(e) => setDispute({ ...dispute, subject: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe the issue in detail..." rows={4} value={dispute.description} onChange={(e) => setDispute({ ...dispute, description: e.target.value })} />
              </div>
            </div>
            <button onClick={handleDispute} disabled={submitting} className="btn-primary w-full py-3 justify-center mt-4">
              {submitting ? <Spinner size="sm" /> : 'Submit Dispute'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
