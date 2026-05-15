'use client'

import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { requestBlob, requestJson } from '../../src/apiClient'
import '../../src/chart'
import { Bar, Line } from 'react-chartjs-2'
import {
  BarChart3,
  Building2,
  Download,
  Filter,
  Printer,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react'

type AnalyticsRow = {
  month: string
  attendance: number
  revenue: number
}

type ClassBreakdownRow = {
  id: string
  name: string
  grade_level: string
  room: string
  class_teacher: string
  student_count: number
  attendance_rate: number
  revenue: number
  outstanding_balance: number
  selected?: boolean
}

type FilterClass = {
  id: string
  name: string
  grade_level: string
  room: string
}

type AdminStatsResponse = {
  summary: {
    students: number
    teachers: number
    classes: number
    revenue: string
    pending_balance: string
    attendance_rate: number
  }
  analytics: AnalyticsRow[]
  class_breakdown: ClassBreakdownRow[]
  selected_class?: ClassBreakdownRow | null
  filters: {
    year: number
    class_id: string
    available_years: number[]
    available_classes: FilterClass[]
  }
}

const currentYear = new Date().getFullYear()

const emptySummary = {
  students: 0,
  teachers: 0,
  classes: 0,
  revenue: '0',
  pending_balance: '0',
  attendance_rate: 0,
}

function formatCurrency(value: number | string) {
  const numericValue = typeof value === 'string' ? Number(value.replace(/,/g, '')) : value
  if (!Number.isFinite(numericValue)) return 'KES 0'
  return `KES ${numericValue.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase()
}

export default function AdminStatsPage() {
  const [year, setYear] = useState(currentYear)
  const [classId, setClassId] = useState('')
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear])
  const [availableClasses, setAvailableClasses] = useState<FilterClass[]>([])
  const [summary, setSummary] = useState(emptySummary)
  const [monthlyRows, setMonthlyRows] = useState<AnalyticsRow[]>([])
  const [classBreakdown, setClassBreakdown] = useState<ClassBreakdownRow[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassBreakdownRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const query = new URLSearchParams()
        query.set('year', String(year))
        if (classId) {
          query.set('class_id', classId)
        }

        const response = await requestJson<AdminStatsResponse>(`/api/dashboard/admin/stats/?${query.toString()}`)
        if (!active) return

        setSummary(response.summary || emptySummary)
        setMonthlyRows(response.analytics || [])
        setClassBreakdown(response.class_breakdown || [])
        setSelectedClass(response.selected_class || null)
        setAvailableYears(response.filters?.available_years || [currentYear])
        setAvailableClasses(response.filters?.available_classes || [])

        if (response.filters?.year && response.filters.year !== year) {
          setYear(response.filters.year)
        }

        if (typeof response.filters?.class_id === 'string' && response.filters.class_id !== classId) {
          setClassId(response.filters.class_id)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load admin stats')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [classId, year, refreshNonce])

  const summaryCards = useMemo(() => ([
    { label: 'Students', value: summary.students, accent: 'bg-emerald-500' },
    { label: 'Teachers', value: summary.teachers, accent: 'bg-sky-500' },
    { label: 'Classes', value: summary.classes, accent: 'bg-slate-500' },
    { label: 'Revenue', value: formatCurrency(summary.revenue), accent: 'bg-teal-500' },
    { label: 'Outstanding', value: formatCurrency(summary.pending_balance), accent: 'bg-amber-500' },
    { label: 'Attendance', value: `${summary.attendance_rate}%`, accent: 'bg-green-600' },
  ]), [summary])

  const monthlyChartData = useMemo(() => ({
    labels: monthlyRows.map((item) => item.month),
    datasets: [
      {
        label: 'Attendance %',
        data: monthlyRows.map((item) => item.attendance),
        borderColor: 'rgba(22, 163, 74, 1)',
        backgroundColor: 'rgba(22, 163, 74, 0.16)',
        pointBackgroundColor: 'rgba(22, 163, 74, 1)',
        fill: true,
        tension: 0.35,
        yAxisID: 'attendance',
      },
      {
        label: 'Revenue (KES)',
        data: monthlyRows.map((item) => item.revenue),
        borderColor: 'rgba(14, 165, 233, 1)',
        backgroundColor: 'rgba(14, 165, 233, 0.16)',
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        fill: false,
        tension: 0.35,
        yAxisID: 'revenue',
      },
    ],
  }), [monthlyRows])

  const monthlyChartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label(context: { dataset: { label?: string }; parsed: { y: number } }) {
            const label = context.dataset.label || ''
            if (label.includes('Revenue')) {
              return `${label}: ${formatCurrency(context.parsed.y)}`
            }
            return `${label}: ${context.parsed.y}%`
          },
        },
      },
    },
    scales: {
      attendance: {
        type: 'linear' as const,
        position: 'left' as const,
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      revenue: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          callback(value: string | number) {
            return formatCurrency(Number(value))
          },
        },
      },
    },
  }

  const classChartData = useMemo(() => ({
    labels: classBreakdown.slice(0, 8).map((item) => item.name),
    datasets: [
      {
        label: 'Attendance %',
        data: classBreakdown.slice(0, 8).map((item) => item.attendance_rate),
        backgroundColor: classBreakdown.slice(0, 8).map((item) => item.selected ? 'rgba(14, 165, 233, 0.92)' : 'rgba(22, 163, 74, 0.82)'),
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  }), [classBreakdown])

  const classChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
    },
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      const query = new URLSearchParams()
      query.set('year', String(year))
      if (classId) {
        query.set('class_id', classId)
      }

      const blob = await requestBlob(`/api/reports/admin-stats/pdf/?${query.toString()}`)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const classLabel = selectedClass?.name || availableClasses.find((item) => item.id === classId)?.name || 'all-classes'
      anchor.href = url
      anchor.download = `admin-analytics-${year}-${sanitizeFileName(classLabel)}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Unable to download PDF report')
    } finally {
      setPdfLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefresh = () => {
    setError('')
    setRefreshNonce((current) => current + 1)
  }

  return (
    <Layout role="admin">
      <div className="admin-stats-report md:col-span-3 space-y-6">
        <section className="no-print rounded-[28px] bg-gradient-to-r from-[#0b1f4d] via-[#123a78] to-[#0d4b7d] text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.75)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Admin analytics
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">School Stats</h1>
                  <p className="mt-2 max-w-xl text-sm md:text-base text-white/75">
                    Production analytics for revenue, attendance, and class-level performance with server-backed filtering.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[440px]">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0b1f4d] transition hover:bg-slate-100 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {pdfLoading ? 'Preparing...' : 'PDF Export'}
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white/80">
                  {year}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
                <Filter className="h-4 w-4 text-white/70" />
                <span className="sr-only">Year</span>
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="w-full bg-transparent text-white outline-none"
                >
                  {availableYears.map((availableYear) => (
                    <option key={availableYear} value={availableYear} className="text-slate-900">
                      {availableYear}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm xl:col-span-2">
                <Building2 className="h-4 w-4 text-white/70" />
                <span className="sr-only">Class</span>
                <select
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option value="" className="text-slate-900">All classes</option>
                  {availableClasses.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id} className="text-slate-900">
                      {schoolClass.name}{schoolClass.grade_level ? ` · ${schoolClass.grade_level}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-white/55">Selected view</div>
                <div className="mt-1 font-semibold text-white">
                  {selectedClass?.name || 'All classes'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading && <div className="text-sm text-slate-500">Loading admin stats from backend...</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="card print-card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${card.accent} shadow-[0_12px_28px_-16px_rgba(15,23,42,0.55)]`} />
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <article className="card print-card rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Monthly performance</h2>
                <p className="text-sm text-slate-500">Attendance and revenue trends for the selected year.</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-h-[320px]">
              <Line data={monthlyChartData} options={monthlyChartOptions} />
            </div>
          </article>

          <article className="card print-card rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Class comparison</h2>
                <p className="text-sm text-slate-500">Attendance rate by class for the selected year.</p>
              </div>
                <Building2 className="h-5 w-5 text-sky-600" />
            </div>
            <div className="min-h-[320px]">
              <Bar data={classChartData} options={classChartOptions} />
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="card print-card rounded-[28px] p-6">
            <h2 className="text-lg font-semibold text-slate-900">Monthly breakdown</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Month</th>
                    <th className="px-3 py-3 font-medium">Attendance</th>
                    <th className="px-3 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map((row) => (
                    <tr key={row.month} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-900">{row.month}</td>
                      <td className="px-3 py-3 text-slate-700">{row.attendance}%</td>
                      <td className="px-3 py-3 text-slate-700">{formatCurrency(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card print-card rounded-[28px] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Class-level breakdown</h2>
              <p className="text-sm text-slate-500">Live class metrics with attendance and financial performance.</p>
            </div>

            <div className="space-y-3">
              {classBreakdown.map((schoolClass) => (
                <div
                  key={schoolClass.id}
                  className={`rounded-2xl border p-4 transition ${schoolClass.selected ? 'border-sky-200 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{schoolClass.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {schoolClass.grade_level || 'No grade level'}{schoolClass.room ? ` · ${schoolClass.room}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{schoolClass.class_teacher || 'No class teacher assigned'}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {schoolClass.student_count} students
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Attendance</div>
                      <div className="mt-1 font-semibold text-slate-900">{schoolClass.attendance_rate}%</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Revenue</div>
                      <div className="mt-1 font-semibold text-slate-900">{formatCurrency(schoolClass.revenue)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Outstanding</div>
                      <div className="mt-1 font-semibold text-slate-900">{formatCurrency(schoolClass.outstanding_balance)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Focus</div>
                      <div className="mt-1 font-semibold text-slate-900">{schoolClass.selected ? 'Selected' : 'Compare'}</div>
                    </div>
                  </div>
                </div>
              ))}

              {!classBreakdown.length && !loading && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No class breakdown data available for this year.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </Layout>
  )
}