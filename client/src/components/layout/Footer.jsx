import { Mail, MapPin, Phone, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-text-onDark/70 mt-auto">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-aqua flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand-navy" fill="currentColor" />
              </div>
              <span className="text-base font-display font-bold text-white leading-tight">
                Mall &amp; Home
                <span className="block text-xs font-semibold text-brand-aqua/80">Utility Services</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-text-onDark/50">
              Connecting you with trusted local service professionals. Fast, verified, transparent.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {['Electrician', 'Plumber', 'Carpenter', 'Tailor', 'Maintenance'].map((s) => (
                <li key={s}>
                  <Link
                    to={`/providers?category=${s.toLowerCase()}`}
                    className="hover:text-brand-aqua transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register?role=provider" className="hover:text-brand-aqua transition-colors">Become a Provider</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-aqua flex-shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-aqua flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-aqua flex-shrink-0" />
                <span>support@mallutility.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-onDark/40">© {new Date().getFullYear()} Mall &amp; Home Utility Services Aggregator. All rights reserved.</p>
          <p className="text-xs text-text-onDark/40">Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  )
}
