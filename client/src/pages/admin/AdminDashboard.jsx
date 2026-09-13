import { AlertTriangle, Calendar, CheckCircle, ChevronRight, Shield, Star, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import api from '../../services/api'

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnalytics = () => {
    setLoading(true)
    setError(false)
    api.get('/admin/analytics')
      .then(({ data }) => setKpis(data.kpis))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAnalytics() }, [])

  if (loading) return <DashboardLayout role="admin"><SectionLoader /></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><ErrorState message="Couldn't load the admin dashboard. Please try again." onRetry={fetchAnalytics} /></DashboardLayout>

  const kpiCards = [
    { label: 'Customers',         value: kpis?.totalUsers ?? 0,          icon: Users,        bg: 'bg-brand-aqua/20', ic: 'text-brand-aqua-deep', sub: `+${kpis?.recentUsers ?? 0} this month` },
    { label: 'Total Providers',    value: kpis?.totalProviders ?? 0,       icon: Shield,       bg: 'bg-brand-mint',  ic: 'text-text-primary', sub: `${kpis?.verifiedProviders ?? 0} verified` },
    { label: 'Total Bookings',     value: kpis?.totalBookings ?? 0,        icon: Calendar,     bg: 'bg-brand-cream-y',   ic: 'text-text-primary',  sub: `${kpis?.pendingBookings ?? 0} active` },
    { label: 'Completion Rate',    value: `${kpis?.completionRate ?? 0}%`, icon: TrendingUp,   bg: 'bg-brand-mint', ic: 'text-emerald-700',sub: `${kpis?.completedBookings ?? 0} completed` },
    { label: 'Open Disputes',      value: kpis?.openDisputes ?? 0,         icon: AlertTriangle, bg: 'bg-red-50',    ic: 'text-red-500',    sub: 'Need attention', urgent: (kpis?.openDisputes > 0) },
    { label: 'Avg. Rating',        value: kpis?.avgRating ?? 0,            icon: Star,         bg: 'bg-brand-cream-y',   ic: 'text-brand-aqua-deep',  sub: 'Across all providers' },
  ]

  const pendingVerification = (kpis?.totalProviders || 0) - (kpis?.verifiedProviders || 0)

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Platform overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, bg, ic, sub, urgent }) => (
          <div key={label} className={`bg-white rounded-xl border p-4 ${urgent ? 'border-red-200' : 'border-brand-peach-warm/60'}`}>
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${ic}`} />
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">{label}</p>
            <p className="text-xs text-text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Action items */}
      <div className="bg-white rounded-xl border border-brand-peach-warm/60 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-brand-peach-warm/60">
          <h2 className="font-bold text-text-primary">Action Required</h2>
        </div>
        <div className="divide-y divide-brand-peach-warm/40">
          {pendingVerification > 0 && (
            <Link to="/admin/providers" className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary transition-colors">
              <div className="w-9 h-9 rounded-lg bg-brand-mint flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm">{pendingVerification} providers awaiting verification</p>
                <p className="text-xs text-text-muted">Review documents and approve or reject</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-light" />
            </Link>
          )}
          {(kpis?.openDisputes || 0) > 0 && (
            <Link to="/admin/disputes" className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary transition-colors">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm">{kpis?.openDisputes} open disputes</p>
                <p className="text-xs text-text-muted">Manual resolution required</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-light" />
            </Link>
          )}
          {pendingVerification === 0 && (kpis?.openDisputes || 0) === 0 && (
            <div className="px-5 py-4 flex items-center gap-3 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4" /> All caught up — no pending actions
            </div>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/admin/users', label: 'Manage Users', icon: Users },
          { to: '/admin/providers', label: 'Verify Providers', icon: Shield },
          { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
          { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-brand-peach-warm/60 hover:border-brand-aqua/40 hover:shadow-card transition-all text-center">
            <div className="w-9 h-9 rounded-lg bg-surface-tertiary flex items-center justify-center">
              <Icon className="w-4 h-4 text-brand-aqua-dark" />
            </div>
            <span className="text-xs font-semibold text-text-secondary leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}
