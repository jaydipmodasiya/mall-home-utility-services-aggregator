import { Lock, Mail, Phone, Save, User } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { Spinner } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || { street: '', city: '', state: '', pincode: '' } })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/me', form)
      updateUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    setChangingPw(true)
    try {
      await api.patch('/auth/change-password', pwForm)
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    finally { setChangingPw(false) }
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="md:col-span-1">
          <div className="card card-body flex flex-col items-center text-center">
            <Avatar name={user?.name} size="xl" className="mb-4" />
            <h2 className="font-bold text-text-primary text-lg">{user?.name}</h2>
            <p className="text-text-muted text-sm">{user?.email}</p>
                  <span className="badge-peach mt-2 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Profile form */}
        <div className="md:col-span-2 space-y-5">
          <div className="card card-body">
            <h2 className="font-bold text-text-primary mb-4">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="profile-name" type="text" className="form-input pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input type="email" className="form-input pl-10 bg-brand-cream-y" value={user?.email} disabled />
                </div>
                <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="form-label" htmlFor="profile-phone">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="profile-phone" type="tel" className="form-input pl-10" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="profile-city">City</label>
                  <input id="profile-city" type="text" className="form-input" placeholder="Mumbai" value={form.address?.city || ''} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                </div>
                <div>
                  <label className="form-label" htmlFor="profile-state">State</label>
                  <input id="profile-state" type="text" className="form-input" placeholder="Maharashtra" value={form.address?.state || ''} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card card-body">
            <h2 className="font-bold text-text-primary mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="cur-password">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="cur-password" type="password" className="form-input pl-10" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input id="new-password" type="password" className="form-input pl-10" placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-secondary" disabled={changingPw}>
                {changingPw ? <Spinner size="sm" /> : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
