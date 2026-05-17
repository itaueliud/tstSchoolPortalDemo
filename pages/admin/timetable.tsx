'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { CalendarDays, CheckCircle2, Download, PlusCircle, RefreshCw, Save, Trash2 } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { requestBlob, requestJson } from '../../src/apiClient'

type TimetableTeacher = {
  id: string
  name: string
  subject: string
}

type TimetableClass = {
  id: string
  name: string
  grade_level: string
  room: string
}

type TimetableEntry = {
  id: string
  teacher_id: string
  school_class_id: string
  school_class: string
  grade_level: string
  subject: string
  day_of_week: string
  start_time: string
  end_time: string
  room: string
  week_start: string
  status: 'pending' | 'completed' | 'missed' | 'rescheduled'
  notes: string
  updated_at: string
}

type TimetableSummary = {
  total: number
  completed: number
  pending: number
  missed: number
  rescheduled: number
}

type TimetableResponse = {
  week_start: string
  teacher_id: string
  teachers: TimetableTeacher[]
  classes: TimetableClass[]
  entries: TimetableEntry[]
  summary: TimetableSummary
}

type TimetableDraft = {
  school_class_id: string
  subject: string
  day_of_week: string
  start_time: string
  end_time: string
  room: string
  status: TimetableEntry['status']
  notes: string
}

const weekdayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

const statusOptions: Array<{ value: TimetableEntry['status']; label: string; tone: string }> = [
  { value: 'pending', label: 'Pending', tone: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'completed', label: 'Completed', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'missed', label: 'Missed', tone: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'rescheduled', label: 'Rescheduled', tone: 'bg-amber-100 text-amber-700 border-amber-200' },
]

const statusToneMap: Record<TimetableEntry['status'], string> = statusOptions.reduce((acc, option) => {
  acc[option.value] = option.tone
  return acc
}, {} as Record<TimetableEntry['status'], string>)

const csvHeaders = ['Week Start', 'Day', 'Start', 'End', 'Class', 'Subject', 'Room', 'Status', 'Notes']

function getMondayInput() {
  const today = new Date()
  const day = today.getDay()
  const offset = (day + 6) % 7
  today.setDate(today.getDate() - offset)
  return today.toISOString().slice(0, 10)
}

function getEmptyDraft(): TimetableDraft {
  return {
    school_class_id: '',
    subject: '',
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '10:00',
    room: '',
    status: 'pending',
    notes: '',
  }
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      const nextCharacter = line[index + 1]
      if (inQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += character
  }

  cells.push(current)
  return cells.map((cell) => cell.trim())
}

function parseCsvText(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase())
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = cells[index] || ''
      return acc
    }, {})
  })
}

function normaliseWeekday(value: string) {
  return value.toLowerCase().replace(/\s+/g, '_')
}

export default function AdminTimetablePage() {
  const { data, loading, error } = useDashboardSummary('admin')
  const summary = data?.summary || {}
  const summaryValues = summary as Record<string, string | number | undefined>

  const [weekStart, setWeekStart] = useState(getMondayInput)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [teachers, setTeachers] = useState<TimetableTeacher[]>([])
  const [classes, setClasses] = useState<TimetableClass[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [summaryData, setSummaryData] = useState<TimetableSummary>({ total: 0, completed: 0, pending: 0, missed: 0, rescheduled: 0 })
  const [drafts, setDrafts] = useState<Record<string, Pick<TimetableDraft, 'status' | 'notes'>>>({})
  const [form, setForm] = useState<TimetableDraft>(getEmptyDraft)
  const [loadingTimetable, setLoadingTimetable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingEntryId, setSavingEntryId] = useState('')
  const [deletingEntryId, setDeletingEntryId] = useState('')
  const [importing, setImporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const importInputRef = useRef<HTMLInputElement | null>(null)

  const stats = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'Total Students', value: Number(summaryValues.students) || 0 },
    { title: 'Teachers', value: Number(summaryValues.teachers) || 0 },
    { title: 'Classes', value: Number(summaryValues.classes) || 0 },
    { title: 'Revenue', value: summaryValues.revenue ? `KES ${summaryValues.revenue}` : 'KES 0' },
  ]), [summaryValues])

  const loadTimetable = async (targetWeekStart = weekStart, teacherId = selectedTeacherId) => {
    setLoadingTimetable(true)
    setErrorMessage('')

    try {
      const query = new URLSearchParams({ week_start: targetWeekStart })
      if (teacherId) query.set('teacher_id', teacherId)
      const response = await requestJson<TimetableResponse>(`/api/dashboard/timetable/?${query.toString()}`)

      setTeachers(response.teachers || [])
      setClasses(response.classes || [])
      setEntries(response.entries || [])
      setSummaryData(response.summary || { total: 0, completed: 0, pending: 0, missed: 0, rescheduled: 0 })
      setDrafts((response.entries || []).reduce<Record<string, Pick<TimetableDraft, 'status' | 'notes'>>>((acc, entry) => {
        acc[entry.id] = { status: entry.status, notes: entry.notes || '' }
        return acc
      }, {}))

      if (!teacherId && response.teacher_id) {
        setSelectedTeacherId(response.teacher_id)
      }
      if (response.classes?.length) {
        setForm((current) => current.school_class_id ? current : { ...current, school_class_id: response.classes[0].id })
      }
    } catch (loadError) {
      setErrorMessage(loadError instanceof Error ? loadError.message : 'Unable to load timetable')
      setEntries([])
      setSummaryData({ total: 0, completed: 0, pending: 0, missed: 0, rescheduled: 0 })
    } finally {
      setLoadingTimetable(false)
    }
  }

  useEffect(() => {
    loadTimetable(weekStart, selectedTeacherId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, selectedTeacherId])

  useEffect(() => {
    if (classes.length > 0 && !form.school_class_id) {
      setForm((current) => ({ ...current, school_class_id: classes[0].id }))
    }
  }, [classes, form.school_class_id])

  const refresh = async () => {
    await loadTimetable(weekStart, selectedTeacherId)
  }

  const openImportDialog = () => {
    importInputRef.current?.click()
  }

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!selectedTeacherId) {
      setImportError('Select a teacher before importing a timetable.')
      return
    }

    setImporting(true)
    setImportError('')
    setImportMessage('')
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const text = await file.text()
      const records = parseCsvText(text)
      if (!records.length) {
        throw new Error('The CSV file does not contain any rows.')
      }

      const classLookup = classes.reduce<Record<string, TimetableClass>>((acc, item) => {
        const nameKey = item.name.toLowerCase().trim()
        acc[nameKey] = item
        acc[`${nameKey}|${(item.grade_level || '').toLowerCase().trim()}`] = item
        return acc
      }, {})

      const entries = records.map((record) => {
        const classLabel = (record.class || record['school class'] || record.class_name || '').trim()
        const classKey = classLabel.toLowerCase()
        const gradeKey = (record['grade level'] || '').toLowerCase().trim()
        const matchedClass = classLookup[classKey] || classLookup[`${classKey}|${gradeKey}`]

        if (!matchedClass) {
          throw new Error(`Unknown class "${classLabel}" in CSV.`)
        }

        const subject = (record.subject || '').trim()
        const day = normaliseWeekday(record.day || record['day of week'] || record.weekday || '')
        const startTime = (record.start || record['start time'] || record.start_time || '').trim()
        const endTime = (record.end || record['end time'] || record.end_time || '').trim()

        if (!subject || !day || !startTime || !endTime) {
          throw new Error('Each CSV row must include Class, Subject, Day, Start, and End columns.')
        }

        const status = (record.status || 'pending').toLowerCase() as TimetableEntry['status']

        return {
          school_class_id: matchedClass.id,
          subject,
          day_of_week: day,
          start_time: startTime,
          end_time: endTime,
          room: (record.room || '').trim(),
          status: statusOptions.some((option) => option.value === status) ? status : 'pending',
          notes: (record.notes || '').trim(),
        }
      })

      const query = new URLSearchParams({ teacher_id: selectedTeacherId })
      await requestJson(`/api/dashboard/timetable/?${query.toString()}`, {
        method: 'POST',
        body: JSON.stringify({ week_start: weekStart, entries }),
      })

      await refresh()
      setImportMessage(`Imported ${entries.length} timetable rows from ${file.name}.`)
    } catch (importError) {
      setImportError(importError instanceof Error ? importError.message : 'Unable to import CSV file')
    } finally {
      setImporting(false)
    }
  }

  const handleCreateEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTeacherId) return

    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const query = new URLSearchParams({ teacher_id: selectedTeacherId })
      await requestJson(`/api/dashboard/timetable/?${query.toString()}`, {
        method: 'POST',
        body: JSON.stringify({ ...form, week_start: weekStart }),
      })
      setForm(getEmptyDraft())
      await refresh()
      setSuccessMessage('Timetable entry saved.')
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : 'Unable to save timetable entry')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEntry = async (entry: TimetableEntry) => {
    if (!selectedTeacherId) return

    setSavingEntryId(entry.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const draft = drafts[entry.id] || { status: entry.status, notes: entry.notes }
      const query = new URLSearchParams({ teacher_id: selectedTeacherId })
      await requestJson(`/api/dashboard/timetable/?${query.toString()}`, {
        method: 'POST',
        body: JSON.stringify({
          week_start: weekStart,
          entry_id: entry.id,
          school_class_id: entry.school_class_id,
          subject: entry.subject,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room: entry.room,
          status: draft.status,
          notes: draft.notes,
        }),
      })
      await refresh()
      setSuccessMessage('Timetable mark updated.')
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : 'Unable to update timetable entry')
    } finally {
      setSavingEntryId('')
    }
  }

  const handleDeleteEntry = async (entry: TimetableEntry) => {
    if (!window.confirm('Delete this timetable entry?')) return

    setDeletingEntryId(entry.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await requestJson(`/api/dashboard/timetable/${entry.id}/`, { method: 'DELETE' })
      await refresh()
      setSuccessMessage('Timetable entry deleted.')
    } catch (deleteError) {
      setErrorMessage(deleteError instanceof Error ? deleteError.message : 'Unable to delete timetable entry')
    } finally {
      setDeletingEntryId('')
    }
  }

  const handleDownload = async () => {
    if (!selectedTeacherId) return

    try {
      const query = new URLSearchParams({ week_start: weekStart, teacher_id: selectedTeacherId })
      const blob = await requestBlob(`/api/dashboard/timetable/export/?${query.toString()}`)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `teacher-timetable-${selectedTeacherId}-${weekStart}.csv`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (downloadError) {
      setErrorMessage(downloadError instanceof Error ? downloadError.message : 'Unable to download timetable')
    }
  }

  const handleDownloadPdf = async () => {
    if (!selectedTeacherId) return

    try {
      const query = new URLSearchParams({ week_start: weekStart, teacher_id: selectedTeacherId })
      const blob = await requestBlob(`/api/dashboard/timetable/export-pdf/?${query.toString()}`)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `timetable-${weekStart}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (downloadError) {
      setErrorMessage(downloadError instanceof Error ? downloadError.message : 'Unable to download PDF')
    }
  }

  return (
    <Layout role="admin">
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Timetable Management</h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button type="button" onClick={handleDownload} disabled={!selectedTeacherId} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button type="button" onClick={handleDownloadPdf} disabled={!selectedTeacherId} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Teacher</span>
            <select value={selectedTeacherId} onChange={(event) => setSelectedTeacherId(event.target.value)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}{teacher.subject ? ` (${teacher.subject})` : ''}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 md:col-span-1">
            <span className="text-sm font-medium text-gray-700">Week Start</span>
            <input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" />
          </label>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-green-50 p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.total}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-emerald-50 p-3">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.completed}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-green-200 bg-green-50/40 p-4 mb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-gray-900">Bulk import from CSV</p>
              <p className="text-sm text-gray-600 mt-1">Upload a CSV with columns: {csvHeaders.join(', ')}. Rows are imported for the selected teacher.</p>
            </div>
            <div className="flex items-center gap-2">
              <input ref={importInputRef} type="file" accept=".csv,text/csv" onChange={handleImportCsv} className="hidden" />
              <button type="button" onClick={openImportDialog} disabled={importing || !selectedTeacherId} className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60">
                <Download className="w-4 h-4" />
                {importing ? 'Importing...' : 'Choose CSV'}
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>Selected teacher: {teachers.find((teacher) => teacher.id === selectedTeacherId)?.name || 'None'}</span>
            <span>Tip: export a timetable first, then edit and re-upload it.</span>
          </div>
          {importError && <p className="mt-3 text-sm text-rose-600">{importError}</p>}
          {importMessage && <p className="mt-3 text-sm text-emerald-700">{importMessage}</p>}
        </div>

        <form onSubmit={handleCreateEntry} className="rounded-xl border border-gray-100 bg-green-50/40 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-gray-900">Add timetable entry</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Class</span>
              <select value={form.school_class_id} onChange={(event) => setForm((current) => ({ ...current, school_class_id: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}{item.grade_level ? ` (${item.grade_level})` : ''}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Subject</span>
              <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" placeholder="Mathematics" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Day</span>
              <select value={form.day_of_week} onChange={(event) => setForm((current) => ({ ...current, day_of_week: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
                {weekdayOptions.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Start Time</span>
              <input value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" placeholder="09:00" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">End Time</span>
              <input value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" placeholder="10:00" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Room</span>
              <input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" placeholder="Room 12" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="flex flex-col gap-2 md:col-span-1">
              <span className="text-sm font-medium text-gray-700">Mark Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TimetableEntry['status'] }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
                {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 md:col-span-3">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              <input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900" placeholder="Topic, room changes, or follow-up notes" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving || !selectedTeacherId || !form.school_class_id || !form.subject.trim()} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
            {loadingTimetable && <span className="text-xs text-gray-500">Loading timetable...</span>}
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              No timetable entries for this teacher and week yet.
            </div>
          ) : entries.map((entry) => {
            const draft = drafts[entry.id] || { status: entry.status, notes: entry.notes }
            return (
              <div key={entry.id} className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50/70 transition-colors">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{entry.school_class}</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusToneMap[draft.status]}`}>
                        {statusOptions.find((item) => item.value === draft.status)?.label || draft.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{entry.subject} • {entry.day_of_week} • {entry.start_time} - {entry.end_time}</p>
                    <p className="text-xs text-gray-500 mt-1">{entry.room || 'No room set'} • Updated {entry.updated_at ? new Date(entry.updated_at).toLocaleString() : 'recently'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={draft.status} onChange={(event) => setDrafts((current) => ({ ...current, [entry.id]: { ...draft, status: event.target.value as TimetableEntry['status'] } }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900">
                      {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                    <button type="button" onClick={() => handleSaveEntry(entry)} disabled={savingEntryId === entry.id} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70">
                      <CheckCircle2 className="w-4 h-4" />
                      {savingEntryId === entry.id ? 'Saving...' : 'Mark'}
                    </button>
                    <button type="button" onClick={() => handleDeleteEntry(entry)} disabled={deletingEntryId === entry.id} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-70">
                      <Trash2 className="w-4 h-4" />
                      {deletingEntryId === entry.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]">
                  <input
                    value={draft.notes}
                    onChange={(event) => setDrafts((current) => ({ ...current, [entry.id]: { ...draft, notes: event.target.value } }))}
                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
                    placeholder="Add or update a note for this lesson"
                  />
                  <p className="text-xs text-gray-400 lg:self-center lg:pl-2">Use Mark to save status and notes for this slot.</p>
                </div>
              </div>
            )
          })}
        </div>

        {(errorMessage || successMessage) && (
          <div className="mt-4">
            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
            {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
          </div>
        )}
      </div>
    </Layout>
  )
}
