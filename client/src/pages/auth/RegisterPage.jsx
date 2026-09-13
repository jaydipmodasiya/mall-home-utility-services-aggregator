import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User, Zap } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/Layout'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer'

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: defaultRole })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to Mall & Home Utility Services Aggregator, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-aqua" fill="currentColor" />
              </div>
              <span className="text-xl font-display font-bold text-text-primary">
                Mall &amp; Home Utility Services <span className="text-brand-aqua-deep">Aggregator</span>
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-text-primary">Create account</h1>
            <p className="text-text-muted text-sm mt-1">Create your Mall &amp; Home Utility Services Aggregator account</p>
          </div>

          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border border-brand-peach-warm mb-5">
            {[
              { val: 'customer', label: 'I need services' },
              { val: 'provider', label: 'I offer services' },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm({ ...form, role: val })}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  form.role === val
                    ? 'bg-brand-navy text-white'
                    : 'bg-white text-text-muted hover:bg-surface-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-brand-peach-warm/60 shadow-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="reg-name" type="text" className={`form-input pl-10 ${errors.name ? 'form-input-error' : ''}`} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="reg-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="reg-email" type="email" className={`form-input pl-10 ${errors.email ? 'form-input-error' : ''}`} placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="reg-phone" type="tel" className="form-input pl-10" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="reg-password" type={showPass ? 'text' : 'password'} className={`form-input pl-10 pr-10 ${errors.password ? 'form-input-error' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <button id="register-submit-btn" type="submit" className="btn-primary w-full py-2.5 justify-center mt-2" disabled={loading}>
                {loading ? <Spinner size="sm" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-aqua-deep hover:text-brand-navy">Sign in</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
