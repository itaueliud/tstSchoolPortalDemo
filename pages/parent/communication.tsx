import Layout from '../../components/Layout'
import { useDashboardSummary } from '../../src/useDashboardSummary'

export default function ParentCommunicationPage() {
  const { data, loading, error } = useDashboardSummary('parent')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">Teacher Communication</h2>
        <p className="text-sm text-gray-600 mt-1">Contact details are limited to the linked child profile and school office guidance.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading communication details...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Child</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.child_name || 'No child linked')}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs text-gray-500">Class Teacher</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{String(summaryValues.class_teacher || 'Available from class profile')}</p>
      </div>

      <div className="md:col-span-2 card p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">How to reach the school</p>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Use the school office for official communication and fee queries.</p>
          <p>Use the announcements page for school-wide updates and notices.</p>
          <p>For class-specific guidance, contact the class teacher during school hours.</p>
        </div>
      </div>
    </Layout>
  )
}
