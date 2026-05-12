import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, role }: { children: React.ReactNode, role: string }){
  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      <Sidebar role={role} />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8">
        <Topbar role={role} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {children}
        </div>
      </main>
    </div>
  )
}
