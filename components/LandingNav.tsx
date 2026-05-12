import Link from 'next/link'
import { useTheme } from '../src/theme'

export default function LandingNav() {
  const { dark, toggle } = useTheme()
  return (
    <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon text-navy font-bold flex items-center justify-center">★</div>
          <div className="font-semibold text-sm">Greenfield Academy</div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#" className="hover:text-neon transition">Home</a>
          <a href="#" className="hover:text-neon transition">Features</a>
          <a href="#" className="hover:text-neon transition">Modules</a>
          <a href="#" className="hover:text-neon transition">About Us</a>
          <a href="#" className="hover:text-neon transition">Pricing</a>
          <a href="#" className="hover:text-neon transition">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-md bg-white/6 hover:bg-white/10 transition">
            {dark ? '🌙' : '☀️'}
          </button>
          <Link href="/login" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition text-sm">
            Login
          </Link>
          <Link href="/role-select" className="px-4 py-2 rounded-lg bg-neon text-navy font-semibold hover:bg-neon/90 transition text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
