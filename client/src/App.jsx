import { ArrowLeft, Check, Home, RotateCcw, Terminal } from 'lucide-react'
import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { PageLoader } from './components/ui/Spinner'
import { useAuth } from './context/AuthContext'

// Public pages
import LandingPage from './pages/LandingPage'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer pages
import BookingDetailPage from './pages/customer/BookingDetailPage'
import BookingFlowPage from './pages/customer/BookingFlowPage'
import BookingsListPage from './pages/customer/BookingsListPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerProfilePage from './pages/customer/CustomerProfilePage'
import ProviderProfilePage from './pages/customer/ProviderProfilePage'
import ProviderSearchPage from './pages/customer/ProviderSearchPage'
import ServiceHistoryPage from './pages/customer/ServiceHistoryPage'

// Provider pages
import AvailabilityPage from './pages/provider/AvailabilityPage'
import EarningsPage from './pages/provider/EarningsPage'
import JobDetailPage from './pages/provider/JobDetailPage'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import ProviderJobsPage from './pages/provider/ProviderJobsPage'
import ProviderProfileEditPage from './pages/provider/ProviderProfileEditPage'

// Admin pages
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDisputesPage from './pages/admin/AdminDisputesPage'
import AdminProvidersPage from './pages/admin/AdminProvidersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'

function NotFound() {
  const [fixed, setFixed] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const nodes = ['client', 'router', 'api', 'missing']

  const resetRoute = () => {
    setFixed(false)
    setSelectedNode(null)
  }

  return (
    <PublicLayout navVariant="light">
      <div className="route-error-shell">
        <div className="page-container flex min-h-[calc(100vh-16rem)] items-center justify-center py-12 md:py-16">
          <div className="route-error-panel w-full max-w-4xl">
            <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-aqua/50 bg-white/70 px-3 py-1.5 font-mono text-xs text-brand-navy"><Terminal className="h-3.5 w-3.5" /> route_status: 404</div>
                <p className="text-7xl font-display font-extrabold leading-none text-brand-navy md:text-8xl" aria-hidden="true">404</p>
                <h1 className="mt-4 text-3xl font-display font-bold text-text-primary md:text-4xl">Looks like this route took a wrong turn.</h1>
                <p className="mt-4 font-mono text-xs text-brand-navy/70">Nothing is broken in the matrix - this route just doesn't exist.</p>
                <p className="mt-3 max-w-md text-sm text-text-muted">Try the quick route repair, or use one of the links below to get back to trusted local services.</p>
              </div>
              <div className="route-debugger" aria-label="Optional route repair mini-game">
                <div className="mb-4 flex items-center justify-between font-mono text-xs text-text-muted"><span>fix_route.sh</span><button type="button" onClick={resetRoute} className="btn-ghost p-1.5" aria-label="Reset route repair"><RotateCcw className="h-3.5 w-3.5" /></button></div>
                <div className="route-map" role="group" aria-label="Choose the broken route node">
                  {nodes.map((node, index) => (
                    <div key={node} className="flex min-w-0 flex-1 items-center">
                      <button type="button" className={`route-node ${selectedNode === node ? 'route-node-selected' : ''} ${fixed ? 'route-node-fixed' : ''}`} onClick={() => { setSelectedNode(node); if (node === 'missing') setFixed(true) }} aria-label={`Inspect ${node} route node`}>
                        {fixed || selectedNode === node ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                      </button>
                      {index < nodes.length - 1 && <span className={`route-line ${fixed ? 'route-line-fixed' : ''}`} aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                <p className="mt-4 min-h-5 font-mono text-xs text-brand-navy/70">{fixed ? 'Route fixed. Nice debugging.' : selectedNode ? `${selectedNode} checked - inspect the broken node.` : 'Optional: click the node with the broken link.'}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
              <Link to="/" className="btn-navy"><Home className="h-4 w-4" aria-hidden="true" /> Back to Home</Link>
              <Link to="/services" className="btn-secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse Services</Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/providers" element={<ProviderSearchPage />} />
      <Route path="/provider-profile/:id" element={<ProviderProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute roles={['customer']}><BookingsListPage /></ProtectedRoute>} />
      <Route path="/customer/bookings/:id" element={<ProtectedRoute roles={['customer']}><BookingDetailPage /></ProtectedRoute>} />
      <Route path="/customer/book/:providerId" element={<ProtectedRoute roles={['customer']}><BookingFlowPage /></ProtectedRoute>} />
      <Route path="/customer/history" element={<ProtectedRoute roles={['customer']}><ServiceHistoryPage /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfilePage /></ProtectedRoute>} />

      {/* Provider */}
      <Route path="/provider/dashboard" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/jobs" element={<ProtectedRoute roles={['provider']}><ProviderJobsPage /></ProtectedRoute>} />
      <Route path="/provider/jobs/:id" element={<ProtectedRoute roles={['provider']}><JobDetailPage /></ProtectedRoute>} />
      <Route path="/provider/availability" element={<ProtectedRoute roles={['provider']}><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/provider/earnings" element={<ProtectedRoute roles={['provider']}><EarningsPage /></ProtectedRoute>} />
      <Route path="/provider/profile" element={<ProtectedRoute roles={['provider']}><ProviderProfileEditPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/providers" element={<ProtectedRoute roles={['admin']}><AdminProvidersPage /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookingsPage /></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute roles={['admin']}><AdminDisputesPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
