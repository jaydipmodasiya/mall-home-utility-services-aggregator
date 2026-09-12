import { ArrowLeft, Home } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import DeveloperPlayground from './components/ui/DeveloperPlayground'
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
      <div className="route-error-shell">
        <div className="page-container flex min-h-[calc(100vh-16rem)] items-center justify-center py-10 md:py-14">
          <div className="route-error-panel w-full max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-brand-aqua-deep">route_status: 404</p>
                <p className="mt-3 text-7xl font-display font-extrabold leading-none text-brand-navy sm:text-8xl" aria-hidden="true">404</p>
                <h1 className="mt-4 text-3xl font-display font-bold leading-tight text-text-primary sm:text-4xl">Looks like this route took a wrong turn.</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-text-muted">This page doesn't exist, but we can still get you back on track.</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/" className="btn-navy"><Home className="h-4 w-4" aria-hidden="true" /> Back to Home</Link>
                  <Link to="/services" className="btn-secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse Services</Link>
                </div>
              </div>
              <DeveloperPlayground />
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
