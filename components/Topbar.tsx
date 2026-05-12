import React from 'react'
import { useTheme } from '../src/theme'
import { Bell, LogOut } from 'lucide-react'

export default function Topbar({ role }: { role: string }){
  const { dark, toggle } = useTheme()
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">{role} Dashboard</div>
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          {dark? '☀️' : '🌙'}
        </button>
        <div className="relative">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="text-sm text-gray-900 font-medium">John {role.charAt(0).toUpperCase() + role.slice(1)}</div>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
