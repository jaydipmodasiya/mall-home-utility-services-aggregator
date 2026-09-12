import {
    ArrowRight, BadgeCheck,
    CheckCircle,
    ChevronRight,
    Clock,
    DollarSign,
    Droplets, Hammer,
    MapPin,
    Scissors,
    Search,
    Wrench,
    Zap
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/layout/Layout'

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const services = [
  {
    key: 'electrician', label: 'Electrician',
    Icon: Zap, desc: 'Wiring, fans, sockets and all electrical work.',
    bg: '#ABDDDE', ic: '#0F5458', featured: true,
  },
  {
    key: 'plumber', label: 'Plumber',
    Icon: Droplets, desc: 'Leaks, taps, drainage and water heaters.',
    bg: '#CAF1DE', ic: '#1A6040',
  },
  {
    key: 'carpenter', label: 'Carpenter',
    Icon: Hammer, desc: 'Furniture, doors, windows and woodwork.',
    bg: '#FFE7C8', ic: '#7A4010',
  },
  {
    key: 'tailor', label: 'Tailor',
    Icon: Scissors, desc: 'Stitching, alterations and uniforms.',
    bg: '#F7D8BB', ic: '#7A3530',
  },
  {
    key: 'maintenance', label: 'Maintenance',
    Icon: Wrench, desc: 'General repairs, cleaning and handyman tasks.',
    bg: '#E1F8DC', ic: '#1A5C2A',
  },
]

const trustItems = [
  {
    Icon: BadgeCheck,
    title: 'Verified Professionals',
    desc: 'Every provider is background-checked and skill-verified before going live on Mall & Home Utility Services Aggregator.',
  },
  {
    Icon: DollarSign,
    title: 'Clear Pricing',
    desc: 'See visiting charges and hourly rates upfront — no hidden fees, no surprises.',
  },
  {
    Icon: Clock,
    title: 'Flexible Booking',
    desc: 'Book instantly for urgent needs or schedule ahead for a convenient time.',
  },
]

const steps = [
  { n: '01', title: 'Choose a service', desc: 'Pick from electrician, plumber, carpenter, tailor, or maintenance.' },
  { n: '02', title: 'Find a professional', desc: 'Browse verified local providers, check ratings and pricing.' },
  { n: '03', title: 'Book and track', desc: 'Confirm your booking and track your service from start to finish.' },
]

/* ─────────────────────────────────────────────
   Hero right-side illustration
───────────────────────────────────────────── */
function ServiceIllustration() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto aspect-square flex items-center justify-center select-none">
      {/* Organic blob */}
      <div
        className="absolute w-[78%] h-[78%]"
        style={{
          background: '#ABDDDE',
          borderRadius: '60% 40% 50% 50% / 40% 50% 50% 60%',
        }}
        aria-hidden="true"
      />

      {/* Inner pale shape */}
      <div
        className="absolute w-[54%] h-[54%]"
        style={{
          background: '#CAF1DE',
          borderRadius: '50% 50% 40% 60% / 55% 45% 55% 45%',
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      {/* Center icon */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
        <Wrench className="w-8 h-8" style={{ color: '#0F5458' }} />
      </div>

      {/* Service orbits — 4 corners */}
      {[
        { Icon: Zap,      bg: '#ABDDDE', ic: '#0F5458', pos: 'top-[14%] left-[14%]',   size: 'w-12 h-12' },
        { Icon: Droplets, bg: '#CAF1DE', ic: '#1A6040', pos: 'top-[14%] right-[12%]',  size: 'w-10 h-10' },
        { Icon: Hammer,   bg: '#FFE7C8', ic: '#7A4010', pos: 'bottom-[18%] left-[10%]', size: 'w-10 h-10' },
        { Icon: Scissors, bg: '#F7D8BB', ic: '#7A3530', pos: 'bottom-[14%] right-[14%]',size: 'w-12 h-12' },
      ].map(({ Icon, bg, ic, pos, size }) => (
        <div
          key={ic}
          className={`absolute ${pos} ${size} rounded-full flex items-center justify-center shadow-sm z-10`}
          style={{ background: bg }}
          aria-hidden="true"
        >
          <Icon className="w-[45%] h-[45%]" style={{ color: ic }} />
        </div>
      ))}

      {/* Verified badge */}
      <div
        className="absolute bottom-[28%] right-[6%] z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-sm"
        style={{ background: '#E1F8DC', border: '1px solid #A8E6C4' }}
        aria-hidden="true"
      >
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        <span className="text-[10px] font-bold text-emerald-800">Verified</span>
      </div>

      {/* Subtle ring */}
      <div
        className="absolute inset-[4%] rounded-full border border-dashed opacity-20 pointer-events-none"
        style={{ borderColor: '#0F5458' }}
        aria-hidden="true"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function LandingPage() {
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const cityRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (category)    params.set('category', category)
    window.location.href = `/providers?${params.toString()}`
  }

  const jumpToCategory = (cat) => {
    window.location.href = `/providers?category=${cat}`
  }

  return (
    <PublicLayout navVariant="light">

      {/* ══════════════════════════════════════════════
          01 · HERO
      ══════════════════════════════════════════════ */}
      <section className="bg-white pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — copy */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-5" style={{ color: '#1A7C80' }}>
                Local help, without the hassle
              </p>

              <h1
                className="font-display font-extrabold leading-[1.06] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', color: '#0F2B3D' }}
              >
                Reliable help,<br />
                right when<br />
                you need it.
              </h1>

              <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: '#2A5070', maxWidth: '34ch' }}>
                Find verified local professionals for everyday home and utility services.
              </p>

              {/* Search module */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-2xl border overflow-hidden mb-5"
                style={{ borderColor: '#D4E8E8', boxShadow: '0 2px 16px rgba(15,43,61,0.07)' }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* City */}
                  <label className="sr-only" htmlFor="hero-city">City</label>
                  <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5 border-b sm:border-b-0 sm:border-r" style={{ borderColor: '#E8F4F4' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#ABDDDE' }} />
                    <input
                      id="hero-city"
                      ref={cityRef}
                      type="text"
                      placeholder="Your city (e.g., Mumbai)"
                      className="text-sm flex-1 outline-none placeholder-gray-400"
                      style={{ color: '#0F2B3D', background: 'transparent' }}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  {/* Service */}
                  <label className="sr-only" htmlFor="hero-service">Service</label>
                  <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5 border-b sm:border-b-0 sm:border-r" style={{ borderColor: '#E8F4F4' }}>
                    <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#ABDDDE' }} />
                    <select
                      id="hero-service"
                      className="dropdown-select min-h-0 flex-1 border-0 px-0 py-0 outline-none focus:ring-0"
                      style={{ background: 'transparent', color: category ? '#0F2B3D' : '#9CA3AF' }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>Select a service</option>
                      {services.map((s) => (
                        <option key={s.key} value={s.key} className="text-gray-900">{s.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Button */}
                  <button
                    type="submit"
                    id="hero-search-btn"
                    className="font-semibold text-sm px-6 py-3.5 transition-colors whitespace-nowrap"
                    style={{ background: '#0F2B3D', color: '#ABDDDE' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1B4060' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#0F2B3D' }}
                  >
                    Find Help
                  </button>
                </div>
              </form>

              {/* Micro trust indicators */}
              <div className="flex flex-wrap gap-4">
                {['Verified professionals', 'Upfront pricing', 'Instant booking'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#1A7C80' }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — illustration */}
            <div className="hidden md:flex justify-center items-center">
              <ServiceIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          02 · SERVICE DISCOVERY
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ background: '#FAFEFE' }}>
        <div className="page-container">
          <div className="mb-10">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: '#0F2B3D' }}>
              What do you need help with?
            </h2>
            <p className="text-sm md:text-base" style={{ color: '#6B8EA0' }}>
              Tap a service to find verified professionals near you.
            </p>
          </div>

          {/* Mixed tile layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {services.map(({ key, label, Icon, desc, bg, ic, featured }) => (
              <button
                key={key}
                onClick={() => jumpToCategory(key)}
                className={`text-left p-5 rounded-2xl border border-transparent group transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  featured ? 'col-span-2 md:col-span-1 row-span-1' : ''
                }`}
                style={{
                  background: bg + '28',      /* 16% opacity bg */
                  '--hover-bg': bg + '55',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = bg + '55'; e.currentTarget.style.borderColor = bg }}
                onMouseLeave={(e) => { e.currentTarget.style.background = bg + '28'; e.currentTarget.style.borderColor = 'transparent' }}
                aria-label={`Find ${label} professionals`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:-translate-y-0.5"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: ic }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: '#0F2B3D' }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#6B8EA0' }}>{desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold transition-all duration-150 group-hover:gap-2" style={{ color: ic }}>
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          03 · TRUST SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24" style={{ background: '#E1F8DC' }}>
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left — editorial statement */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#1A6040' }}>
                Why Mall &amp; Home Utility Services Aggregator
              </p>
              <h2
                className="font-display font-extrabold leading-tight mb-5"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#0F2B3D' }}
              >
                Built to make local<br />services accessible.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#2A5070', maxWidth: '38ch' }}>
                We connect you with skilled, background-verified professionals in your city — with transparent pricing and flexible booking, so you're always in control.
              </p>
              <Link
                to="/providers"
                className="inline-flex items-center gap-2 mt-8 text-sm font-bold transition-all hover:gap-3"
                style={{ color: '#1A6040' }}
              >
                Start browsing professionals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — three principles */}
            <div className="space-y-0 divide-y" style={{ '--divider': '#C2E8C8' }}>
              {trustItems.map(({ Icon, title, desc }, i) => (
                <div key={title} className="flex items-start gap-4 py-6 first:pt-0 last:pb-0" style={{ borderColor: '#C2E8C8' }}>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.6)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#1A6040' }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: '#0F2B3D' }}>{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#2A5070' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          04 · HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white overflow-hidden">
        <div className="page-container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: '#0F2B3D' }}>
              Three steps to sorted
            </h2>
            <p className="text-sm md:text-base" style={{ color: '#6B8EA0' }}>
              Getting professional help takes less than 2 minutes.
            </p>
          </div>

          {/* Horizontal timeline (desktop) / Vertical (mobile) */}
          <div className="flex flex-col md:flex-row items-start md:items-stretch gap-0 relative">
            {/* Connecting line — desktop */}
            <div
              className="hidden md:block absolute top-7 left-[16.5%] right-[16.5%] h-px"
              style={{ background: 'linear-gradient(90deg, #ABDDDE, #CAF1DE, #E1F8DC)' }}
              aria-hidden="true"
            />

            {steps.map(({ n, title, desc }, i) => (
              <div
                key={n}
                className="flex-1 flex flex-col items-center text-center px-4 md:px-6 py-0 md:py-0 relative"
              >
                {/* Mobile connector */}
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden w-px h-8 my-3"
                    style={{ background: '#ABDDDE' }}
                    aria-hidden="true"
                  />
                )}

                {/* Step number dot */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-base relative z-10 mb-4"
                  style={{ background: '#ABDDDE', color: '#0F2B3D' }}
                >
                  {n}
                </div>

                <h3 className="font-bold text-sm mb-2" style={{ color: '#0F2B3D' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#6B8EA0', maxWidth: '20ch', margin: '0 auto' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          05 · POPULAR SERVICES (editorial)
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ background: '#FAFEFE' }}>
        <div className="page-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-1" style={{ color: '#0F2B3D' }}>
                Most popular
              </h2>
              <p className="text-sm" style={{ color: '#6B8EA0' }}>Booked most often by our customers</p>
            </div>
            <Link
              to="/providers"
              className="hidden sm:flex items-center gap-1 text-xs font-bold transition-all hover:gap-2"
              style={{ color: '#1A7C80' }}
            >
              All services <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Editorial: featured large + compact list */}
          <div className="grid md:grid-cols-5 gap-4 md:gap-5">
            {/* Featured service */}
            <Link
              to="/providers?category=electrician"
              className="md:col-span-3 group relative rounded-2xl overflow-hidden flex flex-col justify-between p-6 md:p-8 min-h-[220px] md:min-h-[280px] transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#ABDDDE' }}
              aria-label="Find Electricians"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0F5458' }}>
                  Most booked
                </p>
                <div className="w-14 h-14 rounded-xl bg-white/40 flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7" style={{ color: '#0F5458' }} />
                </div>
                <h3 className="font-display font-extrabold text-2xl mb-2" style={{ color: '#0F2B3D' }}>Electrician</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#1A5C60', maxWidth: '30ch' }}>
                  Certified electricians for fans, wiring, sockets, MCB and all electrical work — residential and commercial.
                </p>
              </div>
              <div
                className="inline-flex items-center gap-2 mt-6 text-sm font-bold transition-all duration-150 group-hover:gap-3"
                style={{ color: '#0F5458' }}
              >
                Find an Electrician <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Compact service list */}
            <div className="md:col-span-2 flex flex-col gap-3">
              {services.slice(1).map(({ key, label, Icon, bg, ic }) => (
                <Link
                  key={key}
                  to={`/providers?category=${key}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all duration-200"
                  style={{ background: bg + '30' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = bg + '55'; e.currentTarget.style.borderColor = bg }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = bg + '30'; e.currentTarget.style.borderColor = 'transparent' }}
                  aria-label={`Find ${label} professionals`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color: ic }} />
                  </div>
                  <p className="font-bold text-sm flex-1" style={{ color: '#0F2B3D' }}>{label}</p>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                    style={{ color: '#A0BCC8' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          06 · FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24" style={{ background: '#CAF1DE' }}>
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="font-display font-extrabold leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#0F2B3D' }}
            >
              Your next fix is closer<br className="hidden sm:block" /> than you think.
            </h2>
            <p className="text-base md:text-lg mb-10" style={{ color: '#2A5070', lineHeight: '1.6' }}>
              Find a trusted local professional and get your task moving today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/providers"
                id="final-cta-find-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: '#0F2B3D', color: '#ABDDDE' }}
              >
                Find a Service <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=provider"
                id="final-cta-provider-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:bg-white/50"
                style={{ borderColor: '#1A6040', color: '#1A6040' }}
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
