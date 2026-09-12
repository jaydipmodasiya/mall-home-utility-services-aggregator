import { AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../../components/layout/Layout'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import api from '../../services/api'
import { formatDate } from '../../utils/constants'

// Static class maps — avoids unsafe dynamic Tailwind class generation
const DISPUTE_STATUS_ICON_BG   = { open: 'bg-red-50',     under_review: 'bg-blue-50',   resolved: 'bg-emerald-50', closed: 'bg-gray-100' }
const DISPUTE_STATUS_ICON_TEXT = { open: 'text-red-500',  under_review: 'text-blue-500', resolved: 'text-emerald-500', closed: 'text-gray-400' }
const DISPUTE_STATUS_BADGE     = { open: 'badge bg-red-50 text-red-700', under_review: 'badge bg-blue-50 text-blue-700', resolved: 'badge bg-emerald-50 text-emerald-700', closed: 'badge bg-gray-100 text-gray-600' }
const FILTER_ACTIVE   = 'bg-brand-navy text-white'
const FILTER_INACTIVE = 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [resolution, setResolution] = useState('')
  const [newStatus, setNewStatus] = useState('resolved')
  const [actioning, setActioning] = useState(false)

  const fetchDisputes = async (status = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (status) params.set('status', status)
      const { data } = await api.get(`/admin/disputes?${params}`)
      setDisputes(data.disputes || [])
      setTotal(data.total || 0)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchDisputes() }, [])

  const handleResolve = async () => {
    if (!resolution.trim()) { toast.error('Please provide a resolution'); return }
    setActioning(true)
    try {
      await api.patch(`/admin/disputes/${selected._id}`, { status: newStatus, resolution })
      toast.success(`Dispute ${newStatus}!`)
      setSelected(null)
      setResolution('')
      fetchDisputes()
    } catch { toast.error('Action failed') } finally { setActioning(false) }
  }

  const statusColors = { open: 'red', under_review: 'amber', resolved: 'emerald', closed: 'gray' }
  const statuses = ['', 'open', 'under_review', 'resolved', 'closed']

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dispute Management</h1>
        <p className="text-text-muted text-sm mt-1">{total} disputes · Manual resolution</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {statuses.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); fetchDisputes(s) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? FILTER_ACTIVE : FILTER_INACTIVE}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? <SectionLoader /> : disputes.length === 0 ? (
        <EmptyState title="No disputes found" message="All clear! No disputes to review." icon={AlertTriangle} />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const sc = statusColors[d.status] || 'gray'
            return (
              <div key={d._id} className="card card-body">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${DISPUTE_STATUS_ICON_BG[d.status] || 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle className={`w-5 h-5 ${DISPUTE_STATUS_ICON_TEXT[d.status] || 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-text-primary">{d.subject}</p>
                        <p className="text-xs text-text-muted mt-0.5">{d.raisedBy?.name} ({d.raisedBy?.role}) · {formatDate(d.createdAt)}</p>
                      </div>
                      <span className={`${DISPUTE_STATUS_BADGE[d.status] || 'badge bg-gray-100 text-gray-600'} capitalize flex-shrink-0`}>{d.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{d.description}</p>
                    {d.resolution && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                        <p className="text-xs font-semibold text-emerald-700">Resolution: {d.resolution}</p>
                      </div>
                    )}
                  </div>
                  {d.status === 'open' && (
                    <button onClick={() => { setSelected(d); setResolution('') }} className="btn-primary text-sm py-1.5 flex-shrink-0">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Resolve Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card card-body w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">Resolve Dispute</h3>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-brand-cream-y rounded-xl p-3 mb-4">
              <p className="text-sm font-semibold text-text-primary">{selected.subject}</p>
              <p className="text-xs text-text-muted mt-1">{selected.description}</p>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="form-label">Action</label>
                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="under_review">Mark Under Review</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Close</option>
                </select>
              </div>
              <div>
                <label className="form-label">Resolution *</label>
                <textarea className="form-textarea" rows={3} placeholder="Describe how this dispute was resolved..." value={resolution} onChange={(e) => setResolution(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleResolve} disabled={actioning} className="btn-primary flex-1 justify-center">
                {actioning ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
