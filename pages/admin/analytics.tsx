'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminAnalyticsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/stats')
  }, [router])

  return null
}
