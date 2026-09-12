import { Briefcase, Star, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardLayout } from '../../components/layout/Layout'
import { ErrorState } from '../../components/ui/EmptyState'
import { SectionLoader } from '../../components/ui/Spinner'
import api from '../../services/api'

const COLORS = ['#F5A623', '#FFC94A', '#D4891A', '#8B6332', '#5C3D11']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnalytics = () => {
    setLoading(true)
    setError(false)
    api.get('/admin/analytics')
      .then(({ data: d }) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAnalytics() }, [])

  if (loading) return <DashboardLayout role="admin"><SectionLoader /></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><ErrorState message="Couldn't load analytics right now. Please try again." onRetry={fetchAnalytics} /></DashboardLayout>

  const monthlyData = data?.charts?.bookingsByMonth?.map((b) => ({
    name: MONTHS[(b._id.month || 1) - 1],
    bookings: b.count,
  })) || []

  const categoryData = data?.charts?.bookingsByCategory?.map((b) => ({
    name: b._id?.charAt(0).toUpperCase() + b._id?.slice(1),
    value: b.count,
  })) || []

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Analytics & Reports</h1>
        <p className="text-text-muted text-sm mt-1">Platform performance overview</p>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: data?.kpis?.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Verified Providers', value: data?.kpis?.verifiedProviders, icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
          { label: 'Completion Rate', value: `${data?.kpis?.completionRate}%`, icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Booking Conversion', value: `${data?.kpis?.bookingConversionRate ?? 0}%`, icon: TrendingUp, color: 'bg-brand-aqua/20 text-brand-aqua-deep' },
          { label: 'Avg. Rating', value: data?.kpis?.avgRating, icon: Star, color: 'bg-yellow-50 text-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card card-body">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-4 h-4" /></div>
            <p className="text-2xl font-bold text-text-primary">{value ?? '—'}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly bookings bar chart */}
        <div className="card card-body">
          <h2 className="font-bold text-text-primary mb-5">Bookings (Last 6 Months)</h2>
          {monthlyData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No booking data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9B8B70' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9B8B70' }} />
                <Tooltip contentStyle={{ background: '#FDFAF4', border: '1px solid #F5ECD7', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="bookings" fill="#F5A623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category distribution pie chart */}
        <div className="card card-body">
          <h2 className="font-bold text-text-primary mb-5">Bookings by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No category data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#FDFAF4', border: '1px solid #F5ECD7', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="card card-body mt-6">
        <h2 className="font-bold text-text-primary mb-4">Platform Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-peach-warm/60">
              {['Metric', 'Value'].map((h) => <th key={h} className="text-left py-2 px-3 text-xs font-bold text-text-secondary">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-brand-peach-warm/40">
              {[
                ['Total Registered Customers', data?.kpis?.totalUsers],
                ['Total Service Providers', data?.kpis?.totalProviders],
                ['Verified Providers', data?.kpis?.verifiedProviders],
                ['Total Bookings', data?.kpis?.totalBookings],
                ['Completed Bookings', data?.kpis?.completedBookings],
                ['Cancelled Bookings', data?.kpis?.cancelledBookings],
                ['Active/Pending Bookings', data?.kpis?.pendingBookings],
                ['Open Disputes', data?.kpis?.openDisputes],
                ['Average Rating', data?.kpis?.avgRating],
                ['Avg. Completion Time', `${data?.kpis?.avgCompletionHours}h`],
                ['Booking Completion Rate', `${data?.kpis?.completionRate}%`],
                ['Booking Conversion Rate', `${data?.kpis?.bookingConversionRate ?? 0}%`],
                ['Provider Discovery Events', data?.kpis?.providerDiscoveryEvents],
                ['New Users (Last 30 Days)', data?.kpis?.recentUsers],
              ].map(([label, val]) => (
                <tr key={label} className="hover:bg-brand-cream-y">
                  <td className="py-2.5 px-3 text-text-secondary">{label}</td>
                  <td className="py-2.5 px-3 font-bold text-text-primary">{val ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
