import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../components/layout/Layout'
import { SectionLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'
import { Briefcase, DollarSign, Star, Clock, ChevronRight, AlertCircle, CheckCircle, ArrowRight, Bell } from 'lucide-react'

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/providers/me'),
      api.get('/bookings/provider?limit=10'),
    ])
      .then(([pRes, jRes]) => {
        setProfile(pRes.data.provider)
        setJobs(jRes.data.bookings || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="provider"><SectionLoader /></DashboardLayout>

  const pendingJobs  = jobs.filter((j) => j.status === 'pending')
  const activeJobs   = jobs.filter((j) => ['assigned', 'in_progress'].includes(j.status))
  const vs           = profile?.verificationStatus || 'pending'
  const isApproved   = vs === 'approved'

  return (
    <DashboardLayout role="provider">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">Provider Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome, {user?.name?.split(' ')[0]}</p>
      </div>

      {/* Verification alert */}
      {!isApproved && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${vs === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${vs === 'rejected' ? 'text-red-400' : 'text-amber-500'}`} />
          <div className="flex-1">
            <p className={`font-semibold text-sm ${vs === 'rejected' ? 'text-red-700' : 'text-amber-800'}`}>
              {vs === 'pending'      ? 'Verification pending — upload documents to get verified'
               : vs === 'under_review' ? 'Your documents are under review (1–2 business days)'
               : `Verification rejected: ${profile?.verificationNote || 'Documents did not meet requirements'}`}
            </p>
            {vs !== 'under_review' && (
              <Link to="/provider/profile" className="text-xs font-bold text-amber-700 mt-1 inline-block hover:underline">
                Upload Documents →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* New requests highlight */}
      {pendingJobs.length > 0 && (
        <div className="bg-brand-navy rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-aqua" />
              <p className="font-bold text-white text-sm">
                {pendingJobs.length} new request{pendingJobs.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/provider/jobs" className="text-xs font-semibold text-brand-aqua hover:text-white transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingJobs.slice(0, 2).map((j) => (
              <Link key={j._id} to={`/provider/jobs/${j._id}`} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white capitalize">{j.serviceCategory}</p>
                  <p className="text-xs text-text-onDark/60">{j.serviceLocation?.city} · {j.bookingType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brand-aqua">{formatCurrency(j.estimatedAmount)}</span>
                  <ChevronRight className="w-4 h-4 text-text-onDark/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Earnings', value: formatCurrency(profile?.totalEarnings || 0), sub: 'Lifetime', color: 'text-emerald-600' },
          { label: 'Completed Jobs', value: profile?.completedJobs || 0, sub: 'All time', color: 'text-text-primary' },
          { label: 'Active Jobs', value: activeJobs.length, sub: 'Right now', color: 'text-brand-aqua-deep' },
          { label: 'Rating', value: profile?.rating ? `${Number(profile.rating).toFixed(1)}` : '—', sub: `${profile?.totalReviews || 0} reviews`, color: 'text-amber-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-peach-warm/60 p-4">
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">{label}</p>
            <p className="text-xs text-text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/provider/jobs', label: 'View All Jobs', icon: Briefcase },
          { to: '/provider/availability', label: 'Availability', icon: Clock },
          { to: '/provider/earnings', label: 'Earnings', icon: DollarSign },
          { to: '/provider/profile', label: 'Edit Profile', icon: CheckCircle },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-brand-peach-warm/60 hover:border-brand-aqua/40 hover:shadow-card transition-all text-center">
            <div className="w-9 h-9 rounded-lg bg-surface-tertiary flex items-center justify-center">
              <Icon className="w-4 h-4 text-brand-aqua-dark" />
            </div>
            <span className="text-xs font-semibold text-text-secondary leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-text-primary">Recent Jobs</h2>
          <Link to="/provider/jobs" className="text-xs font-semibold text-brand-coral hover:text-brand-coral-dark flex items-center gap-1">
            All jobs <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-peach-warm/60 p-8 text-center">
            <p className="text-text-muted text-sm">No job requests yet. Complete your profile to start receiving jobs.</p>
            <Link to="/provider/profile" className="btn-primary text-sm mt-4 inline-flex">Complete Profile <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-brand-peach-warm/60 divide-y divide-brand-peach-warm/40">
            {jobs.slice(0, 5).map((j) => (
              <Link key={j._id} to={`/provider/jobs/${j._id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-secondary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary text-sm capitalize">{j.serviceCategory}</p>
                    <StatusBadge status={j.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{j.serviceDescription}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-light flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
