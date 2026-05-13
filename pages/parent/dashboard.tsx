import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { User, Award, CreditCard, Bell } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'
import { requestJson } from '../../src/apiClient'

type FeePayment = {
  id: string
  invoice_reference: string
  amount: string
  status: string
  phone_number: string
  checkout_request_id: string
  mpesa_receipt_number: string
  initiated_at: string
  completed_at: string
}

type FeeStatement = {
  id: string
  reference: string
  student_name: string
  student: string
  class: string
  amount: number
  paid_amount: number
  outstanding_amount: number
  status: string
  due_date: string
  payments: FeePayment[]
}

export default function ParentDashboard(){
  const { data, loading, error } = useDashboardSummary('parent')
  const summary = data?.summary || {}
  const announcements = data?.announcements || []
  const summaryValues = summary as Record<string, string | number | undefined>
  const [statements, setStatements] = useState<FeeStatement[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [feesLoading, setFeesLoading] = useState(true)
  const [feesError, setFeesError] = useState('')

  const stats = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'Child', value: String(summaryValues.child_name || 'No child linked') },
    { title: 'Attendance', value: String(summaryValues.attendance || '0%') },
    { title: 'Current GPA', value: String(summaryValues.latest_grade || 'N/A') },
    { title: 'Class', value: String(summaryValues.child_class || 'N/A') },
  ]), [summaryValues])

  useEffect(() => {
    let active = true

    const loadFees = async () => {
      setFeesLoading(true)
      setFeesError('')

      try {
        const response = await requestJson<{ statements: FeeStatement[]; payments: FeePayment[] }>('/api/fees/statements/?page=1&page_size=8')
        if (!active) return
        setStatements(response.statements || [])
        setPayments(response.payments || [])
      } catch (loadError) {
        if (active) {
          setFeesError(loadError instanceof Error ? loadError.message : 'Unable to load fee statements')
        }
      } finally {
        if (active) {
          setFeesLoading(false)
        }
      }
    }

    loadFees()

    return () => {
      active = false
    }
  }, [])

  return (
    <Layout role="parent">
      {/* Child Info */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      {/* Child Profile */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Child Information</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Admission Number</p>
            <p className="font-semibold text-gray-900">{String(summaryValues.admission_number || 'N/A')}</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Current Class</p>
            <p className="font-semibold text-gray-900">{String(summaryValues.child_class || 'N/A')}</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Class Teacher</p>
            <p className="font-semibold text-gray-900">{String(summaryValues.class_teacher || 'N/A')}</p>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="space-y-2">
          {(announcements.length ? announcements : [
            { title: 'Parent-Teacher Meeting', body: 'Scheduled at 4:00 PM' },
            { title: 'Sports Day', body: 'All students to participate' },
            { title: 'Exam Schedule', body: 'Final exams begin' },
          ]).map((announcement, idx) => (
            <div key={idx} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-semibold text-gray-900">{announcement.title}</p>
              <p className="text-xs text-gray-500">{announcement.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Snapshot */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Academic Progress</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-100 bg-green-50 p-3">
            <p className="text-xs text-green-700 font-semibold">Attendance</p>
            <p className="text-lg font-bold text-green-900 mt-1">{String(summaryValues.attendance || '0%')}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-blue-50 p-3">
            <p className="text-xs text-blue-700 font-semibold">Grade Snapshot</p>
            <p className="text-lg font-bold text-blue-900 mt-1">{String(summaryValues.latest_grade || 'N/A')}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-yellow-50 p-3">
            <p className="text-xs text-yellow-700 font-semibold">Fee Balance</p>
            <p className="text-lg font-bold text-yellow-900 mt-1">KES {String(summaryValues.fees_due || '0')}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/parent/fees" className="rounded-lg border border-gray-100 bg-green-50/60 p-4 hover:border-green-200 transition-colors">
            <p className="font-semibold text-gray-900">Fee Statements</p>
            <p className="text-sm text-gray-600 mt-1">Review invoices, make M-Pesa payments, and download receipts.</p>
          </Link>
          <Link href="/parent/progress" className="rounded-lg border border-gray-100 bg-blue-50/60 p-4 hover:border-blue-200 transition-colors">
            <p className="font-semibold text-gray-900">Academic Progress</p>
            <p className="text-sm text-gray-600 mt-1">See attendance, class, and current performance snapshot.</p>
          </Link>
          <Link href="/parent/attendance" className="rounded-lg border border-gray-100 bg-yellow-50/60 p-4 hover:border-yellow-200 transition-colors">
            <p className="font-semibold text-gray-900">Attendance</p>
            <p className="text-sm text-gray-600 mt-1">Check the live attendance summary for the linked child.</p>
          </Link>
          <Link href="/parent/announcements" className="rounded-lg border border-gray-100 bg-indigo-50/60 p-4 hover:border-indigo-200 transition-colors">
            <p className="font-semibold text-gray-900">Announcements</p>
            <p className="text-sm text-gray-600 mt-1">Read the latest school notices and updates.</p>
          </Link>
        </div>
      </div>

      {/* Fee Status */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fee Summary</h3>
        </div>
        {feesLoading ? (
          <p className="text-sm text-gray-500">Loading fee statements...</p>
        ) : feesError ? (
          <p className="text-sm text-red-600">{feesError}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-semibold">INVOICED</p>
              <p className="text-lg font-bold text-green-900 mt-1">KES {summaryValues.fees_due ? Number(summaryValues.fees_due).toLocaleString() : '0'}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold">PAYMENTS</p>
              <p className="text-lg font-bold text-blue-900 mt-1">{payments.length}</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 font-semibold">OPEN STATEMENTS</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">{statements.filter((statement) => statement.outstanding_amount > 0).length}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
