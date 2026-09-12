import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/Layout'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { RatingDisplay } from '../../components/ui/StarRating'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/constants'
import { Shield, CheckCircle, XCircle, Eye, ChevronDown, FileText, X } from 'lucide-react'

// Static class maps — avoids unsafe dynamic Tailwind class generation
const VERIFICATION_BADGE = {
  pending:      'badge bg-amber-50 text-amber-700',
  under_review: 'badge bg-blue-50 text-blue-700',
  approved:     'badge bg-emerald-50 text-emerald-700',
  rejected:     'badge bg-red-50 text-red-700',
}
const FILTER_ACTIVE   = 'bg-brand-navy text-white'
const FILTER_INACTIVE = 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [actioning, setActioning] = useState(false)

  const fetchProviders = async (status = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (status) params.set('status', status)
      const { data } = await api.get(`/admin/providers?${params}`)
      setProviders(data.providers || [])
      setTotal(data.total || 0)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchProviders() }, [])

  const handleVerify = async (id, status) => {
    setActioning(true)
    try {
      await api.patch(`/admin/providers/${id}/verify`, { status, note })
      toast.success(`Provider ${status}`)
      setSelected(null)
      setNote('')
      fetchProviders()
    } catch { toast.error('Action failed') } finally { setActioning(false) }
  }

  const verificationColors = { pending: 'amber', under_review: 'blue', approved: 'emerald', rejected: 'red' }

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Provider Verification</h1>
          <p className="text-text-muted text-sm mt-1">{total} providers</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {['', 'pending', 'under_review', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); fetchProviders(s) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? FILTER_ACTIVE : FILTER_INACTIVE}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? <SectionLoader /> : providers.length === 0 ? (
        <EmptyState title="No providers found" icon={Shield} />
      ) : (
        <div className="space-y-3">
          {providers.map((p) => {
            const u = p.userId || {}
            const vc = verificationColors[p.verificationStatus] || 'gray'
            return (
              <div key={p._id} className="card card-body flex flex-col md:flex-row md:items-center gap-4">
                <Avatar name={u.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-text-primary">{u.name}</p>
                    <span className={`${VERIFICATION_BADGE[p.verificationStatus] || 'badge bg-gray-100 text-gray-600'} capitalize`}>{p.verificationStatus?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-text-muted">{u.email} · {u.phone}</p>
                  <p className="text-xs text-text-muted mt-0.5 capitalize">{p.serviceCategories?.join(', ')} · {p.location?.city}</p>
                  {p.documents?.length > 0 && <p className="text-xs text-brand-aqua-deep mt-0.5 flex items-center gap-1"><FileText className="w-3 h-3" />{p.documents.length} document(s) uploaded</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelected(p); setNote(p.verificationNote || '') }} className="btn-ghost text-sm py-1.5 px-3">
                    <Eye className="w-4 h-4" /> Review
                  </button>
                  {p.verificationStatus !== 'approved' && (
                    <button onClick={() => handleVerify(p._id, 'approved')} className="btn-primary text-sm py-1.5 px-3">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  )}
                  {p.verificationStatus !== 'rejected' && (
                    <button onClick={() => setSelected({ ...p, rejecting: true })} className="btn-danger text-sm py-1.5 px-3">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card card-body w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">{selected.rejecting ? 'Reject Provider' : 'Provider Details'}</h3>
              <button onClick={() => { setSelected(null); setNote('') }} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            {!selected.rejecting && (
              <div className="space-y-3 mb-4">
                <p className="text-sm"><span className="font-semibold">Name:</span> {selected.userId?.name}</p>
                <p className="text-sm"><span className="font-semibold">Services:</span> {selected.serviceCategories?.join(', ')}</p>
                <p className="text-sm"><span className="font-semibold">Experience:</span> {selected.experience} years</p>
                <p className="text-sm"><span className="font-semibold">Location:</span> {selected.location?.city}, {selected.location?.state}</p>
                <p className="text-sm"><span className="font-semibold">Documents:</span> {selected.documents?.length || 0} uploaded</p>
              </div>
            )}
            <div className="mb-4">
              <label className="form-label">{selected.rejecting ? 'Rejection Reason *' : 'Note (optional)'}</label>
              <textarea className="form-textarea" rows={3} placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              {selected.rejecting ? (
                <>
                  <button onClick={() => { setSelected(null); setNote('') }} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={() => handleVerify(selected._id, 'rejected')} disabled={actioning} className="btn-danger flex-1 justify-center">
                    {actioning ? <Spinner size="sm" /> : 'Confirm Reject'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleVerify(selected._id, 'under_review')} disabled={actioning} className="btn-secondary flex-1">Mark Under Review</button>
                  <button onClick={() => handleVerify(selected._id, 'approved')} disabled={actioning} className="btn-primary flex-1 justify-center">
                    {actioning ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
