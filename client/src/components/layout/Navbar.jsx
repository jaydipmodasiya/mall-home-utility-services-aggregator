import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Zap, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ variant = 'dark' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const isLight = variant === 'light'

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

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
