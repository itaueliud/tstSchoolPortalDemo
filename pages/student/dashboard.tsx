import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'

export default function StudentDashboard(){
  return (
    <Layout role="student">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Next Class" value={'Mathematics - 09:00 AM'} />
        <StatCard title="Attendance" value={'92%'} />
        <StatCard title="Fees Due" value={'KES 12,450'} />
        <StatCard title="Assignments" value={3} />
      </div>

      <div className="card p-4 md:col-span-1">
        <h3 className="text-sm text-white/70">Recent Announcements</h3>
        <ul className="mt-4 space-y-2 text-white/70">
          <li>PTA Meeting this Saturday</li>
          <li>Exams start next month</li>
        </ul>
      </div>
    </Layout>
  )
}
