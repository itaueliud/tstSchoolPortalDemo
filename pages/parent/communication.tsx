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

type ParentCommunication = {
  office?: {
    name?: string
    phone_number?: string
    email?: string
    hours?: string
  }
  parent?: {
    name?: string
    email?: string
    phone_number?: string
  }
  active_child?: {
    id?: string
    name?: string
    admission_number?: string
    class_name?: string
    class_teacher?: string
  }
  children?: Array<{
    id?: string
    name?: string
    admission_number?: string
    class_name?: string
    class_teacher?: string
    primary_contact?: string
  }>
  notes?: string[]
}

export default function ParentCommunicationPage() {
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

  const communication = (summaryValues.communication || {}) as ParentCommunication
  const office = communication.office || {}
  const parentContact = communication.parent || {}
  const activeChildContact = communication.active_child || activeChild || {}
  const notes = communication.notes || []

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">Teacher Communication</h2>
        <p className="text-sm text-gray-600 mt-1">Structured contact details are loaded from the backend for the selected child and the school office.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading communication details...</p>}
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
        <p className="text-xs text-gray-500">School Office</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(office.name || 'School Office')}</p>
        <p className="text-sm text-gray-600 mt-1">{String(office.phone_number || 'Phone not configured')}</p>
        <p className="text-sm text-gray-600 mt-1">{String(office.email || 'Email not configured')}</p>
        <p className="text-xs text-gray-500 mt-2">{String(office.hours || 'Mon-Fri 8:00 AM - 5:00 PM')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Parent Contact</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(parentContact.name || summaryValues.child_name || 'No child linked')}</p>
        <p className="text-sm text-gray-600 mt-1">{String(parentContact.phone_number || 'Phone not available')}</p>
        <p className="text-sm text-gray-600 mt-1">{String(parentContact.email || 'Email not available')}</p>
      </div>

      <div className="md:col-span-2 card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Selected Child Contact Path</p>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Child: {String(activeChildContact.name || activeChild?.name || 'No child linked')}</p>
          <p>Admission Number: {String(activeChildContact.admission_number || activeChild?.admission_number || 'N/A')}</p>
          <p>Class Teacher: {String(activeChildContact.class_teacher || activeChild?.class_teacher || 'Available from class profile')}</p>
          <p>Primary Contact: {String(activeChildContact.primary_contact || 'School office')}</p>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Notes</p>
        <div className="space-y-2 text-sm text-gray-700">
          {(notes.length ? notes : ['No communication notes available.']).map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </div>
    </Layout>
  )
}
