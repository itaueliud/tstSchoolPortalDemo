import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-lg flex items-center justify-center neon-glow bg-white/4">{children}</div>
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
    <aside className="w-72 bg-gradient-to-b from-transparent to-black/10 p-4 hidden md:block">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-white/6 neon-glow flex items-center justify-center">T</div>
        <div>
          <div className="font-semibold">Greenfield Academy</div>
          <div className="text-sm text-white/60">School Portal</div>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/6 transition-colors ${router.pathname === it.href ? 'bg-white/8' : ''}`}>
            <Icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18" strokeWidth="1.5"/></svg>
            </Icon>
            <span className="font-medium">{it.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
