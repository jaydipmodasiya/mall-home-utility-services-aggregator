export const CATEGORIES = [
  { key: 'electrician', label: 'Electrician', icon: 'Zap',      color: 'bg-brand-cream-y text-text-primary', bgAccent: 'bg-brand-cream-y', description: 'Wiring, fans, sockets, MCB & all electrical work' },
  { key: 'plumber',     label: 'Plumber',     icon: 'Droplets', color: 'bg-brand-aqua/20 text-brand-aqua-deep', bgAccent: 'bg-brand-aqua/20', description: 'Pipe leaks, taps, drainage & water heater' },
  { key: 'carpenter',   label: 'Carpenter',   icon: 'Hammer',   color: 'bg-brand-peach text-text-primary', bgAccent: 'bg-brand-peach', description: 'Furniture, doors, windows & custom woodwork' },
  { key: 'tailor',      label: 'Tailor',      icon: 'Scissors', color: 'bg-brand-pale text-text-primary', bgAccent: 'bg-brand-pale', description: 'Stitching, alterations, uniforms & curtains' },
  { key: 'maintenance', label: 'Maintenance', icon: 'Wrench',   color: 'bg-brand-mint text-text-primary', bgAccent: 'bg-brand-mint', description: 'General maintenance, cleaning & handyman tasks' },
]

export const STATUS_CONFIG = {
  pending:     { label: 'Pending',     class: 'status-pending',     step: 0 },
  assigned:    { label: 'Assigned',    class: 'status-assigned',    step: 1 },
  in_progress: { label: 'In Progress', class: 'status-in_progress', step: 2 },
  completed:   { label: 'Completed',   class: 'status-completed',   step: 3 },
  cancelled:   { label: 'Cancelled',   class: 'status-cancelled',   step: -1 },
  rejected:    { label: 'Rejected',    class: 'status-rejected',    step: -1 },
}

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

export const getCategoryInfo = (key) =>
  CATEGORIES.find((c) => c.key === key) || { label: key, icon: 'Tool', color: 'bg-surface-tertiary text-text-secondary' }
