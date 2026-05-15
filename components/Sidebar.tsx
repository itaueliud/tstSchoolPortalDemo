'use client';

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Home, ChevronDown, Menu, X, LogOut, Users, BarChart2, BookOpen, CalendarCheck, User, DollarSign, Settings, FileText, Megaphone, Clipboard, Edit3, MessageCircle, Calendar, Bell, Activity } from 'lucide-react'
import { clearAuthSession, type UserRole } from '../src/auth'
import { getRoleMenuItems } from '../src/navigation'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors">
    <div className="w-full h-full rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm">
      {children}
    </div>
  </div>
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
          <div className={`flex items-center gap-4 flex-1 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
            } transition-opacity`}>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/10">
                <Home className="w-6 h-6 text-white" />
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
          {items.map((it) => {
            const active = router.asPath === it.href || router.pathname === it.href
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-3 p-3 rounded-2xl transition-transform transform ${active ? 'bg-white/10 font-semibold ring-1 ring-white/20 shadow-inner' : 'hover:bg-white/10'} `}
              >
                <Icon>
                  {(() => {
                    switch (it.slug) {
                      case 'dashboard':
                        return <Home className="w-4 h-4" />
                      case 'stats':
                        return <Users className="w-4 h-4" />
                      case 'analytics':
                        return <BarChart2 className="w-4 h-4" />
                      case 'classes':
                        return <BookOpen className="w-4 h-4" />
                      case 'attendance':
                        return <CalendarCheck className="w-4 h-4" />
                      case 'users':
                        return <User className="w-4 h-4" />
                      case 'fees':
                        return <DollarSign className="w-4 h-4" />
                      case 'settings':
                        return <Settings className="w-4 h-4" />
                      case 'reports':
                        return <FileText className="w-4 h-4" />
                      case 'announcements':
                        return <Megaphone className="w-4 h-4" />
                      case 'assignments':
                        return <Clipboard className="w-4 h-4" />
                      case 'grades':
                        return <Edit3 className="w-4 h-4" />
                      case 'performance':
                        return <BarChart2 className="w-4 h-4" />
                      case 'messaging':
                        return <MessageCircle className="w-4 h-4" />
                      case 'timetable':
                        return <Calendar className="w-4 h-4" />
                      case 'results':
                        return <FileText className="w-4 h-4" />
                      case 'notifications':
                        return <Bell className="w-4 h-4" />
                      case 'communication':
                        return <MessageCircle className="w-4 h-4" />
                      case 'progress':
                        return <Activity className="w-4 h-4" />
                      default:
                        return <Home className="w-4 h-4" />
                    }
                  })()}
                </Icon>
                <span className={`font-medium transition-all duration-200 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
                }`}>{it.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className={`w-full p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium flex items-center justify-center gap-3 ${
            isOpen ? 'text-base' : 'text-sm'
          }`}
        >
          <LogOut size={18} />
          <span className={`${isOpen ? 'inline' : 'hidden'}`}>Logout</span>
        </button>
      </aside>
    </>
  )
}
