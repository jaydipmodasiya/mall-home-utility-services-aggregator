/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette ──────────────────────────────────
        brand: {
          aqua: '#ABDDDE',   // primary structural / selected
          'aqua-dark': '#6BBFC0',   // darker aqua for hover
          'aqua-deep': '#1A7C80',   // deep aqua for text on light
          mint: '#CAF1DE',   // hero / hero-section bg
          pale: '#E1F8DC',   // section alternates
          'cream-y': '#FEF9DC',   // highlight accent bg
          peach: '#FFE7C8',   // soft accent
          'peach-warm': '#F7D8BB',   // borders / dividers
          coral: '#E8704A',   // primary CTA
          'coral-dark': '#C85A37',   // coral hover
          'coral-pale': '#FBF0EC',   // coral light bg
          navy: '#0F2B3D',   // nav / footer / headings
          'navy-mid': '#1B4060',   // mid navy for text
          'navy-light': '#2A5F7F',   // lighter nav accent
        },
        // ── Surface ────────────────────────────────────────
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5FAFA',   // light aqua-tinted page bg
          tertiary: '#E8F7F7',   // slightly more tinted
        },
        // ── Text ───────────────────────────────────────────
        text: {
          primary: '#0F2B3D',   // navy — deep and readable
          secondary: '#2A5070',   // mid blue-grey
          muted: '#6B8EA0',   // muted blue-grey
          light: '#A0BCC8',   // very light
          onDark: '#E8F4F5',   // text on dark nav/footer
        },
        // ── Status ─────────────────────────────────────────
        status: {
          pending: '#F59E0B',
          assigned: '#3B82F6',
          'in-progress': '#8B5CF6',
          completed: '#10B981',
          cancelled: '#EF4444',
          rejected: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(15, 43, 61, 0.07)',
        'card-hover': '0 4px 20px rgba(15, 43, 61, 0.12)',
        'nav': '0 1px 0 rgba(15, 43, 61, 0.08)',
        'btn': '0 2px 6px rgba(232, 112, 74, 0.30)',
        'modal': '0 16px 48px rgba(15, 43, 61, 0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.28s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-6px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [],
}
