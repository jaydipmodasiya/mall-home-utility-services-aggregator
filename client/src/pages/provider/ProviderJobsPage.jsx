import { Briefcase, ChevronRight, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/Layout'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import api from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/constants'

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchJobs = (status = '') => {
    setLoading(true)
    const params = status ? `?status=${status}&limit=50` : '?limit=50'
    api.get(`/bookings/provider${params}`)
      .then(({ data }) => setJobs(data.bookings || []))
      .catch((error) => toast.error(error.response?.data?.message || 'Failed to load jobs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [])

  const statusOptions = ['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled']

  return (
    <DashboardLayout role="provider">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Job Requests</h1>
          <p className="text-text-muted text-sm mt-1">{jobs.length} jobs</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Filter className="w-4 h-4 text-text-muted" />
        {statusOptions.map((s) => (
          <button key={s} onClick={() => { setFilter(s); fetchJobs(s) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? 'bg-brand-navy text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SectionLoader /> : jobs.length === 0 ? (
        <EmptyState title="No jobs found" message="Job requests from customers will appear here." icon={Briefcase} />
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Link key={j._id} to={`/provider/jobs/${j._id}`} className="card-hover flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-text-primary capitalize text-sm">{j.serviceCategory}</p>
                  <StatusBadge status={j.status} />
                  {j.bookingType === 'instant' && <span className="badge bg-brand-peach text-text-primary text-xs">Instant</span>}
                </div>
                <p className="text-xs text-text-muted truncate">{j.serviceDescription}</p>
                <p className="text-xs text-text-muted mt-0.5">{j.customerId?.name} · {j.serviceLocation?.city} · {formatDate(j.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-primary hidden sm:block">{formatCurrency(j.estimatedAmount)}</span>
                <ChevronRight className="w-4 h-4 text-text-light" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
