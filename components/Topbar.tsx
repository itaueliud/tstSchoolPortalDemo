import React from 'react'
import { useTheme } from '../src/theme'

export default function Topbar({ role }: { role: string }){
  const { dark, toggle } = useTheme()
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-white/4 rounded-t-xl">
      <div className="flex items-center gap-4">
        <button className="md:hidden px-3 py-2 bg-white/6 rounded-lg">☰</button>
        <div className="text-sm text-white/70">{role.toUpperCase()} DASHBOARD</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-md bg-white/6">{dark? 'Light' : 'Dark'}</button>
        <div className="relative">
          <button className="p-2 rounded-md bg-white/6">🔔<span className="absolute -top-1 -right-1 bg-neon text-navy text-xs px-1 rounded-full">3</span></button>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-md bg-white/6">
          <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="text-sm">John Teacher</div>
        </div>
      </div>
    </header>
  )
}
