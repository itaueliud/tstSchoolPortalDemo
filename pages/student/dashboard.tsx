import Link from 'next/link'
import { useMemo } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { BookOpen, Bell, CreditCard } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'

export default function StudentDashboard(){
  const { data, loading, error } = useDashboardSummary('student')
  const summary = data?.summary || {}
  const announcements = data?.announcements || []
  const summaryValues = summary as Record<string, string | number | undefined>

  const stats = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'Attendance', value: String(summaryValues.attendance || '92%') },
    { title: 'Fee Balance', value: summaryValues.fees_due ? `KES ${summaryValues.fees_due}` : 'KES 12,450' },
    { title: 'Active Assignments', value: Number(summaryValues.assignments) || 3 },
    { title: 'Current GPA', value: String(summaryValues.gpa || '3.8') },
  ]), [summaryValues])

  return (
    <Layout role="student">
      {/* Key Stats */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="space-y-3">
          {(announcements.length ? announcements : [
            { title: 'PTA Meeting', body: 'This Saturday at 10:00 AM' },
            { title: 'Exams Start', body: 'Next month - Prepare well!' },
          ]).map((announcement, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">🎉 {announcement.title}</p>
              <p className="text-xs text-green-700 mt-1">{announcement.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Assignments & LMS</h3>
        </div>
        <div className="rounded-lg border border-gray-100 bg-green-50/50 p-4">
          <p className="font-semibold text-gray-900">Open your live assignments workspace</p>
          <p className="text-sm text-gray-600 mt-1">Read lesson notes, view assignment deadlines, submit work, and track grading feedback in one place.</p>
          <Link href="/student/assignments" className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
            Open Assignments & LMS
          </Link>
        </div>
      </div>

      {/* Fee Payments */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fee Statements</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">View your fee statements, payment history, and download receipts in the dedicated fee page.</p>
        <Link href="/student/fees" className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
          Open Fees & Receipts
        </Link>
      </div>
    </Layout>
  )
}
