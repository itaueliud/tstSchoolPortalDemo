import { FormEvent, useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { requestJson } from '../../src/apiClient'

type AssignmentMaterial = {
  id: string
  title: string
  material_type: 'link' | 'note'
  content: string
  created_at: string
}

type AssignmentSubmission = {
  id: string
  status: string
  submitted_at: string
  score: number
  max_score: number
  teacher_feedback: string
  content: string
}

type AssignmentItem = {
  id: string
  title: string
  description: string
  subject: string
  school_class: string
  max_score: number
  due_date: string
  is_published: boolean
  materials: AssignmentMaterial[]
  student_submission: AssignmentSubmission | null
  is_due_soon?: boolean
  is_overdue?: boolean
  due_in_days?: number | null
  overdue_count?: number
}

type AssignmentListResponse = {
  assignments: AssignmentItem[]
}

type SubmissionHistoryItem = {
  id: string
  assignment_id: string
  assignment_title: string
  school_class: string
  content: string
  status: string
  score: number
  max_score: number
  teacher_feedback: string
  submitted_at: string
  graded_at: string
}

type SubmissionHistoryResponse = {
  submissions: SubmissionHistoryItem[]
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([])
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submissionDrafts, setSubmissionDrafts] = useState<Record<string, string>>({})

  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return assignments
    const term = search.trim().toLowerCase()
    return assignments.filter((item) => (
      item.title.toLowerCase().includes(term)
      || item.subject.toLowerCase().includes(term)
      || item.description.toLowerCase().includes(term)
    ))
  }, [assignments, search])

  const loadAssignments = async () => {
    const response = await requestJson<AssignmentListResponse>('/api/dashboard/assignments/?page_size=50')
    const rows = response.assignments || []
    setAssignments(rows)
    setSubmissionDrafts(rows.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = item.student_submission?.content || ''
      return acc
    }, {}))
  }

  const loadHistory = async () => {
    const response = await requestJson<SubmissionHistoryResponse>('/api/dashboard/assignments/submissions/?page_size=50')
    setHistory(response.submissions || [])
  }

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      setLoading(true)
      setError('')
      try {
        await Promise.all([loadAssignments(), loadHistory()])
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load LMS assignments')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  const handleSubmitAssignment = async (event: FormEvent, assignmentId: string) => {
    event.preventDefault()
    const content = submissionDrafts[assignmentId]?.trim()
    if (!content) {
      setError('Write your answer before submitting.')
      return
    }

    setSavingId(assignmentId)
    setError('')
    setSuccess('')

    try {
      await requestJson('/api/dashboard/assignments/submissions/', {
        method: 'POST',
        body: JSON.stringify({
          assignment_id: assignmentId,
          content,
        }),
      })
      await Promise.all([loadAssignments(), loadHistory()])
      setSuccess('Assignment submitted successfully.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit assignment')
    } finally {
      setSavingId('')
    }
  }

  return (
    <Layout role="student">
      <div className="md:col-span-3 card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assignments and LMS</h2>
            <p className="text-sm text-gray-600">View published assignments, read attached notes/resources, and submit your work.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or subject"
            className="h-10 w-full md:w-64 rounded-lg border border-gray-200 px-3 text-sm"
          />
        </div>

        {loading && <p className="text-sm text-gray-500">Loading LMS assignments...</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {success && <p className="text-sm text-green-700 mb-2">{success}</p>}

        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <p className="text-sm text-gray-500">No published assignments found.</p>
          ) : filteredAssignments.map((assignment) => (
            <div key={assignment.id} className={`rounded-lg border p-4 ${assignment.is_overdue ? 'border-red-200 bg-red-50/50' : assignment.is_due_soon ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{assignment.title}</p>
                  <p className="text-xs text-gray-500">{assignment.subject} • {assignment.school_class}</p>
                  <p className="text-xs text-gray-400 mt-1">Due: {new Date(assignment.due_date).toLocaleString()} • Max score: {assignment.max_score}</p>
                </div>
                <div className="flex items-center gap-2">
                  {assignment.is_overdue && !assignment.student_submission ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue • {assignment.overdue_count}</span>
                  ) : assignment.is_due_soon && !assignment.student_submission ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Due Soon • {assignment.due_in_days}d</span>
                  ) : null}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.student_submission ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {assignment.student_submission ? assignment.student_submission.status : 'Not Submitted'}
                  </span>
                  {assignment.student_submission?.is_late && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">Late</span>
                  )}
                </div>
              </div>

              {assignment.description && <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{assignment.description}</p>}

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Materials</p>
                {assignment.materials.length === 0 ? (
                  <p className="text-xs text-gray-500">No materials attached.</p>
                ) : (
                  <div className="space-y-2">
                    {assignment.materials.map((material) => (
                      <div key={material.id} className="rounded border border-gray-100 p-2">
                        <p className="text-sm font-medium text-gray-900">{material.title}</p>
                        <p className="text-xs text-gray-500 uppercase">{material.material_type}</p>
                        {material.material_type === 'link' ? (
                          <a href={material.content} target="_blank" rel="noreferrer" className="text-xs text-green-700 underline break-all">
                            {material.content}
                          </a>
                        ) : (
                          <p className="text-xs text-gray-700 whitespace-pre-wrap">{material.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={(event) => handleSubmitAssignment(event, assignment.id)} className="space-y-3">
                <textarea
                  value={submissionDrafts[assignment.id] || ''}
                  onChange={(event) => setSubmissionDrafts((current) => ({ ...current, [assignment.id]: event.target.value }))}
                  placeholder="Write your answer or paste a submission link"
                  className="min-h-[100px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={savingId === assignment.id}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
                >
                  {savingId === assignment.id ? 'Submitting...' : assignment.student_submission ? 'Update Submission' : 'Submit Assignment'}
                </button>
              </form>

              {assignment.student_submission?.teacher_feedback && (
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs font-semibold text-blue-900">Teacher Feedback</p>
                  <p className="text-sm text-blue-800 mt-1">{assignment.student_submission.teacher_feedback}</p>
                  <p className="text-xs text-blue-700 mt-1">Score: {assignment.student_submission.score}/{assignment.student_submission.max_score}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission History</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No submissions yet.</p>
          ) : history.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-100 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.assignment_title}</p>
                  <p className="text-xs text-gray-500">{item.school_class} • Submitted: {new Date(item.submitted_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">Score: {item.score}/{item.max_score}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{item.status}</span>
              </div>
              {item.teacher_feedback && <p className="text-sm text-gray-700 mt-2">Feedback: {item.teacher_feedback}</p>}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
