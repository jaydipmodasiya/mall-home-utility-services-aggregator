import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/layout/Layout'
import { Zap, Droplets, Hammer, Scissors, Wrench, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Zap, label: 'Electrician', cat: 'electrician',
    bg: 'bg-amber-50', ic: 'text-amber-600', border: 'hover:border-amber-300',
    desc: 'Licensed electricians for all residential and commercial electrical needs.',
    tasks: ['Fan & Light Installation', 'Socket & Switch Repair', 'MCB / Circuit Breaker', 'Inverter & Battery Setup', 'Full Wiring Work', 'Meter Related Work'],
  },
  {
    icon: Droplets, label: 'Plumber', cat: 'plumber',
    bg: 'bg-sky-50', ic: 'text-sky-600', border: 'hover:border-sky-300',
    desc: 'Expert plumbing solutions for homes, apartments and commercial spaces.',
    tasks: ['Tap Repair & Replacement', 'Pipe Leak Detection & Fix', 'Drainage Cleaning', 'Water Heater Installation', 'RO System Setup', 'Bathroom Fitting'],
  },
  {
    icon: Hammer, label: 'Carpenter', cat: 'carpenter',
    bg: 'bg-orange-50', ic: 'text-orange-600', border: 'hover:border-orange-300',
    desc: 'Skilled carpenters for furniture, doors and all custom woodwork.',
    tasks: ['Furniture Repair & Assembly', 'Door & Window Fixing', 'Custom Shelves & Cabinets', 'Wood Polish & Finishing', 'Partition Work', 'False Ceiling (Wood)'],
  },
  {
    icon: Scissors, label: 'Tailor', cat: 'tailor',
    bg: 'bg-pink-50', ic: 'text-pink-600', border: 'hover:border-pink-300',
    desc: 'Professional tailors for stitching, alterations and home textile work.',
    tasks: ['Blouse & Dress Stitching', 'Uniform Repair & Alteration', 'Curtain & Drape Making', 'Kids & School Wear', 'Hem & Length Shortening', 'Embroidery Work'],
  },
  {
    icon: Wrench, label: 'Maintenance Staff', cat: 'maintenance',
    bg: 'bg-teal-50', ic: 'text-teal-600', border: 'hover:border-teal-300',
    desc: 'General maintenance experts for malls, offices and residential complexes.',
    tasks: ['Deep Cleaning Services', 'Painting & Touch-ups', 'AC Servicing & Cleaning', 'Handyman & Minor Repairs', 'Pest Control Preparation', 'Floor Maintenance'],
  },
]

export default function ServicesPage() {
  return (
    <PublicLayout>
      <div className="page-container py-12 md:py-16">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">
            Services we cover
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Expert professionals for every home, apartment, and commercial service need — verified, rated, and available near you.
          </p>
        </div>

        {/* Service sections */}
        <div className="space-y-5">
          {services.map(({ icon: Icon, label, cat, bg, ic, border, desc, tasks }) => (
            <div
              key={cat}
              className={`bg-white rounded-xl border border-brand-peach-warm/60 ${border} transition-all duration-200 overflow-hidden`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left accent */}
                <div className={`${bg} px-6 py-6 md:py-8 flex flex-col items-center justify-center gap-3 md:w-48 flex-shrink-0`}>
                  <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-7 h-7 ${ic}`} />
                  </div>
                  <p className="font-display font-bold text-text-primary">{label}</p>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-6 border-t md:border-t-0 md:border-l border-brand-peach-warm/40">
                  <p className="text-text-muted text-sm mb-4">{desc}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mb-5">
                    {tasks.map((task) => (
                      <div key={task} className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <CheckCircle className="w-3.5 h-3.5 text-brand-aqua-dark flex-shrink-0" />
                        {task}
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/providers?category=${cat}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-coral hover:text-brand-coral-dark transition-colors"
                  >
                    Find {label} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-hero rounded-2xl px-8 py-10 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-text-onDark/60 mb-6 text-sm">Browse verified professionals and book instantly.</p>
          <Link to="/providers" id="services-cta-btn" className="btn-aqua py-3 px-8 text-sm font-semibold">
            Find a Provider <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
