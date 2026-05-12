import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'

export default function TeacherDashboard(){
  return (
    <Layout role="teacher">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="My Classes" value={3} />
        <StatCard title="Students" value={120} />
        <StatCard title="Assignments" value={8} />
        <StatCard title="Pending Grades" value={14} />
      </div>

      <div className="card p-6 md:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-md transition-shadow">
            📋 Mark Attendance
          </button>
          <button className="w-full p-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            📤 Upload Assignment
          </button>
        </div>
      </div>
    </Layout>
  )
}
