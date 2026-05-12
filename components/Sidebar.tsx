'use client';

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Home, ChevronDown, Menu, X } from 'lucide-react'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">{children}</div>
)

const getRoleMenuItems = (role: string) => {
  const baseItem = { label: 'Dashboard', href: `/${role}/dashboard`, demo: false }
  
  switch(role) {
    case 'admin':
      return [
        baseItem,
        { label: 'Student & Staff Stats', href: '#', demo: true },
        { label: 'School Analytics', href: '#', demo: true },
        { label: 'User Management', href: '#', demo: true },
        { label: 'Fee Tracking', href: '#', demo: true },
        { label: 'System Settings', href: '#', demo: true },
        { label: 'Reports & Exports', href: '#', demo: true },
        { label: 'Announcements', href: '#', demo: true },
      ]
    case 'teacher':
      return [
        baseItem,
        { label: 'Class Management', href: '#', demo: true },
        { label: 'Attendance Marking', href: '#', demo: true },
        { label: 'Assignments & Notes', href: '#', demo: true },
        { label: 'Grade Submission', href: '#', demo: true },
        { label: 'Performance Analytics', href: '#', demo: true },
        { label: 'Messaging', href: '#', demo: true },
      ]
    case 'student':
      return [
        baseItem,
        { label: 'Timetable', href: '#', demo: true },
        { label: 'Assignments & LMS', href: '#', demo: true },
        { label: 'Exam Results', href: '#', demo: true },
        { label: 'Attendance', href: '#', demo: true },
        { label: 'Fee Balance', href: '#', demo: true },
        { label: 'Notifications', href: '#', demo: true },
      ]
    case 'parent':
      return [
        baseItem,
        { label: 'Academic Progress', href: '#', demo: true },
        { label: 'Attendance Reports', href: '#', demo: true },
        { label: 'Fee Payment', href: '#', demo: true },
        { label: 'Teacher Communication', href: '#', demo: true },
        { label: 'School Announcements', href: '#', demo: true },
      ]
    default:
      return [baseItem]
  }
}

export default function Sidebar({ role }: { role: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [demoModal, setDemoModal] = useState<string | null>(null)
  
  const items = getRoleMenuItems(role)

  const handleDemoFeatureClick = (label: string) => {
    setDemoModal(label)
    setTimeout(() => setDemoModal(null), 3000)
  }

  return (
    <>
      {/* Mobile Menu Button - Always show on mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Demo Feature Toast */}
      {demoModal && (
        <div className="fixed bottom-4 left-4 md:left-auto md:right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs animate-pulse">
          <p className="font-semibold">{demoModal}</p>
          <p className="text-sm text-green-100">This is a demo feature. Coming soon in the live system!</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${
        isOpen ? 'w-72' : 'w-24'
      } bg-gradient-to-b from-green-600 to-emerald-600 p-6 text-white shadow-lg transition-all duration-300 fixed md:relative h-screen md:h-auto z-40 md:z-0 flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-3 flex-1 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
          } transition-opacity`}>
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-bold text-lg">Academy</div>
              <div className="text-xs text-white/80">Portal</div>
            </div>
          </div>
          
          {/* Collapse Toggle - Always visible on desktop, works when collapsed too */}
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

        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {items.map((it) => (
            it.demo ? (
              <button
                key={it.label}
                onClick={() => {
                  handleDemoFeatureClick(it.label)
                  setIsMobileOpen(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/15 text-left"
              >
                <Icon>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 12h18" strokeWidth="2" />
                  </svg>
                </Icon>
                <span className={`font-medium transition-opacity ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  {it.label}
                </span>
              </button>
            ) : (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  router.pathname === it.href
                    ? 'bg-white/25 font-semibold'
                    : 'hover:bg-white/15'
                }`}
              >
                <Icon>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 12h18" strokeWidth="2" />
                  </svg>
                </Icon>
                <span className={`font-medium transition-opacity ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
                }`}>
                  {it.label}
                </span>
              </Link>
            )
          ))}
        </nav>

        {/* Logout Button */}
        <button className={`w-full p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white font-medium ${
          isOpen ? 'text-base' : 'text-sm'
        }`}>
          {isOpen ? '🚪 Logout' : '🚪'}
        </button>
      </aside>
    </>
  )
}
