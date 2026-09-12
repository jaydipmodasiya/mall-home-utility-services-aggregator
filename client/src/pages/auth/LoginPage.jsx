import { ArrowRight, Eye, EyeOff, Lock, Mail, Zap } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/Layout'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || null

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const dest = from || (user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      const message = err.response?.status === 401
        ? 'Invalid email or password.'
        : (err.response?.data?.message || 'Login failed. Please try again.')
      toast.error(message)
    } finally { setLoading(false) }
  }

  const fillDemo = (role) => {
    const demos = {
      customer: { email: 'priya@example.com', password: 'Test@1234' },
      provider: { email: 'ravi@example.com', password: 'Test@1234' },
      admin:    { email: 'admin@mallutility.in', password: 'Admin@1234' },
    }
    setForm(demos[role])
    setErrors({})
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-aqua" fill="currentColor" />
              </div>
              <span className="text-xl font-display font-bold text-text-primary">
                Mall &amp; Home Utility Services <span className="text-brand-aqua-deep">Aggregator</span>
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-text-primary">Sign in</h1>
            <p className="text-text-muted text-sm mt-1">Welcome back to Mall &amp; Home Utility Services Aggregator</p>
          </div>

          {/* Demo credential pills */}
          <div className="mb-5">
            <p className="text-xs text-text-muted text-center mb-2">Try with demo credentials</p>
            <div className="flex gap-2">
              {['customer', 'provider', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  type="button"
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-tertiary border border-brand-peach-warm hover:border-brand-aqua hover:text-brand-aqua-deep text-text-secondary transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-brand-peach-warm/60 shadow-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="form-label" htmlFor="login-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={`form-input pl-10 ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-input pl-10 pr-10 ${errors.password ? 'form-input-error' : ''}`}
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn-primary w-full py-2.5 text-sm justify-center mt-2"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-text-muted mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-coral hover:text-brand-coral-dark">Create one</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
