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

      <div className="card p-6 md:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        <div className="mt-4 py-8 text-center text-gray-500">
          <p className="text-sm">No unread messages</p>
        </div>
      </div>
    </Layout>
  )
}
