import { Edit2, Save, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../../components/layout/Layout'
import { Spinner } from '../../components/ui/Spinner'
import api from '../../services/api'
import { formatCurrency } from '../../utils/constants'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')
      setCategories(data.categories || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load categories. Please try again.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleSave = async () => {
    if (!editing?._id) return

    setSaving(true)
    try {
      await api.patch(`/admin/categories/${editing._id}`, editing)
      toast.success('Category updated!')
      setEditing(null)
      fetch()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to update category. Please try again.')
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Categories</h1>
          <p className="text-text-muted text-sm mt-1">The system maintains five fixed categories for service matching.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card card-body group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-peach-warm flex items-center justify-center">
                  <Tag className="w-5 h-5 text-brand-navy-mid" />
                </div>
                <button onClick={() => setEditing({ ...cat })} className="btn-ghost p-1.5 opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-1">{cat.displayName}</h3>
              <p className="text-sm text-text-muted mb-3">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Base price</span>
                <span className="font-bold text-brand-coral-dark">{formatCurrency(cat.basePrice)}</span>
              </div>
              {cat.pricingGuideline && <p className="text-xs text-text-muted mt-2 italic">{cat.pricingGuideline}</p>}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="card card-body w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-text-primary">Edit Category</h3>
              <button onClick={() => setEditing(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="form-label">Category</label>
                <input className="form-input bg-surface-secondary" value={editing.displayName} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Base Price (₹)</label>
                <input type="number" className="form-input" value={editing.basePrice} onChange={(e) => setEditing({ ...editing, basePrice: Number(e.target.value) })} />
              </div>
              <div>
                <label className="form-label">Pricing Guideline</label>
                <input className="form-input" placeholder="Starting from ₹X..." value={editing.pricingGuideline} onChange={(e) => setEditing({ ...editing, pricingGuideline: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
