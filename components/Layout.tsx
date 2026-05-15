'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { getAuthSession, type UserRole } from '../src/auth'

export default function Layout({ children, role }: { children: React.ReactNode, role: UserRole }){
  const router = useRouter()

  useEffect(() => {
    const session = getAuthSession()
    if (!session || !session.token) {
      router.replace('/login')
      return
    }

    if (session.role !== role) {
      router.replace(`/${session.role}/dashboard`)
    }
  }, [role, router])

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      <Sidebar role={role} />
      <main className="flex-1 pt-16 md:pt-0 pl-16 md:pl-0 p-4 md:p-8">
        <Topbar role={role} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {children}
        </div>
      </main>
    </div>
  )
}
