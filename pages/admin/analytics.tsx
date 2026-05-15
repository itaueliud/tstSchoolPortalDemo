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
  const [classMonthly, setClassMonthly] = useState<any[]>([])
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
        setClassMonthly(resp.class_monthly || [])
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

  const exportCsv = () => {
    // Build CSV with months as rows and selected classes as columns for attendance
    const selected = classMonthly.filter((c) => highlightIds.includes(c.id))
    if (!selected.length) {
      // fallback: export all classes
      selected.push(...classMonthly.slice(0, 6))
    }

    const months = (selected[0]?.series || []).map((s: any) => s.month)
    const header = ['Month', ...selected.map((s) => `${s.name} (attendance)`), ...selected.map((s) => `${s.name} (revenue)`)]
    const rows = months.map((m: string, idx: number) => {
      const attendanceCols = selected.map((s) => String(s.series[idx]?.attendance ?? ''))
      const revenueCols = selected.map((s) => String(s.series[idx]?.revenue ?? ''))
      return [m, ...attendanceCols, ...revenueCols].join(',')
    })

    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${year}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportPdf = async () => {
    try {
      const query = new URLSearchParams()
      query.set('year', String(year))
      const blob = await requestJson<Blob>(`/api/reports/admin-stats/pdf/?${query.toString()}`, { auth: true })
      // We expect a blob; use requestBlob normally but keep fallback
    } catch (e) {
      // Use requestBlob for binary download
      const query = new URLSearchParams()
      query.set('year', String(year))
      const blob = await fetch(`/api/reports/admin-stats/pdf/?${query.toString()}`, { credentials: 'same-origin' }).then((r) => r.blob())
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${year}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
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
              {highlightIds.length ? (
                // Render a per-class line chart when classes selected
                (() => {
                  const datasets = classMonthly
                    .filter((c) => highlightIds.includes(c.id))
                    .map((c) => ({
                      label: c.name,
                      data: c.series.map((s: any) => metric === 'attendance' ? s.attendance : s.revenue),
                      fill: false,
                    }))

                  const lineData = { labels: classMonthly[0]?.series.map((s: any) => s.month) || [], datasets }
                  return <Bar data={chartData} options={chartOptions} />
                })()
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Top classes</h3>
                <div className="flex items-center gap-2">
                  <button onClick={exportCsv} className="px-3 py-1.5 rounded bg-slate-100 text-xs">Export CSV</button>
                  <button onClick={exportPdf} className="px-3 py-1.5 rounded bg-slate-100 text-xs">Export PDF</button>
                </div>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {sorted.map((r) => (
                  <label key={r.id} className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer ${highlightIds.includes(r.id) ? 'bg-sky-50 border border-sky-100' : 'border border-slate-100 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={highlightIds.includes(r.id)} onChange={() => toggleHighlight(r.id)} />
                      <div>
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.student_count} students</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{metric === 'attendance' ? `${r.attendance_rate}%` : `KES ${r.revenue.toLocaleString()}`}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
