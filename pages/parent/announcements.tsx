'use client'

import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { useDashboardSummary } from '../../src/useDashboardSummary'

type ParentChildSummary = {
  id: string
  name: string
  admission_number: string
  class_name: string
  class_teacher: string
  attendance: string
  fees_due: string
  latest_grade: string
  gpa: string
}

export default function ParentAnnouncementsPage() {
  const [selectedChildId, setSelectedChildId] = useState('')
  const { data, loading, error } = useDashboardSummary('parent', selectedChildId)
  const announcements = data?.announcements || []
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, any>
  const children = Array.isArray(summaryValues.children) ? summaryValues.children as ParentChildSummary[] : []

  useEffect(() => {
    if (!children.length) {
      setSelectedChildId('')
      return
    }

    if (!selectedChildId || !children.some((child) => child.id === selectedChildId)) {
      setSelectedChildId(String(summaryValues.active_child_id || summaryValues.primary_child_id || children[0].id))
    }
  }, [children, selectedChildId, summaryValues.active_child_id, summaryValues.primary_child_id])

  const activeChild = useMemo(() => {
    if (!children.length) {
      return null
    }

    return children.find((child) => child.id === selectedChildId) || children[0]
  }, [children, selectedChildId])

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">School Announcements</h2>
        <p className="text-sm text-gray-600 mt-1">Live notices from the school dashboard.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading announcements...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {children.length > 1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select child context</label>
            <select value={selectedChildId} onChange={(event) => setSelectedChildId(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm md:max-w-md">
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.name} · {child.class_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Context</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(activeChild?.name || summaryValues.child_name || 'No child linked')}</p>
        <p className="text-sm text-gray-600 mt-1">{String(activeChild?.class_name || summaryValues.child_class || 'N/A')} · {String(activeChild?.class_teacher || summaryValues.class_teacher || 'N/A')}</p>
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="space-y-3">
          {(announcements.length ? announcements : []).map((announcement, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">{announcement.title}</p>
              <p className="text-xs text-green-700 mt-1">{announcement.body}</p>
            </div>
          ))}
          {announcements.length === 0 && !loading && <p className="text-sm text-gray-500">No active announcements available right now.</p>}
        </div>
      </div>
    </Layout>
  )
}
