import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { PageLoader } from './components/ui/Spinner'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public pages
import LandingPage from './pages/LandingPage'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ProviderSearchPage from './pages/customer/ProviderSearchPage'
import ProviderProfilePage from './pages/customer/ProviderProfilePage'
import BookingFlowPage from './pages/customer/BookingFlowPage'
import BookingsListPage from './pages/customer/BookingsListPage'
import BookingDetailPage from './pages/customer/BookingDetailPage'
import ServiceHistoryPage from './pages/customer/ServiceHistoryPage'
import CustomerProfilePage from './pages/customer/CustomerProfilePage'

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard'
import ProviderJobsPage from './pages/provider/ProviderJobsPage'
import JobDetailPage from './pages/provider/JobDetailPage'
import AvailabilityPage from './pages/provider/AvailabilityPage'
import EarningsPage from './pages/provider/EarningsPage'
import ProviderProfileEditPage from './pages/provider/ProviderProfileEditPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProvidersPage from './pages/admin/AdminProvidersPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminDisputesPage from './pages/admin/AdminDisputesPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#E1F8DC' }}>
      <div className="text-center">
        <p className="text-8xl font-extrabold mb-4" style={{ color: '#ABDDDE' }}>404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h1>
        <p className="text-text-muted mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-navy">Go Home</a>
      </div>
    </div>
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
