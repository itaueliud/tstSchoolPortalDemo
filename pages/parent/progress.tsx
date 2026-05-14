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

export default function ParentProgressPage() {
  const [selectedChildId, setSelectedChildId] = useState('')
  const { data, loading, error } = useDashboardSummary('parent', selectedChildId)
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
        <h2 className="text-xl font-semibold text-gray-900">Academic Progress</h2>
        <p className="text-sm text-gray-600 mt-1">Live progress snapshot for the linked child account.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading progress data...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {children.length > 1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select child</label>
            <select value={selectedChildId} onChange={(event) => setSelectedChildId(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm md:max-w-md">
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.name} · {child.class_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Child</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(activeChild?.name || summaryValues.child_name || 'No child linked')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Class</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(activeChild?.class_name || summaryValues.child_class || 'N/A')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Admission Number</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(activeChild?.admission_number || summaryValues.admission_number || 'N/A')}</p>
      </div>

      <div className="md:col-span-2 card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Performance Snapshot</p>
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 border border-green-100 p-3">
            <p className="text-xs text-green-700 font-semibold">Current GPA</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{String(activeChild?.latest_grade || summaryValues.latest_grade || 'N/A')}</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700 font-semibold">Attendance</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{String(activeChild?.attendance || summaryValues.attendance || '0%')}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Next Steps</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Review recent report cards from the school office for the selected child.</li>
          <li>Monitor attendance alerts from the dashboard and attendance page.</li>
          <li>Use the fees page to confirm receipts and outstanding balances.</li>
        </ul>
      </div>
    </Layout>
  )
}
