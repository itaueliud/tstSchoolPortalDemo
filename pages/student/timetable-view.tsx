'use client'

import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import TimetableWeekGrid from '../../components/TimetableWeekGrid'
import { CalendarDays, Download, RefreshCw } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { requestBlob, requestJson } from '../../src/apiClient'

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

type StudentSummary = {
  current_class?: string
  current_class_id?: string
  [key: string]: unknown
}

function getWeekStartString(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

export default function StudentTimetableViewPage() {
  const { summary } = useDashboardSummary()
  const [weekStart, setWeekStart] = useState<string>('')
  const [allEntries, setAllEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [studentClass, setStudentClass] = useState<string>('')

  // Initialize with current week
  useEffect(() => {
    const ws = getWeekStartString(new Date())
    setWeekStart(ws)
  }, [])

  // Get student's class from summary
  useEffect(() => {
    if (summary && typeof summary === 'object' && 'current_class' in summary) {
      const studentSummary = summary as StudentSummary
      setStudentClass(studentSummary.current_class || '')
    }
  }, [summary])

  // Fetch all timetable entries for the week
  useEffect(() => {
    if (!weekStart) return

    const fetchTimetable = async () => {
      try {
        setLoading(true)
        // Fetch timetable for the school (no specific teacher filter)
        // This will get all timetable entries for all teachers
        const response = await requestJson(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/timetable/?week_start=${weekStart}`,
          { method: 'GET' }
        )
        setAllEntries(response.entries || [])
      } catch (error) {
        console.error('Error fetching timetable:', error)
        setAllEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimetable()
  }, [weekStart])

  // Filter entries for student's class
  const studentClassEntries = useMemo(() => {
    if (!studentClass) return []
    return allEntries.filter((entry) => entry.school_class === studentClass)
  }, [allEntries, studentClass])

  const handleExportPdf = async () => {
    if (!studentClass) return
    try {
      setExporting(true)
      // Create a simple PDF with filtered data
      // For now, we'll call the timetable export endpoint
      // In the future, we could create a dedicated student export endpoint
      const blob = await requestBlob(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/timetable/export-pdf/?week_start=${weekStart}`,
        { method: 'GET' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${studentClass}-timetable-${weekStart}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handlePreviousWeek = () => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() - 7)
    setWeekStart(date.toISOString().split('T')[0])
  }

  const handleNextWeek = () => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + 7)
    setWeekStart(date.toISOString().split('T')[0])
  }

  const weekEndDate = useMemo(() => {
    if (!weekStart) return ''
    const date = new Date(weekStart)
    date.setDate(date.getDate() + 6)
    return date.toISOString().split('T')[0]
  }, [weekStart])

  return (
    <Layout role="student">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
            </div>
            <p className="text-gray-600">
              {studentClass ? `${studentClass} weekly schedule` : 'View your class schedule'}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreviousWeek}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  ← Previous
                </button>

                <div className="min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week of:</label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleNextWeek}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Next →
                </button>
              </div>

              {studentClass && (
                <button
                  onClick={handleExportPdf}
                  disabled={exporting || studentClassEntries.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
              )}
            </div>

            {weekStart && weekEndDate && (
              <div className="mt-4 text-sm text-gray-600">
                Week: {new Date(weekStart).toLocaleDateString()} — {new Date(weekEndDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Timetable Grid */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {!studentClass ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                No class assignment found. Please contact administration.
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Loading timetable...
              </div>
            ) : (
              <TimetableWeekGrid entries={studentClassEntries} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
