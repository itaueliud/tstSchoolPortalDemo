import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-chartjs-2').then(m=>m.Line), { ssr: false }) as any

export default function AdminDashboard(){
  const data = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{ label: 'Attendance', data: [92,95,90,93,94,92], borderColor: '#5BE12C', backgroundColor: 'rgba(91,225,44,0.08)' }]
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Students" value={842} />
        <StatCard title="Teachers" value={36} />
        <StatCard title="Classes" value={24} />
        <StatCard title="Revenue" value={'KES 1,590,800'} />
      </div>

      <div className="card p-4 md:col-span-1">
        <h3 className="text-sm text-white/70">School Analytics</h3>
        <div className="mt-4"><Chart data={data} /></div>
      </div>

    </Layout>
  )
}
