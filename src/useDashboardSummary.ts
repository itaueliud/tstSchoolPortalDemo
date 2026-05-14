'use client'

import { useEffect, useState } from 'react'
import { requestJson } from './apiClient'
import type { UserRole } from './auth'

export type DashboardAnnouncement = {
  id?: string
  title: string
  body: string
  audience?: string
  published_at?: string
}

export type DashboardSummary = {
  [key: string]: unknown
}

export type DashboardResponse = {
  role: UserRole
  summary: DashboardSummary
  announcements: DashboardAnnouncement[]
}

export function useDashboardSummary(role: UserRole, childId = '') {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const query = role === 'parent' && childId ? `?child_id=${encodeURIComponent(childId)}` : ''
        const response = await requestJson<DashboardResponse>(`/api/dashboard/${role}/summary/${query}`)
        if (active) {
          setData(response)
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard data')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [role, childId])

  return { data, loading, error }
}