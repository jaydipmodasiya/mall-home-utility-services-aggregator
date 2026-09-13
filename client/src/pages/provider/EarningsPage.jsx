import { Briefcase, Calendar, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/Layout'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'

export default function EarningsPage() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/providers/me'),
      api.get('/bookings/provider?status=completed&limit=50'),
    ]).then(([pRes, jRes]) => {
      setProfile(pRes.data.provider)
      setJobs(jRes.data.bookings || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="provider"><SectionLoader /></DashboardLayout>

  const thisMonth = jobs.filter((j) => new Date(j.completedAt || j.updatedAt).getMonth() === new Date().getMonth())
  const thisMonthEarnings = thisMonth.reduce((sum, j) => sum + (j.finalAmount || j.estimatedAmount || 0), 0)

  return (
    <DashboardLayout role="provider">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: formatCurrency(profile?.totalEarnings || 0), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'This Month', value: formatCurrency(thisMonthEarnings), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Completed Jobs', value: profile?.completedJobs || 0, icon: Briefcase, color: 'bg-brand-mint text-text-primary' },
          { label: 'This Month Jobs', value: thisMonth.length, icon: Calendar, color: 'bg-brand-cream-y text-text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card card-body">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Earnings table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-brand-peach-warm/60">
          <h2 className="font-bold text-text-primary text-lg">Completed Jobs</h2>
          <span className="text-sm text-text-muted">{jobs.length} jobs</span>
        </div>
        {jobs.length === 0 ? (
          <EmptyState title="No completed jobs yet" message="Complete your first job to see earnings here." icon={DollarSign} />
        ) : (
          <div className="divide-y divide-brand-peach-warm/50">
            {jobs.map((j) => (
              <div key={j._id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm capitalize">{j.serviceCategory}</p>
                  <p className="text-xs text-text-muted">{j.customerId?.name} · {formatDate(j.completedAt || j.updatedAt)}</p>
                </div>
                <span className="font-bold text-emerald-600">{formatCurrency(j.finalAmount || j.estimatedAmount || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
