import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import {
  LayoutDashboard, Calendar, History, User, Star,
  Briefcase, Clock, DollarSign, FileCheck,
  Users, Shield, BarChart2, AlertTriangle, Tag, LogOut
} from 'lucide-react'

const customerLinks = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/bookings', icon: Calendar, label: 'My Bookings' },
  { to: '/customer/history', icon: History, label: 'History' },
  { to: '/customer/profile', icon: User, label: 'Profile' },
]

const providerLinks = [
  { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/provider/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/provider/availability', icon: Clock, label: 'Availability' },
  { to: '/provider/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/provider/profile', icon: FileCheck, label: 'Profile & Docs' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/providers', icon: Shield, label: 'Verification' },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
]

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = role === 'admin' ? adminLinks : role === 'provider' ? providerLinks : customerLinks

  const handleLogout = () => { logout(); navigate('/') }

  const roleLabel = { customer: 'Customer', provider: 'Provider', admin: 'Admin' }[role] || role

  return (
    <div className="dashboard-sidebar fixed top-0 left-0 h-full flex flex-col z-40 pt-16">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-brand-peach-warm/60">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted">{roleLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-aqua/15 text-brand-aqua-deep border-l-[3px] border-brand-aqua pl-[10px]'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-brand-peach-warm/60 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
