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

      <div className="card p-4 md:col-span-1">
        <h3 className="text-sm text-white/70">Quick Actions</h3>
        <div className="mt-4 space-y-2">
          <button className="w-full p-2 rounded bg-neon text-navy">Mark Attendance</button>
          <button className="w-full p-2 rounded bg-white/6">Upload Assignment</button>
        </div>
      </div>
    </Layout>
  )
}
