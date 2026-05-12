import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Home } from 'lucide-react'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">{children}</div>
)

export default function Sidebar({ role }: { role: string }) {
  const router = useRouter()
  const items = [
    { label: 'Dashboard', href: `/${role}/dashboard` },
    { label: 'Students', href: `/${role}/students` },
    { label: 'Attendance', href: `/${role}/attendance` },
    { label: 'Fees', href: `/${role}/fees` },
  ]

  return (
    <aside className="w-72 bg-gradient-to-b from-green-600 to-emerald-600 p-6 hidden md:block text-white shadow-lg">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
          <Home className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <div className="font-bold text-lg">Greenfield Academy</div>
          <div className="text-sm text-white/80">Portal</div>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            router.pathname === it.href 
              ? 'bg-white/25 font-semibold' 
              : 'hover:bg-white/15'
          }`}>
            <Icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18" strokeWidth="2"/></svg>
            </Icon>
            <span className="font-medium">{it.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
