'use client';

import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import {
  Home,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Users,
  BarChart2,
  BookOpen,
  CalendarCheck,
  User,
  DollarSign,
  Settings,
  FileText,
  Megaphone,
  Clipboard,
  Edit3,
  MessageCircle,
  Calendar,
  Bell,
  Activity,
} from 'lucide-react'
import { clearAuthSession, type UserRole } from '../src/auth'
import { getRoleMenuItems } from '../src/navigation'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-11 h-11 rounded-[18px] flex items-center justify-center text-white transition-colors">
    <div className="w-full h-full rounded-[18px] flex items-center justify-center bg-white/10 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
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

      <aside
        className={`${isOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-[#091c47] via-[#123a78] to-[#0d4b7d] p-5 md:p-6 text-white shadow-[0_18px_60px_-28px_rgba(8,15,40,0.95)] transition-all duration-300 fixed md:sticky md:top-0 md:left-0 h-screen z-40 flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className={`flex items-center gap-4 flex-1 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'} transition-opacity`}>
            <div className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center flex-shrink-0 shadow-[0_14px_32px_-18px_rgba(255,255,255,0.5)] border border-white/5">
              <Home className="w-6 h-6 text-[#0b1f4d]" />
            </div>
            <div>
              <div className="font-semibold text-[28px] leading-none tracking-[-0.03em]">Academy</div>
              <div className="mt-1 text-sm text-white/70">Portal</div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden md:flex items-center justify-center flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronDown
              size={20}
              className={`transform transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
        </div>

        <nav className="space-y-4 flex-1 overflow-y-auto pt-1">
          {items.map((it) => {
            const active = router.asPath === it.href || router.pathname === it.href

            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-4 p-4 rounded-[22px] transition-colors ${active ? 'bg-white/10 font-semibold ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_-24px_rgba(8,15,40,0.8)]' : 'hover:bg-white/10'}`}
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
                <span className={`text-[17px] font-medium leading-snug transition-all duration-200 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'}`}>
                  {it.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className={`w-full p-4 rounded-[18px] bg-white/10 hover:bg-white/20 transition-colors text-white font-medium flex items-center justify-center gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${isOpen ? 'text-base' : 'text-sm'}`}
        >
          <LogOut size={18} />
          <span className={`${isOpen ? 'inline' : 'hidden'}`}>Logout</span>
        </button>
      </aside>
    </>
  )
}
