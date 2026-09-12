import { ArrowLeft, Home, Search } from 'lucide-react'
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
  return (
    <PublicLayout navVariant="light">
      <div className="relative isolate overflow-hidden bg-cream-section">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute left-[8%] top-16 h-24 w-24 rounded-2xl border border-brand-aqua-dark/30 rotate-12" />
          <div className="absolute right-[10%] bottom-20 h-32 w-32 rounded-full border border-brand-coral/30" />
          <div className="absolute left-1/2 top-1/4 h-px w-2/3 -translate-x-1/2 bg-brand-aqua-dark/30" />
        </div>
        <div className="page-container flex min-h-[calc(100vh-16rem)] items-center justify-center py-16">
          <div className="relative w-full max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-aqua/30 text-brand-navy shadow-card ring-8 ring-white/40">
              <Search className="h-9 w-9" aria-hidden="true" />
            </div>
            <p className="mb-3 text-7xl font-display font-extrabold leading-none text-brand-navy md:text-9xl" aria-hidden="true">404</p>
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-aqua-deep">route_status: missing</p>
            <h1 className="text-3xl font-display font-bold text-text-primary md:text-4xl">Looks like this page took a wrong turn.</h1>
            <p className="mx-auto mt-4 max-w-lg font-mono text-xs text-brand-navy/70">Nothing is broken in the matrix — this route just doesn't exist.</p>
            <p className="mx-auto mt-3 max-w-md text-text-muted">Check the address or use one of the links below to find your way back to trusted local services.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
