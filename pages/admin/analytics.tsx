'use client'

import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import '../../src/chart'
import { Bar } from 'react-chartjs-2'
import { requestJson } from '../../src/apiClient'
import { Building2, Filter, RefreshCcw } from 'lucide-react'

type FilterClass = { id: string; name: string; grade_level: string; room: string }
type ClassRow = { id: string; name: string; student_count: number; attendance_rate: number; revenue: number; outstanding_balance: number }

export default function AdminAnalyticsPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<number>(currentYear)
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear])
  const [availableClasses, setAvailableClasses] = useState<FilterClass[]>([])
  const [classRows, setClassRows] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metric, setMetric] = useState<'attendance' | 'revenue'>('attendance')
  const [highlightIds, setHighlightIds] = useState<string[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const resp = await requestJson<any>(`/api/dashboard/admin/stats/?year=${year}`)
        if (!active) return
        setAvailableYears(resp.filters?.available_years || [currentYear])
        setAvailableClasses(resp.filters?.available_classes || [])
        setClassRows((resp.class_breakdown || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          student_count: r.student_count,
          attendance_rate: r.attendance_rate,
          revenue: r.revenue,
          outstanding_balance: r.outstanding_balance,
        })))
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Unable to load analytics')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [year])

  const sorted = useMemo(() => {
    return [...classRows].sort((a, b) => {
      if (metric === 'attendance') return b.attendance_rate - a.attendance_rate
      return b.revenue - a.revenue
    })
  }, [classRows, metric])

  const chartData = useMemo(() => ({
    labels: sorted.map((r) => r.name),
    datasets: [
      {
        label: metric === 'attendance' ? 'Attendance %' : 'Revenue (KES)',
        data: sorted.map((r) => metric === 'attendance' ? r.attendance_rate : r.revenue),
        backgroundColor: sorted.map((r) => highlightIds.includes(r.id) ? 'rgba(14,165,233,0.9)' : 'rgba(99,102,241,0.8)'),
        borderRadius: 8,
      },
    ],
  }), [sorted, metric, highlightIds])

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }

  const toggleHighlight = (id: string) => {
    setHighlightIds((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Filter className="h-3.5 w-3.5" />
              School Analytics
            </div>
            <h2 className="text-lg font-semibold">Class Comparison</h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-white text-sm">
              <Building2 className="h-4 w-4 text-slate-600" />
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent outline-none">
                {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <button onClick={() => setMetric((m) => m === 'attendance' ? 'revenue' : 'attendance')} className="px-3 py-2 rounded-lg border bg-white text-sm">Toggle metric</button>
            <button onClick={() => { setHighlightIds([]); setClassRows((c) => [...c]) }} className="px-3 py-2 rounded-lg border bg-white text-sm inline-flex items-center gap-2"><RefreshCcw className="h-4 w-4" /> Reset</button>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading analytics…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 card p-4">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-3">Top classes</h3>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {sorted.map((r) => (
                  <div key={r.id} className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${highlightIds.includes(r.id) ? 'bg-sky-50 border border-sky-100' : 'border border-slate-100 bg-white'}`} onClick={() => toggleHighlight(r.id)}>
                    <div>
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.student_count} students</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{metric === 'attendance' ? `${r.attendance_rate}%` : `KES ${r.revenue.toLocaleString()}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
