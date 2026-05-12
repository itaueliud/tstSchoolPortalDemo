import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'

export default function ParentDashboard(){
  return (
    <Layout role="parent">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Child Name" value={'Alex Doe'} />
        <StatCard title="Attendance" value={'95%'} />
        <StatCard title="Fees Due" value={'KES 0'} />
        <StatCard title="Latest Grade" value={'A-'} />
      </div>

      <div className="card p-4 md:col-span-1">
        <h3 className="text-sm text-white/70">Messages</h3>
        <div className="mt-4 text-white/70">No unread messages</div>
      </div>
    </Layout>
  )
}
