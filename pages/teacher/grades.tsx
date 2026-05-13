import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { API_BASE_URL, requestBlob, requestJson } from '../../src/apiClient'

type SchoolClassOption = {
  id: string
  name: string
  grade_level?: string
  room?: string
}

type StudentOption = {
  id: string
  name: string
  admission_number: string
  class_name?: string
  gpa?: number
}

type MarkContextResponse = {
  classes: SchoolClassOption[]
  students: StudentOption[]
}

type MarkSubmissionResponse = {
  result: {
    student_name: string
    admission_number: string
    school_class: string
    term: string
    total_score: number
    max_score: number
    percentage: number
    grade: string
    rank: number
  }
  rankings: Array<{
    student_name: string
    admission_number: string
    total_score: number
    percentage: number
    grade: string
    rank: number
  }>
}

type MarkListItem = {
  id: string
  student_id: string
  student_name: string
  admission_number: string
  school_class_id: string
  school_class: string
  subject: string
  assessment_name: string
  score: number
  max_score: number
  term: string
  total_score: number
  percentage: number
  grade: string
  rank: number
}

type RankingResponse = {
  rankings: MarkSubmissionResponse['rankings']
}

export default function TeacherGradesPage() {
  const [classes, setClasses] = useState<SchoolClassOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [subject, setSubject] = useState('Mathematics')
  const [assessmentName, setAssessmentName] = useState('Mid-Term Test')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [term, setTerm] = useState('term-1')
  const [loading, setLoading] = useState(false)
  const [loadingContext, setLoadingContext] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [result, setResult] = useState<MarkSubmissionResponse['result'] | null>(null)
  const [rankings, setRankings] = useState<MarkSubmissionResponse['rankings']>([])
  const [marks, setMarks] = useState<MarkListItem[]>([])
  const [editingMarkId, setEditingMarkId] = useState('')

  const selectedClass = useMemo(() => classes.find((item) => item.id === selectedClassId) || null, [classes, selectedClassId])

  useEffect(() => {
    let active = true

    const loadContext = async () => {
      setLoadingContext(true)
      setError('')

      try {
        const response = await requestJson<MarkContextResponse>('/api/dashboard/marks/context/')
        if (!active) return

        setClasses(response.classes)
        setStudents(response.students)

        if (!selectedClassId && response.classes.length > 0) {
          setSelectedClassId(response.classes[0].id)
        }
      } catch (contextError) {
        if (active) {
          setError(contextError instanceof Error ? contextError.message : 'Unable to load mark entry context')
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
  }, [])

  useEffect(() => {
    if (!selectedClassId) return

    let active = true

    const loadStudents = async () => {
      setError('')

      try {
        const response = await requestJson<MarkContextResponse>(`/api/dashboard/marks/context/?school_class_id=${selectedClassId}`)
        if (!active) return

        setStudents(response.students)
        setSelectedStudentId((currentStudentId) => {
          const stillAvailable = response.students.some((student) => student.id === currentStudentId)
          return stillAvailable ? currentStudentId : response.students[0]?.id || ''
        })
      } catch (contextError) {
        if (active) {
          setError(contextError instanceof Error ? contextError.message : 'Unable to refresh students for the selected class')
        }
      }
    }

    loadStudents()

    return () => {
      active = false
    }
  }, [selectedClassId])

  useEffect(() => {
    if (!selectedClassId) return

    let active = true

    const loadRankings = async () => {
      try {
        const response = await requestJson<RankingResponse>(
          `/api/dashboard/rankings/?school_class_id=${selectedClassId}&term=${encodeURIComponent(term)}`
        )
        if (active) {
          setRankings(response.rankings)
        }
      } catch {
        if (active) {
          setRankings([])
        }
      }
    }

    loadRankings()

    const loadMarks = async () => {
      try {
        const response = await requestJson<{ marks: MarkListItem[] }>(
          `/api/dashboard/marks/?school_class_id=${selectedClassId}&term=${encodeURIComponent(term)}`
        )
        if (active) {
          setMarks(response.marks)
        }
      } catch {
        if (active) {
          setMarks([])
        }
      }
    }

    loadMarks()

    return () => {
      active = false
    }
  }, [selectedClassId, term])

  const resetForm = () => {
    setEditingMarkId('')
    setSelectedStudentId('')
    setSubject('Mathematics')
    setAssessmentName('Mid-Term Test')
    setScore('')
    setMaxScore('100')
  }

  const startEdit = (mark: MarkListItem) => {
    setEditingMarkId(mark.id)
    setSelectedClassId(mark.school_class_id)
    setSelectedStudentId(mark.student_id)
    setSubject(mark.subject)
    setAssessmentName(mark.assessment_name)
    setScore(String(mark.score))
    setMaxScore(String(mark.max_score))
    setTerm(mark.term)
    setSuccessMessage('')
    setError('')
  }

  const refreshAfterMutation = async (classId: string, markTerm: string) => {
    try {
      const [marksResponse, rankingsResponse] = await Promise.all([
        requestJson<{ marks: MarkListItem[] }>(`/api/dashboard/marks/?school_class_id=${classId}&term=${encodeURIComponent(markTerm)}`),
        requestJson<RankingResponse>(`/api/dashboard/rankings/?school_class_id=${classId}&term=${encodeURIComponent(markTerm)}`),
      ])
      setMarks(marksResponse.marks)
      setRankings(rankingsResponse.rankings)
    } catch {
      setMarks([])
      setRankings([])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedClassId || !selectedStudentId) {
      setError('Select a class and student before submitting marks.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const payload = {
        student_id: selectedStudentId,
        school_class_id: selectedClassId,
        subject,
        assessment_name: assessmentName,
        score: Number(score),
        max_score: Number(maxScore),
        term,
      }

      const response = editingMarkId
        ? await requestJson<MarkSubmissionResponse>(`/api/dashboard/marks/${editingMarkId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        : await requestJson<MarkSubmissionResponse>('/api/dashboard/marks/', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

      setResult(response.result)
      setRankings(response.rankings)
      setSuccessMessage(editingMarkId ? 'Mark updated. Totals, grade, and rankings were recalculated automatically.' : 'Marks saved. Totals, grade, and rankings were recalculated automatically.')
      setScore('')
      await refreshAfterMutation(selectedClassId, term)
      resetForm()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to save marks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (mark: MarkListItem) => {
    setLoading(true)
    setError('')

    try {
      await requestJson(`/api/dashboard/marks/${mark.id}/`, {
        method: 'DELETE',
      })
      await refreshAfterMutation(mark.school_class_id, mark.term)
      if (editingMarkId === mark.id) {
        resetForm()
      }
      setSuccessMessage('Mark deleted and rankings recalculated.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete mark')
    } finally {
      setLoading(false)
    }
  }

  const openReportCard = async () => {
    if (!selectedStudentId) {
      setError('Select a student first to print the report card.')
      return
    }

    try {
      const blob = await requestBlob(
        `/api/reports/report-card/pdf/?student_id=${selectedStudentId}&term=${encodeURIComponent(term)}`
      )
      const objectUrl = URL.createObjectURL(blob)
      const reportWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer')
      if (reportWindow) {
        reportWindow.focus()
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } catch {
      const fallbackUrl = `${API_BASE_URL}/api/reports/report-card/pdf/?student_id=${selectedStudentId}&term=${encodeURIComponent(term)}`
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Layout role="teacher">
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Grade Submission</h2>
            <p className="text-sm text-gray-600">Enter or update marks and the backend recalculates totals, grades, and class rankings.</p>
          </div>
          {loadingContext && <span className="text-xs text-gray-500">Loading class list...</span>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Class</span>
            <select
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.grade_level ? `(${item.grade_level})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Student</span>
            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.admission_number}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              placeholder="Mathematics"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Assessment</span>
            <input
              value={assessmentName}
              onChange={(event) => setAssessmentName(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              placeholder="Mid-Term Test"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Score</span>
            <input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              placeholder="78"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Max Score</span>
            <input
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              type="number"
              min="1"
              step="0.01"
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Term</span>
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
              placeholder="term-1"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? 'Saving marks...' : editingMarkId ? 'Update Mark' : 'Save Marks'}
            </button>
            {editingMarkId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
          </div>
        </form>
      </div>

      {result && (
        <div className="md:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculated Result</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Student</p><p className="font-semibold text-gray-900">{result.student_name}</p></div>
            <div><p className="text-gray-500">Admission</p><p className="font-semibold text-gray-900">{result.admission_number}</p></div>
            <div><p className="text-gray-500">Class</p><p className="font-semibold text-gray-900">{result.school_class}</p></div>
            <div><p className="text-gray-500">Term</p><p className="font-semibold text-gray-900">{result.term}</p></div>
            <div><p className="text-gray-500">Total</p><p className="font-semibold text-gray-900">{result.total_score} / {result.max_score}</p></div>
            <div><p className="text-gray-500">Percentage</p><p className="font-semibold text-gray-900">{result.percentage}%</p></div>
            <div><p className="text-gray-500">Grade</p><p className="font-semibold text-gray-900">{result.grade}</p></div>
            <div><p className="text-gray-500">Rank</p><p className="font-semibold text-gray-900">#{result.rank}</p></div>
          </div>
        </div>
      )}

      <div className="md:col-span-3 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Class Rankings {selectedClass ? `- ${selectedClass.name}` : ''}
        </h3>
        <div className="space-y-3">
          {rankings.length === 0 ? (
            <p className="text-sm text-gray-500">Save a mark to generate rankings for the selected class and term.</p>
          ) : rankings.map((row) => (
            <div key={`${row.admission_number}-${row.rank}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div>
                <p className="font-semibold text-gray-900">{row.student_name}</p>
                <p className="text-xs text-gray-500">{row.admission_number}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">Rank #{row.rank}</p>
                <p className="text-xs text-gray-500">{row.percentage}% • {row.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Marks</h3>
        <div className="space-y-3">
          {marks.length === 0 ? (
            <p className="text-sm text-gray-500">No marks recorded yet for this class and term.</p>
          ) : marks.map((mark) => (
            <div key={mark.id} className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{mark.student_name} <span className="text-xs text-gray-500">({mark.admission_number})</span></p>
                <p className="text-sm text-gray-600">{mark.subject} • {mark.assessment_name}</p>
                <p className="text-xs text-gray-500">{mark.school_class} • {mark.term}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">
                  {mark.score}/{mark.max_score}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                  {mark.percentage}% • {mark.grade}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Rank #{mark.rank || '-'}
                </span>
                <button type="button" onClick={() => startEdit(mark)} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(mark)} className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Report Card</h3>
          <p className="text-sm text-gray-600">Print a detailed student report card with overall grade, rank, and subject breakdown.</p>
        </div>
        <button
          type="button"
          onClick={openReportCard}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-70"
          disabled={!selectedStudentId}
        >
          Print Report Card PDF
        </button>
      </div>
    </Layout>
  )
}