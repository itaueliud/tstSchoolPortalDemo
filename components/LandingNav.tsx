'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLinkClick = () => {
    setMobileOpen(false)
  }

  return (
    <nav aria-label="Primary" className="sticky top-0 z-50 bg-gradient-to-r from-[#0b1f4d] to-[#123a78] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white text-[#123a78] font-bold flex items-center justify-center text-lg">TST</div>
          <div className="font-bold text-white text-lg hidden sm:block">TST School Portal</div>
          <div className="font-bold text-white text-sm sm:hidden">TST Portal</div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-white text-sm">
          <a href="#top" className="hover:text-blue-100 transition">Home</a>
          <Link href="/features" className="hover:text-blue-100 transition">
            Features
          </Link>
          <a href="#modules" className="hover:text-blue-100 transition">Modules</a>
          <Link href="/about" className="hover:text-blue-100 transition">
            About
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg border border-white hover:bg-white/10 transition text-white text-sm">
            Login
          </Link>
          <Link href="/role-select" className="px-4 py-2 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition text-sm">
            Get Started
          </Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#0b1f4d] px-4 py-4 space-y-3">
          <a href="#top" onClick={handleLinkClick} className="block text-white hover:text-blue-100 transition py-2">Home</a>
          <Link href="/features" onClick={handleLinkClick} className="block text-white hover:text-blue-100 transition py-2">
            Features
          </Link>
          <a href="#modules" onClick={handleLinkClick} className="block text-white hover:text-blue-100 transition py-2">Modules</a>
          <Link href="/about" onClick={handleLinkClick} className="block text-white hover:text-blue-100 transition py-2">
            About
          </Link>
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1 px-4 py-2 rounded-lg border border-white text-white hover:bg-white/10 transition text-sm text-center">
              Login
            </Link>
            <Link href="/role-select" className="flex-1 px-4 py-2 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition text-sm text-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}


