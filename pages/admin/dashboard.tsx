import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-chartjs-2').then(m=>m.Line), { ssr: false }) as any

export default function AdminDashboard(){
  const data = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{ 
      label: 'Attendance', 
      data: [92,95,90,93,94,92], 
      borderColor: '#16a34a', 
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Students" value={842} />
        <StatCard title="Teachers" value={36} />
        <StatCard title="Classes" value={24} />
        <StatCard title="Revenue" value={'KES 1,590,800'} />
      </div>

      <div className="card p-6 md:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">School Analytics</h3>
        <div className="mt-4" style={{ height: '200px' }}><Chart data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
      </div>
    </Layout>
  )
}
