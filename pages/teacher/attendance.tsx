import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { CalendarDays, CheckCircle2, Clock3, MinusCircle, Users, ListChecks } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { requestJson } from '../../src/apiClient'

type AttendanceClass = {
  id: string
  name: string
  grade_level: string
  room: string
  class_teacher: string
  student_count: number
}

type AttendanceStudent = {
  id: string
  name: string
  admission_number: string
  class_name: string
  attendance_rate: number
}

type AttendanceRecord = {
  id: string
  student_id: string
  student_name: string
  admission_number: string
  school_class_id: string
  school_class: string
  date: string
  status: 'present' | 'absent' | 'late' | 'leave'
}

type AttendanceSummary = {
  total: number
  present: number
  late: number
  absent: number
  leave: number
  attendance_rate: number
}

type AttendanceContextResponse = {
  classes: AttendanceClass[]
  students: AttendanceStudent[]
  records: AttendanceRecord[]
  date: string
  summary: AttendanceSummary | null
}

type AttendanceHistoryResponse = {
  records: AttendanceRecord[]
  page: number
  page_size: number
  total_pages: number
}

const emptyStatusMap = (students: AttendanceStudent[]) => students.reduce<Record<string, AttendanceRecord['status']>>((acc, student) => {
  acc[student.id] = 'present'
  return acc
}, {})

const statusPalette: Record<AttendanceRecord['status'], string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  leave: 'bg-blue-100 text-blue-700',
}

export default function TeacherAttendancePage() {
  const { data, loading, error } = useDashboardSummary('teacher')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  const [classes, setClasses] = useState<AttendanceClass[]>([])
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceRecord['status']>>({})
  const [summaryData, setSummaryData] = useState<AttendanceSummary | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)

  const stats = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'My Classes', value: Number(summaryValues.classes) || 0 },
    { title: 'Students', value: Number(summaryValues.students) || 0 },
    { title: 'Assignments', value: Number(summaryValues.assignments) || 0 },
    { title: 'Pending Grades', value: Number(summaryValues.pending_grades) || 0 },
  ]), [summaryValues])

  useEffect(() => {
    let active = true

    const loadContext = async () => {
      setLoadingContext(true)
      setErrorMessage('')

      try {
        const query = new URLSearchParams()
        if (selectedClassId) query.set('school_class_id', selectedClassId)
        if (selectedDate) query.set('date', selectedDate)

        const response = await requestJson<AttendanceContextResponse>(`/api/dashboard/attendance/context/?${query.toString()}`)
        if (!active) return

        setClasses(response.classes)
        setStudents(response.students)
        setRecords(response.records)
        setSummaryData(response.summary)
        setStatusMap(response.students.length ? response.students.reduce<Record<string, AttendanceRecord['status']>>((acc, student) => {
          const existing = response.records.find((record) => record.student_id === student.id)
          acc[student.id] = existing?.status || 'present'
          return acc
        }, {}) : {})

        if (!selectedClassId && response.classes.length > 0) {
          setSelectedClassId(response.classes[0].id)
        }
      } catch (contextError) {
        if (active) {
          setErrorMessage(contextError instanceof Error ? contextError.message : 'Unable to load attendance context')
        }
      } finally {
        if (active) {
          setLoadingContext(false)
        }
      }
    }

    loadContext()

    return () => {
      active = false
    }
  }, [selectedClassId, selectedDate])

  useEffect(() => {
    if (!selectedClassId) return

    let active = true

    const loadHistory = async () => {
      setLoadingHistory(true)

      try {
        const query = new URLSearchParams({ page: String(historyPage), page_size: '8', school_class_id: selectedClassId, date: selectedDate })
        const response = await requestJson<AttendanceHistoryResponse>(`/api/dashboard/attendance/records/?${query.toString()}`)
        if (!active) return
        setHistory(response.records)
        setHistoryTotalPages(response.total_pages || 1)
      } catch {
        if (active) {
          setHistory([])
        }
      } finally {
        if (active) {
          setLoadingHistory(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [selectedClassId, selectedDate, historyPage])

  const refreshContext = async () => {
    const query = new URLSearchParams()
    if (selectedClassId) query.set('school_class_id', selectedClassId)
    if (selectedDate) query.set('date', selectedDate)
    const response = await requestJson<AttendanceContextResponse>(`/api/dashboard/attendance/context/?${query.toString()}`)
    setClasses(response.classes)
    setStudents(response.students)
    setRecords(response.records)
    setSummaryData(response.summary)
    setStatusMap(response.students.reduce<Record<string, AttendanceRecord['status']>>((acc, student) => {
      const existing = response.records.find((record) => record.student_id === student.id)
      acc[student.id] = existing?.status || 'present'
      return acc
    }, {}))
  }

  const refreshHistory = async () => {
    const query = new URLSearchParams({ page: String(historyPage), page_size: '8', school_class_id: selectedClassId, date: selectedDate })
    const response = await requestJson<AttendanceHistoryResponse>(`/api/dashboard/attendance/records/?${query.toString()}`)
    setHistory(response.records)
    setHistoryTotalPages(response.total_pages || 1)
  }

  const handleSaveAll = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedClassId) return

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        school_class_id: selectedClassId,
        date: selectedDate,
        records: students.map((student) => ({
          student_id: student.id,
          school_class_id: selectedClassId,
          date: selectedDate,
          status: statusMap[student.id] || 'present',
        })),
      }

      await requestJson('/api/dashboard/attendance/records/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      await Promise.all([refreshContext(), refreshHistory()])
      setSuccessMessage('Attendance saved and attendance rates recalculated.')
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : 'Unable to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Delete this attendance record?')) return
    await requestJson(`/api/dashboard/attendance/records/${recordId}/`, { method: 'DELETE' })
    await Promise.all([refreshContext(), refreshHistory()])
    setSuccessMessage('Attendance record deleted and attendance rate recalculated.')
  }

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedClassId(record.school_class_id)
    setSelectedDate(record.date.slice(0, 10))
    setStatusMap((current) => ({ ...current, [record.student_id]: record.status }))
  }

  return (
    <Layout role="teacher">
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Attendance Management</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Class</span>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.grade_level ? `(${item.grade_level})` : ''}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} type="date" className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" />
          </label>
          <div className="flex items-end gap-3">
            <button type="button" onClick={() => setStatusMap(emptyStatusMap(students))} className="h-11 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white">Reset All</button>
          </div>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-3">
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">Select a class to load the register.</p>
          ) : students.map((student) => (
            <div key={student.id} className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.admission_number} • {student.class_name}</p>
                <p className="text-xs text-gray-400 mt-1">Current attendance: {student.attendance_rate}%</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['present', 'absent', 'late', 'leave'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusMap((current) => ({ ...current, [student.id]: status }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusMap[student.id] === status ? statusPalette[status] : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : status === 'late' ? 'Late' : 'Leave'}
                  </button>
                ))}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusPalette[statusMap[student.id] || 'present']}`}>{statusMap[student.id] || 'present'}</span>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <button type="submit" disabled={saving || students.length === 0} className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-70">
              {saving ? 'Saving attendance...' : 'Save Attendance'}
            </button>
            {loadingContext && <span className="text-xs text-gray-500">Loading class register...</span>}
            {summaryData && (
              <span className="text-xs text-gray-500">
                Present: {summaryData.present} • Late: {summaryData.late} • Absent: {summaryData.absent} • Attendance rate: {summaryData.attendance_rate}%
              </span>
            )}
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
        </form>
      </div>

      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Register</h3>
        </div>
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-sm text-gray-500">No attendance saved for this class and date yet.</p>
          ) : records.map((record) => (
            <div key={record.id} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{record.student_name}</p>
                  <p className="text-xs text-gray-500">{record.admission_number} • {record.school_class}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusPalette[record.status]}`}>{record.status}</span>
              </div>
              <div className="mt-3 flex gap-2 justify-end">
                <button type="button" onClick={() => handleEditRecord(record)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Edit</button>
                <button type="button" onClick={() => handleDeleteRecord(record.id)} className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No history found for this class and date.</p>
          ) : history.map((record) => (
            <div key={record.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{record.student_name}</p>
                  <p className="text-xs text-gray-500">{record.admission_number} • {record.date.slice(0, 10)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusPalette[record.status]}`}>{record.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {historyPage} of {historyTotalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setHistoryPage((current) => Math.max(current - 1, 1))} disabled={historyPage <= 1} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Prev</button>
            <button type="button" onClick={() => setHistoryPage((current) => Math.min(current + 1, historyTotalPages))} disabled={historyPage >= historyTotalPages} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
        {loadingHistory && <p className="mt-3 text-xs text-gray-500">Loading history...</p>}
      </div>
    </Layout>
  )
}