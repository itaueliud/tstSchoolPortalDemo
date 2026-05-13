import Layout from '../../components/Layout'
import { useDashboardSummary } from '../../src/useDashboardSummary'

export default function ParentProgressPage() {
  const { data, loading, error } = useDashboardSummary('parent')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">Academic Progress</h2>
        <p className="text-sm text-gray-600 mt-1">Live progress snapshot for the linked child account.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading progress data...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Child</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.child_name || 'No child linked')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Class</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.child_class || 'N/A')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Admission Number</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.admission_number || 'N/A')}</p>
      </div>

      <div className="md:col-span-2 card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Performance Snapshot</p>
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 border border-green-100 p-3">
            <p className="text-xs text-green-700 font-semibold">Current GPA</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{String(summaryValues.latest_grade || 'N/A')}</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700 font-semibold">Attendance</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{String(summaryValues.attendance || '0%')}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Next Steps</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Review recent report cards from the school office.</li>
          <li>Monitor attendance alerts from the dashboard.</li>
          <li>Use the fees page to confirm receipts and outstanding balances.</li>
        </ul>
      </div>
    </Layout>
  )
}
