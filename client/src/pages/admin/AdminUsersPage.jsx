import { Search, Trash2, UserCheck, Users, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../../components/layout/Layout'
import { Avatar } from '../../components/ui/Avatar'
import { DropdownSelect } from '../../components/ui/DropdownSelect'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import api from '../../services/api'
import { formatDate } from '../../utils/constants'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState(false)

  const fetchUsers = async (s = search, r = roleFilter) => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (s) params.set('search', s)
      if (r) params.set('role', r)
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch { setError(true) } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (u) => {
    setActionId(u._id)
    try {
      await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive })
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch { toast.error('Action failed') } finally { setActionId(null) }
  }

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return
    setActionId(u._id)
    try {
      await api.delete(`/admin/users/${u._id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch { toast.error('Delete failed') } finally { setActionId(null) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-muted text-sm mt-1">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-body mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input type="text" className="form-input pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search, roleFilter)} />
        </div>
        <DropdownSelect className="min-w-[160px]" value={roleFilter} onChange={(value) => { setRoleFilter(value); fetchUsers(search, value) }} label="Role" options={[{ value: '', label: 'All Roles' }, { value: 'customer', label: 'Customers' }, { value: 'provider', label: 'Providers' }, { value: 'admin', label: 'Admins' }]} />
        <button onClick={() => fetchUsers(search, roleFilter)} className="btn-secondary">Search</button>
      </div>

      {loading ? <SectionLoader /> : error ? <ErrorState message="Couldn't load users. Please try again." onRetry={() => fetchUsers()} /> : users.length === 0 ? (
        <EmptyState title="No users found" icon={Users} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-cream-y border-b border-brand-peach-warm/60">
                <tr>
                  {['User', 'Role', 'Phone', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-peach-warm/40">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-cream-y transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="xs" />
                        <div>
                          <p className="font-semibold text-text-primary">{u.name}</p>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge capitalize ${u.role === 'admin' ? 'badge-navy' : u.role === 'provider' ? 'badge-aqua' : 'badge-peach'}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-text-muted">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(u)} disabled={actionId === u._id || u.role === 'admin'} className="p-1.5 rounded-lg hover:bg-brand-peach-warm transition-colors disabled:opacity-40" title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <UserX className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                        </button>
                        <button onClick={() => deleteUser(u)} disabled={actionId === u._id || u.role === 'admin'} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40" title="Delete user">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
