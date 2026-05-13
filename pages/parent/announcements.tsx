import Layout from '../../components/Layout'
import { useDashboardSummary } from '../../src/useDashboardSummary'

export default function ParentAnnouncementsPage() {
  const { data, loading, error } = useDashboardSummary('parent')
  const announcements = data?.announcements || []

  return (
    <Layout role="parent">
      <div className="md:col-span-3 card p-6">
        <h2 className="text-xl font-semibold text-gray-900">School Announcements</h2>
        <p className="text-sm text-gray-600 mt-1">Live notices from the school dashboard.</p>
        {loading && <p className="text-sm text-gray-500 mt-4">Loading announcements...</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="space-y-3">
          {(announcements.length ? announcements : []).map((announcement, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">{announcement.title}</p>
              <p className="text-xs text-green-700 mt-1">{announcement.body}</p>
            </div>
          ))}
          {announcements.length === 0 && !loading && <p className="text-sm text-gray-500">No active announcements available.</p>}
        </div>
      </div>
    </Layout>
  )
}
