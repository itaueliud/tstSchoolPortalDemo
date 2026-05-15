'use client'

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import ChartJS from '../../src/chart'
import { Line } from 'react-chartjs-2'
import { requestJson } from '../../src/apiClient'
import { BarChart3 } from 'lucide-react'

type AnalyticsRow = { month: string; attendance: number; revenue: number }

export default function AdminStatsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const resp = await requestJson<{ analytics: AnalyticsRow[] }>('/api/dashboard/admin/overview/')
        if (!active) return
        setRows(resp.analytics || [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load analytics')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const labels = rows.map((r) => r.month)
  const attendanceData = rows.map((r) => r.attendance)
  const revenueData = rows.map((r) => r.revenue)

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Attendance %',
        data: attendanceData,
        fill: true,
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(16,185,129,0.9)',
        tension: 0.3,
      },
      {
        label: 'Revenue (KES, scaled)',
        data: revenueData,
        fill: false,
        borderColor: 'rgba(14,165,233,0.9)',
        backgroundColor: 'rgba(14,165,233,0.12)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  }

  const options: any = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Attendance %' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Revenue' } },
    },
  }

  const exportCsv = () => {
    const header = ['Month', 'Attendance', 'Revenue']
    const lines = [header.join(','), ...rows.map((r) => [r.month, String(r.attendance), String(r.revenue)].join(','))]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'admin-analytics.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">School Analytics</h3>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading analytics…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <Line data={lineData} options={options} />
            </div>

            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Monthly data</h4>
              <div className="flex gap-2">
                <button onClick={exportCsv} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded">Export CSV</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-right p-2">Attendance %</th>
                    <th className="text-right p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.month} className="border-b hover:bg-gray-50">
                      <td className="p-2">{r.month}</td>
                      <td className="p-2 text-right">{r.attendance}</td>
                      <td className="p-2 text-right">KES {r.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
