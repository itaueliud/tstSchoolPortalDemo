import { FormEvent, useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { requestJson } from '../../src/apiClient'

type ClassOption = {
  id: string
  name: string
  grade_level?: string
}

type AssignmentMaterial = {
  id: string
  title: string
  material_type: 'link' | 'note'
  content: string
  created_at: string
}

type AssignmentItem = {
  id: string
  title: string
  description: string
  subject: string
  school_class_id: string
  school_class: string
  max_score: number
  due_date: string
  is_published: boolean
  submission_count: number
  pending_count: number
  materials: AssignmentMaterial[]
  is_due_soon?: boolean
  is_overdue?: boolean
  due_in_days?: number | null
  overdue_count?: number
}

type AssignmentListResponse = {
  assignments: AssignmentItem[]
}

type SubmissionItem = {
  id: string
  assignment_id: string
  assignment_title: string
  student_id: string
  student_name: string
  admission_number: string
  content: string
  status: string
  score: number
  max_score: number
  teacher_feedback: string
  submitted_at: string
  graded_at: string
}

type SubmissionListResponse = {
  submissions: SubmissionItem[]
}

type AttendanceContextResponse = {
  classes: ClassOption[]
}

const defaultForm = {
  title: '',
  description: '',
  subject: 'Mathematics',
  school_class_id: '',
  due_date: '',
  max_score: '100',
  is_published: true,
}

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [editingAssignmentId, setEditingAssignmentId] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialType, setMaterialType] = useState<'link' | 'note'>('link')
  const [materialContent, setMaterialContent] = useState('')
  const [feedbackBySubmission, setFeedbackBySubmission] = useState<Record<string, string>>({})
  const [scoreBySubmission, setScoreBySubmission] = useState<Record<string, string>>({})
  const [statusBySubmission, setStatusBySubmission] = useState<Record<string, 'graded' | 'returned' | 'late'>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === selectedAssignmentId) || null,
    [assignments, selectedAssignmentId]
  )

  const loadClasses = async () => {
    const response = await requestJson<AttendanceContextResponse>('/api/dashboard/attendance/context/')
    setClasses(response.classes || [])
  }

  const loadAssignments = async () => {
    const response = await requestJson<AssignmentListResponse>('/api/dashboard/assignments/?include_unpublished=1&page_size=50')
    setAssignments(response.assignments || [])
    setSelectedAssignmentId((current) => {
      const exists = (response.assignments || []).some((assignment) => assignment.id === current)
      return exists ? current : response.assignments?.[0]?.id || ''
    })
  }

  const loadSubmissions = async (assignmentId: string) => {
    if (!assignmentId) {
      setSubmissions([])
      return
    }
    const response = await requestJson<SubmissionListResponse>(`/api/dashboard/assignments/submissions/?assignment_id=${assignmentId}&page_size=50`)
    setSubmissions(response.submissions || [])
  }

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      setLoading(true)
      setError('')
      try {
        await Promise.all([loadClasses(), loadAssignments()])
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load LMS data')
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

  useEffect(() => {
    loadSubmissions(selectedAssignmentId).catch(() => setSubmissions([]))
  }, [selectedAssignmentId])

  const resetForm = () => {
    setEditingAssignmentId('')
    setForm({ ...defaultForm, school_class_id: classes[0]?.id || '' })
  }

  useEffect(() => {
    if (!form.school_class_id && classes.length > 0) {
      setForm((current) => ({ ...current, school_class_id: classes[0].id }))
    }
  }, [classes, form.school_class_id])

  const handleSaveAssignment = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        title: form.title,
        description: form.description,
        subject: form.subject,
        school_class_id: form.school_class_id,
        due_date: new Date(form.due_date).toISOString(),
        max_score: Number(form.max_score || 100),
        is_published: form.is_published,
      }

      if (editingAssignmentId) {
        await requestJson(`/api/dashboard/assignments/${editingAssignmentId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setSuccess('Assignment updated successfully.')
      } else {
        await requestJson('/api/dashboard/assignments/', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccess('Assignment created successfully.')
      }

      await loadAssignments()
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save assignment')
    } finally {
      setSaving(false)
    }
  }

  const handleEditAssignment = (assignment: AssignmentItem) => {
    setEditingAssignmentId(assignment.id)
    setSelectedAssignmentId(assignment.id)
    setForm({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      school_class_id: assignment.school_class_id,
      due_date: assignment.due_date.slice(0, 16),
      max_score: String(assignment.max_score),
      is_published: assignment.is_published,
    })
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Delete this assignment?')) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await requestJson(`/api/dashboard/assignments/${assignmentId}/`, { method: 'DELETE' })
      await loadAssignments()
      setSuccess('Assignment deleted.')
      if (editingAssignmentId === assignmentId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete assignment')
    } finally {
      setSaving(false)
    }
  }

  const handleAddMaterial = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedAssignmentId) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await requestJson('/api/dashboard/assignments/materials/', {
        method: 'POST',
        body: JSON.stringify({
          assignment_id: selectedAssignmentId,
          title: materialTitle,
          material_type: materialType,
          content: materialContent,
        }),
      })
      setMaterialTitle('')
      setMaterialContent('')
      await loadAssignments()
      setSuccess('Material added.')
    } catch (materialError) {
      setError(materialError instanceof Error ? materialError.message : 'Unable to add material')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await requestJson(`/api/dashboard/assignments/materials/${materialId}/`, { method: 'DELETE' })
      await loadAssignments()
      setSuccess('Material removed.')
    } catch (materialError) {
      setError(materialError instanceof Error ? materialError.message : 'Unable to remove material')
    } finally {
      setSaving(false)
    }
  }

  const handleGradeSubmission = async (submission: SubmissionItem) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await requestJson(`/api/dashboard/assignments/submissions/${submission.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          score: Number(scoreBySubmission[submission.id] || submission.score || 0),
          max_score: submission.max_score,
          teacher_feedback: feedbackBySubmission[submission.id] ?? submission.teacher_feedback,
          status: statusBySubmission[submission.id] || 'graded',
        }),
      })
      await loadSubmissions(selectedAssignmentId)
      setSuccess('Submission graded.')
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : 'Unable to grade submission')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout role="teacher">
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assignments and LMS</h2>
            <p className="text-sm text-gray-600">Create assignments, attach notes/resources, and grade student submissions.</p>
          </div>
          {loading && <span className="text-xs text-gray-500">Loading LMS workspace...</span>}
        </div>

        <form onSubmit={handleSaveAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="h-11 rounded-lg border border-gray-200 px-3 text-sm" required />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Subject</span>
            <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="h-11 rounded-lg border border-gray-200 px-3 text-sm" required />
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[88px] rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Class</span>
            <select value={form.school_class_id} onChange={(event) => setForm((current) => ({ ...current, school_class_id: event.target.value }))} className="h-11 rounded-lg border border-gray-200 px-3 text-sm">
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.grade_level ? `(${item.grade_level})` : ''}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Due Date</span>
            <input type="datetime-local" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} className="h-11 rounded-lg border border-gray-200 px-3 text-sm" required />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Maximum Score</span>
            <input type="number" min={1} value={form.max_score} onChange={(event) => setForm((current) => ({ ...current, max_score: event.target.value }))} className="h-11 rounded-lg border border-gray-200 px-3 text-sm" required />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))} />
            Publish now
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
            <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70">
              {saving ? 'Saving...' : editingAssignmentId ? 'Update Assignment' : 'Create Assignment'}
            </button>
            {editingAssignmentId && (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancel Edit
              </button>
            )}
            {error && <span className="text-sm text-red-600">{error}</span>}
            {success && <span className="text-sm text-green-700">{success}</span>}
          </div>
        </form>
      </div>

      <div className="md:col-span-2 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h3>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500">No assignments yet.</p>
          ) : assignments.map((item) => (
            <div key={item.id} className={`rounded-lg border p-3 ${item.is_overdue ? 'border-red-300 bg-red-50/50' : item.is_due_soon ? 'border-yellow-200 bg-yellow-50/50' : item.id === selectedAssignmentId ? 'border-green-300 bg-green-50/50' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="cursor-pointer" onClick={() => setSelectedAssignmentId(item.id)}>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.subject} • {item.school_class}</p>
                  <p className="text-xs text-gray-400 mt-1">Due: {new Date(item.due_date).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Submitted: {item.submission_count} • Pending: {item.pending_count}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.is_overdue ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue • {item.overdue_count}</span>
                  ) : item.is_due_soon ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Due Soon • {item.due_in_days}d</span>
                  ) : null}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => handleEditAssignment(item)} className="px-3 py-1.5 rounded bg-green-50 text-green-700 text-xs font-semibold">Edit</button>
                <button type="button" onClick={() => handleDeleteAssignment(item.id)} className="px-3 py-1.5 rounded bg-red-50 text-red-700 text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials</h3>
        {!selectedAssignment ? (
          <p className="text-sm text-gray-500">Select an assignment to manage materials.</p>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {selectedAssignment.materials.length === 0 ? (
                <p className="text-sm text-gray-500">No materials attached yet.</p>
              ) : selectedAssignment.materials.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 uppercase">{item.material_type}</p>
                      <p className="text-xs text-gray-600 mt-1 break-words">{item.content}</p>
                    </div>
                    <button type="button" onClick={() => handleDeleteMaterial(item.id)} className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3">
              <input value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Material title" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" required />
              <select value={materialType} onChange={(event) => setMaterialType(event.target.value as 'link' | 'note')} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
                <option value="link">Link</option>
                <option value="note">Note</option>
              </select>
              <textarea value={materialContent} onChange={(event) => setMaterialContent(event.target.value)} placeholder="Paste URL or lesson notes" className="min-h-[90px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
              <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70">Add Material</button>
            </form>
          </>
        )}
      </div>

      <div className="md:col-span-3 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissions and Grading</h3>
        {!selectedAssignment ? (
          <p className="text-sm text-gray-500">Select an assignment to review submissions.</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet for this assignment.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{submission.student_name}</p>
                    <p className="text-xs text-gray-500">{submission.admission_number} • Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{submission.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="number"
                    min={0}
                    max={submission.max_score}
                    value={scoreBySubmission[submission.id] ?? String(submission.score)}
                    onChange={(event) => setScoreBySubmission((current) => ({ ...current, [submission.id]: event.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
                    placeholder="Score"
                  />
                  <select
                    value={statusBySubmission[submission.id] || 'graded'}
                    onChange={(event) => setStatusBySubmission((current) => ({ ...current, [submission.id]: event.target.value as 'graded' | 'returned' | 'late' }))}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
                  >
                    <option value="graded">Graded</option>
                    <option value="returned">Returned</option>
                    <option value="late">Late</option>
                  </select>
                  <input
                    value={feedbackBySubmission[submission.id] ?? submission.teacher_feedback}
                    onChange={(event) => setFeedbackBySubmission((current) => ({ ...current, [submission.id]: event.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm md:col-span-2"
                    placeholder="Feedback"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => handleGradeSubmission(submission)} disabled={saving} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-70">
                    Save Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
