import Layout from '../../components/Layout'
import { useDashboardSummary } from '../../src/useDashboardSummary'

export default function ParentAttendancePage() {
  const { data, loading, error } = useDashboardSummary('parent')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">Attendance Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Live attendance snapshot for the linked child account.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading attendance data...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Attendance Rate</p>
        <p className="text-3xl font-bold text-green-700 mt-1">{String(summaryValues.attendance || '0%')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Current Class</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.child_class || 'N/A')}</p>
      </div>

      <div className="md:col-span-2 card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Attendance Notes</p>
        <div className="space-y-3 text-sm text-gray-700">
          <p>Attendance is updated from the school register and summarized on the parent dashboard.</p>
          <p>Any attendance concerns should be raised with the class teacher or school office.</p>
          <p>Use the announcements page for school-wide notices and schedule changes.</p>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Quick Summary</p>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Admission Number: {String(summaryValues.admission_number || 'N/A')}</p>
          <p>Child: {String(summaryValues.child_name || 'No child linked')}</p>
        </div>
      </div>
    </Layout>
  )
}
