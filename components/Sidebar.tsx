'use client';

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Home, ChevronDown, Menu, X } from 'lucide-react'
import { clearAuthSession, type UserRole } from '../src/auth'
import { getRoleMenuItems } from '../src/navigation'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white transition-colors">{children}</div>
)

export default function Sidebar({ role }: { role: UserRole }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const items = getRoleMenuItems(role)

  const handleLogout = () => {
    clearAuthSession()
    router.push('/login')
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0b1f4d] text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`${
        isOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-[#0b1f4d] to-[#123a78] p-4 md:p-6 text-white shadow-lg transition-all duration-300 fixed md:sticky md:top-0 md:left-0 h-screen z-40 flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-3 flex-1 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
            } transition-opacity`}>
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Home className="w-6 h-6 text-[#0b1f4d]" />
              </div>
              <div>
                <div className="font-bold text-lg">Academy</div>
                <div className="text-xs text-white/80">Portal</div>
              </div>
            </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden md:flex items-center justify-center flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto pt-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-3 p-3 rounded-lg transition-colors hover:scale-[1.01] ${
                router.asPath === it.href || router.pathname === it.href
                  ? 'bg-white/25 font-semibold ring-1 ring-white/20'
                  : 'hover:bg-white/15'
              }`}
            >
              <Icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path d="M3 12h18" strokeWidth="2" />
                </svg>
              </Icon>
              <span className={`font-medium transition-all duration-200 ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
              }`}>{it.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className={`w-full p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white font-medium ${
            isOpen ? 'text-base' : 'text-sm'
          }`}
        >
          {isOpen ? 'Logout' : 'Out'}
        </button>
      </aside>
    </>
  )
}
