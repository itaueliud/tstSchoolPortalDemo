'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { Users, Banknote, FileText, Bell, CreditCard, BarChart3, Settings } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { API_BASE_URL, requestBlob, requestJson } from '../../src/apiClient'

type ManagedUser = {
  id?: string
  username?: string
  name: string
  first_name?: string
  last_name?: string
  email: string
  role: string
  phone_number?: string
  status: string
  is_active?: boolean
}

type ManagedFee = {
  id?: string
  reference?: string
  student: string
  class: string
  amount: string
  paid_amount?: string
  status: string
  due_date?: string
  phone_number?: string
  outstanding_amount?: string
  payment_count?: number
  latest_payment_status?: string
}

type ManagedPayment = {
  id: string
  invoice_reference: string
  student: string
  amount: string
  status: string
  phone_number: string
  checkout_request_id: string
  mpesa_receipt_number: string
  initiated_at: string
  completed_at: string
}

type StudentOption = {
  id: string
  admission_number: string
  name: string
  class_name: string
}

type ClassOption = {
  id: string
  name: string
  grade_level: string
  room: string
}

type AdminActivity = {
  id: string
  action: string
  entity_type: string
  entity_id: string
  actor_username: string
  details: Record<string, unknown>
  created_at: string
}

const emptyUserForm = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  role: 'teacher',
  is_active: true,
  // Student-specific fields
  admission_number: '',
  class_id: '',
  // Teacher-specific fields
  subject: '',
  classes_taught: [] as string[],
  // Parent-specific fields
  student_ids: [] as string[],
}

const emptyFeeForm = {
  student_admission_number: '',
  reference: '',
  amount: '',
  paid_amount: '',
  status: 'pending',
  due_date: '',
}

const normalizeStatus = (status: string) => status.toLowerCase()

const toDateTimeLocal = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const formatUtcDateTime = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

export default function AdminDashboard(){
  const { data, loading, error } = useDashboardSummary('admin')
  const summary = data?.summary || {}
  const announcements = data?.announcements || []
  const [overview, setOverview] = useState<null | {
    analytics: Array<{ month: string; attendance: number; revenue: number }>
    lms_analytics?: {
      published_assignments: number
      expected_submissions: number
      submitted: number
      submission_rate: number
      late_submissions: number
      late_rate: number
      graded_submissions: number
      pending_grading: number
      average_grading_turnaround_hours: number
    }
    users: Array<{ id: string; name: string; role: string; email: string; status: string }>
    fees: Array<{ reference: string; student: string; class: string; amount: string; paid: string; status: string }>
    reports: Array<{ name: string; date: string; type: string; key: string }>
  }>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState('')
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])
  const [managedFees, setManagedFees] = useState<ManagedFee[]>([])
  const [managedPayments, setManagedPayments] = useState<ManagedPayment[]>([])
  const [feeStudents, setFeeStudents] = useState<StudentOption[]>([])
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([])
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminActivity[]>([])
  const [managementLoading, setManagementLoading] = useState(true)
  const [managementError, setManagementError] = useState('')
  const [editingUserId, setEditingUserId] = useState('')
  const [editingFeeId, setEditingFeeId] = useState('')
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [feeForm, setFeeForm] = useState(emptyFeeForm)
  const [savingUser, setSavingUser] = useState(false)
  const [savingFee, setSavingFee] = useState(false)
  const [userPage, setUserPage] = useState(1)
  const [feePage, setFeePage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [feeTotalPages, setFeeTotalPages] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const summaryValues = summary as Record<string, string | number | undefined>

  const cards = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'Total Students', value: Number(summaryValues.students) || 0 },
    { title: 'Teachers', value: Number(summaryValues.teachers) || 0 },
    { title: 'Classes', value: Number(summaryValues.classes) || 0 },
    { title: 'Revenue', value: summaryValues.revenue ? `KES ${summaryValues.revenue}` : 'KES 0' },
  ]), [summaryValues])

  const displayedUsers = managedUsers
  const displayedFees = managedFees

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      setOverviewLoading(true)
      setOverviewError('')

      try {
        const response = await requestJson<{
          analytics: Array<{ month: string; attendance: number; revenue: number }>
          lms_analytics?: {
            published_assignments: number
            expected_submissions: number
            submitted: number
            submission_rate: number
            late_submissions: number
            late_rate: number
            graded_submissions: number
            pending_grading: number
            average_grading_turnaround_hours: number
          }
          users: Array<{ id: string; name: string; role: string; email: string; status: string }>
          fees: Array<{ reference: string; student: string; class: string; amount: string; paid: string; status: string }>
          reports: Array<{ name: string; date: string; type: string; key: string }>
        }>('/api/dashboard/admin/overview/')

        if (!active) return
        setOverview(response)
      } catch (overviewLoadError) {
        if (active) {
          setOverviewError(overviewLoadError instanceof Error ? overviewLoadError.message : 'Unable to load admin overview')
        }
      } finally {
        if (active) {
          setOverviewLoading(false)
        }
      }
    }

    loadOverview()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadManagement = async () => {
      setManagementLoading(true)
      setManagementError('')

      try {
        const [usersResponse, feesResponse, paymentsResponse, classesResponse, studentsResponse] = await Promise.all([
          requestJson<{ users: ManagedUser[]; total_pages: number }>('/api/dashboard/admin/users/?page=%s&page_size=8'.replace('%s', String(userPage))),
          requestJson<{ fees: ManagedFee[]; students: StudentOption[]; total_pages: number }>('/api/dashboard/admin/fees/?page=%s&page_size=6'.replace('%s', String(feePage))),
          requestJson<{ payments: ManagedPayment[]; total_pages: number }>('/api/dashboard/fees/payments/?page=1&page_size=8'),
          requestJson<{ classes: ClassOption[] }>('/api/dashboard/admin/classes/list/').catch(() => ({ classes: [] })),
          requestJson<{ students: StudentOption[] }>('/api/dashboard/admin/students/').catch(() => ({ students: [] })),
        ])

        if (!active) return
        setManagedUsers(usersResponse.users)
        setManagedFees(feesResponse.fees)
        setManagedPayments(paymentsResponse.payments || [])
        setFeeStudents(feesResponse.students)
        setAvailableClasses(classesResponse.classes || [])
        setAvailableStudents(studentsResponse.students || [])
        setUserTotalPages(usersResponse.total_pages || 1)
        setFeeTotalPages(feesResponse.total_pages || 1)
      } catch (managementLoadError) {
        if (active) {
          setManagementError(managementLoadError instanceof Error ? managementLoadError.message : 'Unable to load admin management data')
        }
      } finally {
        if (active) {
          setManagementLoading(false)
        }
      }
    }

    loadManagement()

    return () => {
      active = false
    }
  }, [userPage, feePage])

  useEffect(() => {
    let active = true

    const loadActivity = async () => {
      try {
        const response = await requestJson<{ items: AdminActivity[]; total_pages: number }>(`/api/dashboard/admin/activity/?page=${auditPage}&page_size=5`)
        if (!active) return
        setAuditLogs(response.items)
        setAuditTotalPages(response.total_pages || 1)
      } catch {
        if (active) {
          setAuditLogs([])
        }
      }
    }

    loadActivity()

    return () => {
      active = false
    }
  }, [auditPage])

  const refreshManagementData = async () => {
    const [usersResponse, feesResponse, paymentsResponse, classesResponse, studentsResponse] = await Promise.all([
      requestJson<{ users: ManagedUser[]; total_pages: number }>(`/api/dashboard/admin/users/?page=${userPage}&page_size=8`),
      requestJson<{ fees: ManagedFee[]; students: StudentOption[]; total_pages: number }>(`/api/dashboard/admin/fees/?page=${feePage}&page_size=6`),
      requestJson<{ payments: ManagedPayment[]; total_pages: number }>('/api/dashboard/fees/payments/?page=1&page_size=8'),
      requestJson<{ classes: ClassOption[] }>('/api/dashboard/admin/classes/list/').catch(() => ({ classes: [] })),
      requestJson<{ students: StudentOption[] }>('/api/dashboard/admin/students/').catch(() => ({ students: [] })),
    ])

    setManagedUsers(usersResponse.users)
    setManagedFees(feesResponse.fees)
    setManagedPayments(paymentsResponse.payments || [])
    setFeeStudents(feesResponse.students)
    setAvailableClasses(classesResponse.classes || [])
    setAvailableStudents(studentsResponse.students || [])
    setUserTotalPages(usersResponse.total_pages || 1)
    setFeeTotalPages(feesResponse.total_pages || 1)
  }

  const handleSendMpesaRequest = async (fee: ManagedFee) => {
    if (!fee.reference) return

    try {
      await requestJson('/api/dashboard/fees/payments/', {
        method: 'POST',
        body: JSON.stringify({
          reference: fee.reference,
          phone_number: fee.phone_number || '',
        }),
      })
      await refreshManagementData()
    } catch (paymentError) {
      setManagementError(paymentError instanceof Error ? paymentError.message : 'Unable to initiate M-Pesa request')
    }
  }

  const resetUserForm = () => {
    setEditingUserId('')
    setUserForm(emptyUserForm)
  }

  const resetFeeForm = () => {
    setEditingFeeId('')
    setFeeForm(emptyFeeForm)
  }

  const startEditUser = (user: ManagedUser) => {
    if (!user.id) return
    setEditingUserId(user.id)
    setUserForm({
      ...emptyUserForm,
      username: user.username || '',
      email: user.email,
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      role: user.role || 'teacher',
      is_active: user.is_active ?? true,
    })
  }

  const startEditFee = (fee: ManagedFee) => {
    if (!fee.id) return
    setEditingFeeId(fee.id)
    setFeeForm({
      student_admission_number: fee.student || '',
      reference: fee.reference || '',
      amount: fee.amount.replace(/,/g, ''),
      paid_amount: (fee.paid_amount || '').replace(/,/g, ''),
      status: normalizeStatus(fee.status || 'pending'),
      due_date: toDateTimeLocal(fee.due_date || ''),
    })
  }

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingUser(true)

    try {
      const payload: Record<string, string | boolean | string[]> = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        first_name: userForm.first_name.trim(),
        last_name: userForm.last_name.trim(),
        phone_number: userForm.phone_number.trim(),
        role: userForm.role,
        is_active: userForm.is_active,
      }

      if (userForm.password.trim()) {
        payload.password = userForm.password.trim()
      }

      // Add role-specific fields
      if (userForm.role === 'student') {
        payload.admission_number = userForm.admission_number.trim()
        payload.class_id = userForm.class_id
      } else if (userForm.role === 'teacher') {
        payload.subject = userForm.subject.trim()
        payload.classes_taught = userForm.classes_taught
      } else if (userForm.role === 'parent') {
        payload.student_ids = userForm.student_ids
      }

      if (editingUserId) {
        await requestJson(`/api/dashboard/admin/users/${editingUserId}/`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await requestJson('/api/dashboard/admin/users/', { method: 'POST', body: JSON.stringify(payload) })
      }

      await refreshManagementData()
      resetUserForm()
    } finally {
      setSavingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return
    await requestJson(`/api/dashboard/admin/users/${userId}/`, { method: 'DELETE' })
    await refreshManagementData()
    if (editingUserId === userId) {
      resetUserForm()
    }
  }

  const handleUserPageChange = (nextPage: number) => {
    setUserPage(Math.min(Math.max(nextPage, 1), userTotalPages))
  }

  const handleFeeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingFee(true)

    try {
      const payload: Record<string, string | number> = {
        student_admission_number: feeForm.student_admission_number.trim(),
        reference: feeForm.reference.trim(),
        amount: Number(feeForm.amount),
        paid_amount: Number(feeForm.paid_amount || 0),
        status: feeForm.status,
      }

      if (feeForm.due_date) {
        payload.due_date = new Date(feeForm.due_date).toISOString()
      }

      if (editingFeeId) {
        await requestJson(`/api/dashboard/admin/fees/${editingFeeId}/`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await requestJson('/api/dashboard/admin/fees/', { method: 'POST', body: JSON.stringify(payload) })
      }

      await refreshManagementData()
      resetFeeForm()
    } finally {
      setSavingFee(false)
    }
  }

  const handleDeleteFee = async (feeId: string) => {
    if (!window.confirm('Delete this fee invoice?')) return
    await requestJson(`/api/dashboard/admin/fees/${feeId}/`, { method: 'DELETE' })
    await refreshManagementData()
    if (editingFeeId === feeId) {
      resetFeeForm()
    }
  }

  const handleFeePageChange = (nextPage: number) => {
    setFeePage(Math.min(Math.max(nextPage, 1), feeTotalPages))
  }

  const handleAuditPageChange = (nextPage: number) => {
    setAuditPage(Math.min(Math.max(nextPage, 1), auditTotalPages))
  }

  const lmsAnalytics = overview?.lms_analytics || {
    published_assignments: 0,
    expected_submissions: 0,
    submitted: 0,
    submission_rate: 0,
    late_submissions: 0,
    late_rate: 0,
    graded_submissions: 0,
    pending_grading: 0,
    average_grading_turnaround_hours: 0,
  }

  const openReportPdf = async (reportKey: string) => {
    try {
      const blob = await requestBlob(`/api/reports/${reportKey}/pdf/`)
      const objectUrl = URL.createObjectURL(blob)
      const pdfWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer')

      if (pdfWindow) {
        pdfWindow.focus()
      }

      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } catch {
      const fallbackUrl = `${API_BASE_URL}/api/reports/${reportKey}/pdf/`
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Layout role="admin">
      {/* Key Stats */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => <StatCard key={card.title} title={card.title} value={card.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      {/* Analytics Chart */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">School Analytics</h3>
        </div>
        <div className="space-y-4">
          {(overview?.analytics || []).map((item) => (
            <div key={item.month} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-2 sm:col-span-1 text-sm font-semibold text-gray-700">{item.month}</div>
              <div className="col-span-10 sm:col-span-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Attendance</span>
                  <span>{item.attendance}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-green-600" style={{ width: `${item.attendance}%` }} />
                </div>
              </div>
              <div className="col-span-10 col-start-3 sm:col-span-5 sm:col-start-7">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Revenue</span>
                  <span>KES {item.revenue}K</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.revenue}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="space-y-3">
          {(announcements.length ? announcements : []).map((announcement, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">{announcement.title}</p>
              <p className="text-xs text-green-700 mt-1">{announcement.body}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-sm text-gray-500">No active announcements available.</p>}
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">LMS Analytics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <p className="text-xs text-gray-500">Submission Rate</p>
            <p className="text-lg font-semibold text-gray-900">{lmsAnalytics.submission_rate}%</p>
            <p className="text-xs text-gray-500 mt-1">{lmsAnalytics.submitted}/{lmsAnalytics.expected_submissions} expected submissions</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <p className="text-xs text-gray-500">Late Rate</p>
            <p className="text-lg font-semibold text-gray-900">{lmsAnalytics.late_rate}%</p>
            <p className="text-xs text-gray-500 mt-1">{lmsAnalytics.late_submissions} late submissions</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <p className="text-xs text-gray-500">Pending Grading</p>
            <p className="text-lg font-semibold text-gray-900">{lmsAnalytics.pending_grading}</p>
            <p className="text-xs text-gray-500 mt-1">{lmsAnalytics.graded_submissions} graded submissions</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3 bg-gray-50">
            <p className="text-xs text-gray-500">Avg Grading Turnaround</p>
            <p className="text-lg font-semibold text-gray-900">{lmsAnalytics.average_grading_turnaround_hours}h</p>
            <p className="text-xs text-gray-500 mt-1">Across published assignments: {lmsAnalytics.published_assignments}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <form onSubmit={handleUserSubmit} className="space-y-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <input value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Username" required />
            <input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="email" placeholder="Email" required />
            <input value={userForm.first_name} onChange={(event) => setUserForm((current) => ({ ...current, first_name: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="First name" />
            <input value={userForm.last_name} onChange={(event) => setUserForm((current) => ({ ...current, last_name: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Last name" />
            <input value={userForm.phone_number} onChange={(event) => setUserForm((current) => ({ ...current, phone_number: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Phone number" />
            <input value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="password" placeholder={editingUserId ? 'New password (optional)' : 'Password'} required={!editingUserId} />
            <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <input checked={userForm.is_active} onChange={(event) => setUserForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Active account
            </label>
          </div>

          {/* Student-specific fields */}
          {userForm.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input value={userForm.admission_number} onChange={(event) => setUserForm((current) => ({ ...current, admission_number: event.target.value }))} className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Admission number" required />
              <select value={userForm.class_id} onChange={(event) => setUserForm((current) => ({ ...current, class_id: event.target.value }))} className="border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white" required>
                <option value="">Select class (required)</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name} - {cls.grade_level}</option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher-specific fields */}
          {userForm.role === 'teacher' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <input value={userForm.subject} onChange={(event) => setUserForm((current) => ({ ...current, subject: event.target.value }))} className="border border-green-200 rounded-lg px-3 py-2 text-sm bg-white" placeholder="Subject" />
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Assign classes (optional)</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-white border border-green-200 rounded-lg">
                  {availableClasses.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 rounded-full cursor-pointer hover:bg-green-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={userForm.classes_taught.includes(cls.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setUserForm((current) => ({ ...current, classes_taught: [...current.classes_taught, cls.id] }))
                          } else {
                            setUserForm((current) => ({ ...current, classes_taught: current.classes_taught.filter((id) => id !== cls.id) }))
                          }
                        }}
                      />
                      {cls.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Parent-specific fields */}
          {userForm.role === 'parent' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">Link to student children (optional)</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white border border-purple-200 rounded-lg">
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <label key={student.id} className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 rounded-full cursor-pointer hover:bg-purple-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={userForm.student_ids.includes(student.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setUserForm((current) => ({ ...current, student_ids: [...current.student_ids, student.id] }))
                          } else {
                            setUserForm((current) => ({ ...current, student_ids: current.student_ids.filter((id) => id !== student.id) }))
                          }
                        }}
                      />
                      {student.name} ({student.admission_number})
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No students available</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={savingUser} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-60">{editingUserId ? 'Update user' : 'Create user'}</button>
            <button type="button" onClick={resetUserForm} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white">Clear</button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 text-gray-600 font-semibold">Name</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Role</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Email</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Status</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, idx) => (
                <tr key={user.id ?? idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 text-gray-900 font-medium">
                    <div>{user.name}</div>
                    <div className="text-xs text-gray-500">{user.username ? `@${user.username}` : user.email}</div>
                  </td>
                  <td className="p-2 text-gray-600">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{user.role}</span>
                  </td>
                  <td className="p-2 text-gray-600">{user.email}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{user.status}</span>
                  </td>
                  <td className="p-2">
                    {user.id ? (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEditUser(user)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Edit</button>
                        <button type="button" onClick={() => handleDeleteUser(user.id!)} className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Read only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayedUsers.length === 0 && !managementLoading && <p className="mt-3 text-sm text-gray-500">No users found.</p>}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {userPage} of {userTotalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleUserPageChange(userPage - 1)} disabled={userPage <= 1} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Prev</button>
            <button type="button" onClick={() => handleUserPageChange(userPage + 1)} disabled={userPage >= userTotalPages} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Fee Tracking */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fee Tracking</h3>
        </div>
        <form onSubmit={handleFeeSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <select value={feeForm.student_admission_number} onChange={(event) => setFeeForm((current) => ({ ...current, student_admission_number: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" required>
            <option value="">Select student</option>
            {feeStudents.map((student) => (
              <option key={student.id} value={student.admission_number}>{student.admission_number} - {student.name}</option>
            ))}
          </select>
          <input value={feeForm.reference} onChange={(event) => setFeeForm((current) => ({ ...current, reference: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Reference" required />
          <input value={feeForm.amount} onChange={(event) => setFeeForm((current) => ({ ...current, amount: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="number" min="0" step="0.01" placeholder="Amount" required />
          <input value={feeForm.paid_amount} onChange={(event) => setFeeForm((current) => ({ ...current, paid_amount: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="number" min="0" step="0.01" placeholder="Paid amount" />
          <select value={feeForm.status} onChange={(event) => setFeeForm((current) => ({ ...current, status: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
          <input value={feeForm.due_date} onChange={(event) => setFeeForm((current) => ({ ...current, due_date: event.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="datetime-local" />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={savingFee} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-60">{editingFeeId ? 'Update invoice' : 'Create invoice'}</button>
            <button type="button" onClick={resetFeeForm} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white">Clear</button>
          </div>
        </form>
        <div className="space-y-3">
          {displayedFees.map((fee, idx) => {
            const status = normalizeStatus(fee.status)

            return (
              <div key={fee.id ?? idx} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{fee.student}</p>
                    <p className="text-sm text-gray-500">{fee.class}</p>
                    {fee.reference && <p className="text-xs text-gray-400 mt-1">Ref: {fee.reference}</p>}
                    {fee.phone_number && <p className="text-xs text-gray-400 mt-1">M-Pesa: {fee.phone_number}</p>}
                    {fee.outstanding_amount && <p className="text-xs text-gray-500 mt-1">Outstanding: KES {fee.outstanding_amount}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">KES {fee.amount}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status === 'paid' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>{fee.status}</span>
                    {fee.id && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <button type="button" onClick={() => startEditFee(fee)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Edit</button>
                        <button type="button" onClick={() => handleSendMpesaRequest(fee)} className="text-xs font-semibold text-white bg-green-600 px-3 py-1.5 rounded hover:bg-green-700">Send M-Pesa</button>
                        <button type="button" onClick={() => handleDeleteFee(fee.id!)} className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {displayedFees.length === 0 && !managementLoading && <p className="text-sm text-gray-500">No fee invoices found.</p>}
        </div>
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Recent M-Pesa Payments</h4>
            <span className="text-xs text-gray-500">Latest payment requests and confirmations</span>
          </div>
          <div className="space-y-2">
            {managedPayments.length ? managedPayments.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{payment.student} • {payment.invoice_reference}</p>
                    <p className="text-xs text-gray-500 mt-1">{payment.phone_number} • KES {payment.amount}</p>
                    <p className="text-xs text-gray-400 mt-1">{payment.checkout_request_id}{payment.mpesa_receipt_number ? ` • Receipt ${payment.mpesa_receipt_number}` : ''}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'success' ? 'bg-green-100 text-green-700' : payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No payment requests yet.</p>}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {feePage} of {feeTotalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleFeePageChange(feePage - 1)} disabled={feePage <= 1} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Prev</button>
            <button type="button" onClick={() => handleFeePageChange(feePage + 1)} disabled={feePage >= feeTotalPages} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
        {managementLoading && <p className="mt-3 text-xs text-gray-500">Loading admin records...</p>}
        {managementError && <p className="mt-3 text-xs text-red-600">{managementError}</p>}
      </div>

      {/* Reports and Exports */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        </div>
        <div className="space-y-2">
          {(overview?.reports || []).map((report, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-500">{report.date}</p>
              </div>
              <button type="button" onClick={() => openReportPdf(report.key)} className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Open PDF</button>
            </div>
          ))}
          {(overview?.reports || []).length === 0 && <p className="text-sm text-gray-500">No reports available.</p>}
        </div>
        {overviewLoading && <p className="mt-3 text-xs text-gray-500">Loading live admin data...</p>}
        {overviewError && <p className="mt-3 text-xs text-red-600">{overviewError}</p>}
      </div>

      {/* System Settings */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Settings & Permissions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
            <p className="font-semibold text-gray-900 mb-2">👥 Role Management</p>
            <p className="text-sm text-gray-600">Configure user roles and permissions</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
            <p className="font-semibold text-gray-900 mb-2">🔐 Security</p>
            <p className="text-sm text-gray-600">Manage passwords and access controls</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
            <p className="font-semibold text-gray-900 mb-2">📋 Audit Logs</p>
            <p className="text-sm text-gray-600">View system activity and changes</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
            <p className="font-semibold text-gray-900 mb-2">⚙️ Preferences</p>
            <p className="text-sm text-gray-600">Customize system settings</p>
          </div>
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {auditLogs.length ? auditLogs.map((entry) => (
            <div key={entry.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{entry.action} {entry.entity_type}</p>
                  <p className="text-xs text-gray-500">By {entry.actor_username} • {entry.entity_id}</p>
                </div>
                <span className="text-[11px] text-gray-400">{formatUtcDateTime(entry.created_at)}</span>
              </div>
            </div>
          )) : <p className="text-sm text-gray-500">No recent admin activity.</p>}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {auditPage} of {auditTotalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleAuditPageChange(auditPage - 1)} disabled={auditPage <= 1} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Prev</button>
            <button type="button" onClick={() => handleAuditPageChange(auditPage + 1)} disabled={auditPage >= auditTotalPages} className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

