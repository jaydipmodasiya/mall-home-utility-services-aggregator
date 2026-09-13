import { ArrowRight, Briefcase, Calendar, Clock, MapPin, Phone, Shield, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import { RatingDisplay } from '../../components/ui/StarRating'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'

export default function ProviderProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [provider, setProvider] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [provRes, revRes] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/reviews/provider/${id}?limit=5`),
        ])
        setProvider(provRes.data.provider)
        setReviews(revRes.data.reviews || [])
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load provider')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) return <PublicLayout><SectionLoader /></PublicLayout>
  if (error || !provider) return <PublicLayout><div className="page-container py-16"><ErrorState message={error} /></div></PublicLayout>

  const provUser = provider.userId || {}
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <PublicLayout>
      <div className="page-container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header card */}
            <div className="card card-body">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="relative flex-shrink-0">
                  <Avatar name={provUser.name} size="xl" src={provUser.avatar} />
                  <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${provider.isAvailable ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-text-primary">{provUser.name}</h1>
                        {provider.isVerified && (
                          <span className="flex items-center gap-1 text-xs bg-brand-cream-y text-text-primary px-2 py-0.5 rounded-full font-semibold">
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-text-muted text-sm flex items-center gap-1.5 mb-2">
                        <MapPin className="w-4 h-4 text-brand-coral" />
                        {provider.location?.area ? `${provider.location.area}, ` : ''}{provider.location?.city} · {provider.location?.state}
                      </p>
                      <RatingDisplay rating={provider.rating} count={provider.totalReviews} size="md" />
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${provider.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {provider.isAvailable ? '🟢 Available Now' : '🔴 Currently Busy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 mt-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-brand-coral" />{provider.completedJobs} jobs done</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-coral" />{provider.experience} yrs experience</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-coral" />Since {new Date(provUser.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {provider.bio && (
              <div className="card card-body">
                <h2 className="font-bold text-text-primary mb-3">About</h2>
                <p className="text-text-secondary text-sm leading-relaxed">{provider.bio}</p>
              </div>
            )}

            {/* Services & Skills */}
            <div className="card card-body">
              <h2 className="font-bold text-text-primary mb-4">Services & Skills</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.serviceCategories?.map((cat) => (
                  <span key={cat} className="badge-peach capitalize px-3 py-1">{cat}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {provider.skills?.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-brand-cream-y rounded-lg text-sm text-text-secondary border border-brand-peach-warm">{skill}</span>
                ))}
              </div>
            </div>

            {/* Availability */}
            {provider.availabilitySlots?.length > 0 && (
              <div className="card card-body">
                <h2 className="font-bold text-text-primary mb-4">Weekly Availability</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {provider.availabilitySlots.map((slot) => (
                    <div key={slot.day} className="bg-brand-cream-y rounded-xl p-3 text-center">
                      <p className="text-xs font-bold text-text-primary capitalize mb-1">{slot.day}</p>
                      <p className="text-xs text-text-muted">{slot.startTime} – {slot.endTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card card-body">
              <h2 className="font-bold text-text-primary mb-4">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-text-muted text-sm">No reviews yet. Be the first to book and review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="pb-4 border-b border-brand-peach-warm/60 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={r.customerId?.name} size="sm" />
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{r.customerId?.name}</p>
                          <p className="text-xs text-text-muted">{formatDate(r.createdAt)}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-brand-aqua-deep fill-brand-cream-y' : 'text-gray-200 fill-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-text-secondary ml-11">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="lg:col-span-1">
            <div className="card card-body sticky top-24">
              <h3 className="font-bold text-text-primary text-lg mb-4">Book this Provider</h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between py-2 border-b border-brand-peach-warm/60">
                  <span className="text-sm text-text-muted">Visiting Charge</span>
                  <span className="font-bold text-text-primary">{formatCurrency(provider.pricing?.visitingCharge)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-brand-peach-warm/60">
                  <span className="text-sm text-text-muted">Hourly Rate</span>
                  <span className="font-bold text-text-primary">{formatCurrency(provider.pricing?.hourlyRate)}/hr</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-muted">Response time</span>
                  <span className="font-semibold text-emerald-600 text-sm">Usually within 1hr</span>
                </div>
              </div>

              {user?.role === 'customer' ? (
                <Link to={`/customer/book/${provider._id}`} className="btn-primary w-full justify-center py-3">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
              ) : user ? (
                <p className="text-center text-sm text-text-muted bg-brand-cream-y rounded-xl p-3">Login as a customer to book.</p>
              ) : (
                <Link to="/login" className="btn-primary w-full justify-center py-3">
                  Sign in to Book <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {provUser.phone && (
                <a href={`tel:${provUser.phone}`} className="btn-secondary w-full justify-center mt-3">
                  <Phone className="w-4 h-4" /> Call Provider
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
