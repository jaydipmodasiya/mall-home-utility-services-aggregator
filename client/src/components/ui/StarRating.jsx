import { Star } from 'lucide-react'

export function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${i < Math.round(rating) ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  )
}

export function RatingDisplay({ rating = 0, count = 0, size = 'sm' }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={rating} size={size} />
      <span className="text-sm font-semibold text-text-primary">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      {count > 0 && <span className="text-xs text-text-muted">({count})</span>}
    </div>
  )
}
