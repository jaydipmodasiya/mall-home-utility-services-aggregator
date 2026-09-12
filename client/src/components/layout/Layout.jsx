import Navbar from './Navbar'
import Footer from './Footer'
import Sidebar from './Sidebar'

export function PublicLayout({ children, navVariant = 'dark' }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant={navVariant} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export function DashboardLayout({ children, role }) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <Navbar variant="dark" />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1 lg:pl-64 min-w-0">
          <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
