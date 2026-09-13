import { Bell, CheckCheck, ChevronDown, LayoutDashboard, LogOut, Menu, Search, User, X, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Avatar } from '../ui/Avatar'

export default function Navbar({ variant = 'dark' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const dropRef = useRef(null)
  const notificationRef = useRef(null)

  const isLight = variant === 'light'
  const reportNotificationFailure = (error) => {
    if (import.meta.env.DEV) console.warn('Optional notification request failed', error)
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setNotificationOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!user) return undefined
    api.get('/notifications?limit=5').then(({ data }) => {
      setNotifications(data.notifications || [])
      setUnread(data.unread || 0)
    }).catch((error) => {
      setNotifications([])
      setUnread(0)
      reportNotificationFailure(error)
    })
    return undefined
  }, [user])

  const markNotificationRead = async (notification) => {
    if (notification.readAt) return
    try {
      await api.patch(`/notifications/${notification._id}/read`)
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item))
      setUnread((count) => Math.max(0, count - 1))
    } catch (error) {
      reportNotificationFailure(error)
    }
  }

  const markAllNotificationsRead = async () => {
    if (!unread) return
    try {
      await api.patch('/notifications/read-all')
      const readAt = new Date().toISOString()
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || readAt })))
      setUnread(0)
    } catch (error) {
      reportNotificationFailure(error)
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard' : user?.role === 'provider'
    ? '/provider/dashboard' : '/customer/dashboard'

  const navLinkClass = `text-sm font-medium transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
    isLight
      ? 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
      : 'text-text-onDark/70 hover:text-white hover:bg-white/10'
  }`

  return (
    <nav className={`sticky top-0 z-50 ${isLight ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-brand-navy border-b border-white/10 shadow-nav'}`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-100' : 'bg-brand-aqua'}`}>
              <Zap className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-brand-navy'}`} fill="currentColor" />
            </div>
            <span className={`text-base font-display font-bold tracking-tight leading-tight ${isLight ? 'text-text-primary' : 'text-white'}`}>
              Mall &amp; Home
              <span className={`block text-xs font-semibold ${isLight ? 'text-text-muted' : 'text-brand-aqua/80'}`}>Utility Services</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/services" className={navLinkClass}><Zap className="w-3.5 h-3.5" /> Services</Link>
            <Link to="/providers" className={navLinkClass}><Search className="w-3.5 h-3.5" /> Find Providers</Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={dashboardPath} className={`hidden md:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100 text-text-secondary' : 'text-brand-aqua hover:bg-white/10'}`}>
                  Dashboard
                </Link>
                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropOpen(!dropOpen)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                    <Avatar name={user.name} size="xs" />
                    <span className={`hidden md:block text-sm font-medium ${isLight ? 'text-text-primary' : 'text-text-onDark'}`}>{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 hidden md:block transition-transform ${dropOpen ? 'rotate-180' : ''} ${isLight ? 'text-text-muted' : 'text-text-onDark/60'}`} />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-modal border border-brand-peach-warm/60 animate-slide-down z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-brand-peach-warm/40">
                        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to={dashboardPath} onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-secondary">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={user.role === 'customer' ? '/customer/profile' : '/provider/profile'} onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-secondary">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                      </div>
                      <div className="border-t border-brand-peach-warm/40 py-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={notificationRef}>
                  <button type="button" onClick={() => setNotificationOpen((open) => !open)} className={`relative rounded-lg p-2 transition-colors ${isLight ? 'text-text-muted hover:bg-gray-100' : 'text-text-onDark/70 hover:bg-white/10'}`} aria-label="Notifications" aria-expanded={notificationOpen}>
                    <Bell className="h-4 w-4" />
                    {unread > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-brand-coral px-1 text-center text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
                  </button>
                  {notificationOpen && <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-brand-peach-warm/60 bg-white p-3 shadow-modal">
                    <div className="flex items-center justify-between border-b border-brand-peach-warm/40 px-2 pb-2"><p className="text-sm font-bold text-text-primary">Notifications</p><button type="button" onClick={markAllNotificationsRead} disabled={!unread} className="flex items-center gap-1 text-xs font-semibold text-brand-aqua-deep disabled:cursor-not-allowed disabled:opacity-40"><CheckCheck className="h-3.5 w-3.5" /> Mark all as read</button></div>
                    <div className="max-h-72 overflow-y-auto py-1">{notifications.length ? notifications.map((notification) => <button type="button" key={notification._id} onClick={() => markNotificationRead(notification)} className={`w-full rounded-lg px-2 py-2 text-left hover:bg-surface-secondary ${notification.readAt ? '' : 'bg-brand-aqua/10'}`}><p className="text-xs font-semibold text-text-primary">{notification.title}</p><p className="mt-0.5 text-xs text-text-muted">{notification.message}</p></button>) : <p className="px-2 py-6 text-center text-xs text-text-muted">You're all caught up.</p>}</div>
                  </div>}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className={`text-sm font-medium px-3 py-1.5 transition-colors ${isLight ? 'text-text-secondary hover:text-text-primary' : 'text-text-onDark/70 hover:text-white'}`}>Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}
            <button className={`md:hidden p-2 rounded-lg transition-colors ${isLight ? 'text-text-muted hover:bg-gray-100' : 'text-text-onDark/70 hover:bg-white/10'}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden border-t py-3 animate-slide-down ${isLight ? 'border-gray-100' : 'border-white/10'}`}>
            <div className="space-y-0.5">
              <Link to="/services" className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${isLight ? 'text-text-secondary hover:bg-gray-100' : 'text-text-onDark/80 hover:bg-white/10'}`}>Services</Link>
              <Link to="/providers" className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${isLight ? 'text-text-secondary hover:bg-gray-100' : 'text-text-onDark/80 hover:bg-white/10'}`}>Find Providers</Link>
              {user && <Link to={dashboardPath} className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${isLight ? 'text-text-secondary hover:bg-gray-100' : 'text-text-onDark/80 hover:bg-white/10'}`}>Dashboard</Link>}
              {user && <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50">Sign Out</button>}
              {!user && (
                <div className="flex gap-2 pt-2 px-1">
                  <Link to="/login" className="btn-ghost flex-1 justify-center py-2.5">Sign In</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
