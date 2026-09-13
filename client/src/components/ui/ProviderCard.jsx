import { Briefcase, CheckCircle, ChevronRight, Clock, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/constants'
import { Avatar } from './Avatar'

export default function ProviderCard({ provider }) {
  const user = provider.userId || {}
  const isAvailable = provider.isAvailable

  const ratingInt = Math.round(provider.rating || 0)

  return (
    <div className="bg-white rounded-xl border border-brand-peach-warm/60 hover:border-brand-aqua/40 hover:shadow-card-hover transition-all duration-200 group overflow-hidden">
      {/* Availability stripe */}
      <div className={`h-1 w-full ${isAvailable ? 'bg-brand-aqua' : 'bg-brand-peach-warm'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <Avatar name={user.name} size="md" src={user.avatar} />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isAvailable ? 'bg-emerald-400' : 'bg-gray-300'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-text-primary text-sm">{user.name}</p>
              {provider.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-brand-aqua-dark flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < ratingInt ? 'text-brand-aqua-deep fill-brand-cream-y' : 'text-gray-200 fill-gray-200'}`} />
              ))}
              <span className="text-xs text-text-muted ml-1">({provider.totalReviews || 0})</span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {provider.location?.area ? `${provider.location.area}, ` : ''}{provider.location?.city || 'India'}
            </p>
          </div>

          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {isAvailable ? 'Available' : 'Busy'}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.serviceCategories?.map((cat) => (
            <span key={cat} className="text-xs px-2 py-0.5 bg-brand-aqua/10 text-brand-aqua-deep rounded-full capitalize font-medium">
              {cat}
            </span>
          ))}
        </div>

        {/* Skills */}
        {provider.skills?.length > 0 && (
          <p className="text-xs text-text-muted mb-4 line-clamp-1">
            {provider.skills.slice(0, 4).join(' · ')}
            {provider.skills.length > 4 ? ` +${provider.skills.length - 4}` : ''}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-peach-warm/50">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{provider.completedJobs} jobs</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{provider.experience}y exp</span>
          </div>
          <p className="text-sm font-bold text-brand-navy">
            from {formatCurrency(provider.pricing?.visitingCharge)}
          </p>
        </div>

        <Link
          to={`/provider-profile/${provider._id}`}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-brand-aqua-deep border border-brand-aqua/60 rounded-lg hover:bg-brand-aqua hover:text-brand-navy transition-all duration-150"
        >
          View Profile <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
