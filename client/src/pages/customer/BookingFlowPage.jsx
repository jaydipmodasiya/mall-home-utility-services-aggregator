import { Calendar, CheckCircle, ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import { RatingDisplay } from '../../components/ui/StarRating'
import api from '../../services/api'
import { CATEGORIES, formatCurrency } from '../../utils/constants'

export default function BookingFlowPage() {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    serviceCategory: '',
    serviceDescription: '',
    bookingType: 'instant',
    scheduledAt: '',
    serviceLocation: { address: '', city: '', area: '', pincode: '', landmark: '' },
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get(`/providers/${providerId}`)
      .then(({ data }) => setProvider(data.provider))
      .catch(() => toast.error('Provider not found'))
      .finally(() => setLoading(false))
  }, [providerId])

  const validate = () => {
    const e = {}
    if (!form.serviceCategory) e.serviceCategory = 'Please select a service'
    if (!form.serviceDescription.trim()) e.serviceDescription = 'Please describe what you need'
    if (form.bookingType === 'scheduled' && !form.scheduledAt) e.scheduledAt = 'Please select a date and time'
    if (!form.serviceLocation.address.trim()) e.address = 'Address is required'
    if (!form.serviceLocation.city.trim()) e.city = 'City is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/bookings', {
        providerId,
        ...form,
        estimatedAmount: provider.pricing?.visitingCharge || 0,
      })
      toast.success('Booking request sent successfully!')
      navigate(`/customer/bookings/${data.booking._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardLayout role="customer"><SectionLoader /></DashboardLayout>
  if (!provider) return <DashboardLayout role="customer"><ErrorState message="Provider not found" /></DashboardLayout>

  const provUser = provider.userId || {}
  const providerCategories = provider.serviceCategories || []

  return (
    <DashboardLayout role="customer">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Book Service</h1>

        {/* Provider summary */}
        <div className="card card-body mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={provUser.name} size="lg" />
            <div>
              <p className="font-bold text-text-primary">{provUser.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RatingDisplay rating={provider.rating} count={provider.totalReviews} size="sm" />
              </div>
              <p className="text-xs text-text-muted mt-1">{provider.location?.city} · Starting from {formatCurrency(provider.pricing?.visitingCharge)}</p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step >= s ? 'bg-brand-navy text-white' : 'bg-surface-secondary text-text-muted'}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <div className={`h-0.5 flex-1 ${s < 3 ? (step > s ? 'bg-brand-aqua-dark' : 'bg-surface-secondary') : 'hidden'} transition-all`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted -mt-5 mb-6 px-1">
          <span>Select Service</span><span>Service Details</span><span>Location</span>
        </div>

        {/* Step 1: Select service */}
        {step === 1 && (
          <div className="card card-body space-y-5 animate-fade-in">
            <div>
              <label className="form-label">Service Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {providerCategories.map((cat) => {
                  const catInfo = CATEGORIES.find((c) => c.key === cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, serviceCategory: cat })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${form.serviceCategory === cat ? 'border-brand-aqua-dark bg-brand-aqua/10' : 'border-brand-peach-warm hover:border-brand-aqua/50'}`}
                    >
                      <p className="font-semibold text-text-primary capitalize text-sm">{catInfo?.label || cat}</p>
                      <p className="text-xs text-text-muted mt-0.5">{catInfo?.description || ''}</p>
                    </button>
                  )
                })}
              </div>
              {errors.serviceCategory && <p className="form-error">{errors.serviceCategory}</p>}
            </div>

            <div>
              <label className="form-label">Booking Type *</label>
              <div className="flex gap-3">
                {[{ val: 'instant', label: 'Instant', desc: 'ASAP', icon: Clock }, { val: 'scheduled', label: 'Schedule', desc: 'Pick a time', icon: Calendar }].map(({ val, label, desc, icon: Icon }) => (
                  <button key={val} type="button" onClick={() => setForm({ ...form, bookingType: val })} className={`flex-1 p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${form.bookingType === val ? 'border-brand-aqua-dark bg-brand-aqua/10' : 'border-brand-peach-warm hover:border-brand-aqua/50'}`}>
                    <Icon className="w-5 h-5 text-brand-aqua-dark flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-text-primary">{label}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.bookingType === 'scheduled' && (
              <div>
                <label className="form-label">Preferred Date & Time *</label>
                <input type="datetime-local" className={`form-input ${errors.scheduledAt ? 'form-input-error' : ''}`} min={new Date().toISOString().slice(0, 16)} value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
                {errors.scheduledAt && <p className="form-error">{errors.scheduledAt}</p>}
              </div>
            )}

            <button onClick={() => { if (!form.serviceCategory) { setErrors({ ...errors, serviceCategory: 'Please select a service' }); return } setStep(2) }} className="btn-primary w-full py-3">
              Next: Service Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="card card-body space-y-5 animate-fade-in">
            <div>
              <label className="form-label" htmlFor="booking-desc">Describe your requirement *</label>
              <textarea
                id="booking-desc"
                className={`form-textarea ${errors.serviceDescription ? 'form-input-error' : ''}`}
                rows={5}
                placeholder="E.g. Two power sockets not working in the living room and need a ceiling fan installed in the bedroom..."
                value={form.serviceDescription}
                onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
              />
              {errors.serviceDescription && <p className="form-error">{errors.serviceDescription}</p>}
              <p className="text-xs text-text-muted mt-1">{form.serviceDescription.length}/1000 characters</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
              <button onClick={() => { if (!form.serviceDescription.trim()) { setErrors({ ...errors, serviceDescription: 'Please describe what you need' }); return } setStep(3) }} className="btn-primary flex-1 py-3">
                Next: Location <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="card card-body space-y-4 animate-fade-in">
            <div>
              <label className="form-label" htmlFor="booking-address">Full Address *</label>
              <input id="booking-address" type="text" className={`form-input ${errors.address ? 'form-input-error' : ''}`} placeholder="Flat/House No., Building name, Street" value={form.serviceLocation.address} onChange={(e) => setForm({ ...form, serviceLocation: { ...form.serviceLocation, address: e.target.value } })} />
              {errors.address && <p className="form-error">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="booking-city">City *</label>
                <input id="booking-city" type="text" className={`form-input ${errors.city ? 'form-input-error' : ''}`} placeholder="e.g. Mumbai" value={form.serviceLocation.city} onChange={(e) => setForm({ ...form, serviceLocation: { ...form.serviceLocation, city: e.target.value } })} />
                {errors.city && <p className="form-error">{errors.city}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="booking-area">Area</label>
                <input id="booking-area" type="text" className="form-input" placeholder="e.g. Andheri West" value={form.serviceLocation.area} onChange={(e) => setForm({ ...form, serviceLocation: { ...form.serviceLocation, area: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="booking-pin">Pincode</label>
                <input id="booking-pin" type="text" className="form-input" placeholder="400001" value={form.serviceLocation.pincode} onChange={(e) => setForm({ ...form, serviceLocation: { ...form.serviceLocation, pincode: e.target.value } })} />
              </div>
              <div>
                <label className="form-label" htmlFor="booking-landmark">Landmark</label>
                <input id="booking-landmark" type="text" className="form-input" placeholder="Near..." value={form.serviceLocation.landmark} onChange={(e) => setForm({ ...form, serviceLocation: { ...form.serviceLocation, landmark: e.target.value } })} />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-brand-cream-y rounded-xl p-4 mt-2">
              <p className="text-sm font-semibold text-text-primary mb-2">Booking Summary</p>
              <div className="space-y-1.5 text-sm text-text-secondary">
                <div className="flex justify-between"><span>Service</span><span className="capitalize font-medium">{form.serviceCategory}</span></div>
                <div className="flex justify-between"><span>Type</span><span className="font-medium capitalize">{form.bookingType}</span></div>
                <div className="flex justify-between"><span>Visiting Charge</span><span className="font-bold text-text-primary">{formatCurrency(provider.pricing?.visitingCharge)}</span></div>
              </div>
              <p className="text-xs text-text-muted mt-2">* Additional charges may apply based on work done.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3">
                {submitting ? <Spinner size="sm" /> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
