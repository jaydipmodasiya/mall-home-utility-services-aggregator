import { AlertCircle, CheckCircle, DollarSign, FileText, MapPin, Save, Upload, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../../components/layout/Layout'
import { DropdownSelect } from '../../components/ui/DropdownSelect'
import { SectionLoader, Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { CATEGORIES } from '../../utils/constants'

export default function ProviderProfileEditPage() {
  const { user, updateUser } = useAuth()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const [docType, setDocType] = useState('identity')

  const [form, setForm] = useState({
    bio: '', serviceCategories: [], skills: '', experience: 0,
    pricing: { hourlyRate: 0, visitingCharge: 0 },
    location: { city: '', area: '', state: '', pincode: '' },
  })
  const [userForm, setUserForm] = useState({ name: user?.name || '', phone: user?.phone || '' })

  useEffect(() => {
    api.get('/providers/me').then(({ data }) => {
      const p = data.provider
      setProvider(p)
      setForm({
        bio: p.bio || '',
        serviceCategories: p.serviceCategories || [],
        skills: (p.skills || []).join(', '),
        experience: p.experience || 0,
        pricing: p.pricing || { hourlyRate: 0, visitingCharge: 0 },
        location: p.location || { city: '', area: '', state: '', pincode: '' },
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      serviceCategories: f.serviceCategories.includes(cat)
        ? f.serviceCategories.filter((c) => c !== cat)
        : [...f.serviceCategories, cat],
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await Promise.all([
        api.patch('/providers/me', { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
        api.patch('/auth/me', userForm),
      ])
      updateUser(userForm)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save profile') }
    finally { setSaving(false) }
  }

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('document', file)
    fd.append('type', docType)
    try {
      await api.post('/providers/me/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded! Admin will review shortly.')
      const { data } = await api.get('/providers/me')
      setProvider(data.provider)
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  if (loading) return <DashboardLayout role="provider"><SectionLoader /></DashboardLayout>

  const VERIFICATION_BANNER = {
    pending:      'card card-body mb-6 border-l-4 border-amber-400 bg-amber-50',
    under_review: 'card card-body mb-6 border-l-4 border-blue-400 bg-blue-50',
    approved:     'card card-body mb-6 border-l-4 border-emerald-400 bg-emerald-50',
    rejected:     'card card-body mb-6 border-l-4 border-red-400 bg-red-50',
  }

  return (
    <DashboardLayout role="provider">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Profile & Verification</h1>

      {/* Verification Status */}
      <div className={VERIFICATION_BANNER[provider?.verificationStatus] || 'card card-body mb-6 border-l-4 border-gray-300 bg-gray-50'}>
        <div className="flex items-center gap-3">
          {provider?.verificationStatus === 'approved'
            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
            : <AlertCircle className="w-5 h-5 text-amber-500" />}
          <div>
            <p className="font-bold text-text-primary capitalize">Verification: {provider?.verificationStatus?.replace('_', ' ')}</p>
            {provider?.verificationNote && <p className="text-sm text-text-muted">{provider.verificationNote}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="card card-body">
          <h2 className="font-bold text-text-primary mb-4">Basic Information</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="text" className="form-input pl-10" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" rows={3} placeholder="Describe your experience and expertise..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Years of Experience</label>
              <input type="number" className="form-input w-32" min={0} max={50} value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} />
            </div>

            <div>
              <label className="form-label">Service Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => toggleCategory(key)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${form.serviceCategories.includes(key) ? 'border-brand-aqua-dark bg-brand-aqua/10 text-brand-navy' : 'border-brand-peach-warm text-text-muted hover:border-brand-aqua/50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Skills (comma-separated)</label>
              <input type="text" className="form-input" placeholder="e.g. Wiring, Fan Installation, MCB" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Visiting Charge (₹)</label>
                <div className="relative"><DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="number" className="form-input pl-9" value={form.pricing.visitingCharge} onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, visitingCharge: Number(e.target.value) } })} /></div>
              </div>
              <div>
                <label className="form-label">Hourly Rate (₹/hr)</label>
                <div className="relative"><DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="number" className="form-input pl-9" value={form.pricing.hourlyRate} onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, hourlyRate: Number(e.target.value) } })} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">City</label>
                <div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" /><input type="text" className="form-input pl-9" placeholder="Mumbai" value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} /></div>
              </div>
              <div>
                <label className="form-label">Area</label>
                <input type="text" className="form-input" placeholder="Andheri West" value={form.location.area} onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
              </div>
              <div>
                <label className="form-label">State</label>
                <input type="text" className="form-input" placeholder="Maharashtra" value={form.location.state} onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
              </div>
              <div>
                <label className="form-label">Pincode</label>
                <input type="text" className="form-input" placeholder="400001" value={form.location.pincode} onChange={(e) => setForm({ ...form, location: { ...form.location, pincode: e.target.value } })} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* Document Upload */}
        <div className="card card-body">
          <h2 className="font-bold text-text-primary mb-4">Verification Documents</h2>
          <p className="text-sm text-text-muted mb-4">Upload your Aadhaar, PAN, or skill certificates for admin verification. Max 5MB. PDF, JPG or PNG.</p>

          <div className="flex gap-3 mb-4">
            <DropdownSelect className="flex-1" value={docType} onChange={setDocType} label="Document type" options={[{ value: 'identity', label: 'Identity Document (Aadhaar/PAN)' }, { value: 'skill_certificate', label: 'Skill Certificate' }, { value: 'other', label: 'Other' }]} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary">
              {uploading ? <Spinner size="sm" /> : <><Upload className="w-4 h-4" /> Upload</>}
            </button>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleDocUpload} />
          </div>

          {/* Existing docs */}
          {provider?.documents?.length > 0 ? (
            <div className="space-y-2">
              {provider.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-brand-cream-y rounded-xl">
                  <FileText className="w-5 h-5 text-brand-coral flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{doc.originalName}</p>
                    <p className="text-xs text-text-muted capitalize">{doc.type}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
