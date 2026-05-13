import Link from 'next/link'
import { useMemo } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { Calendar, ClipboardCheck, Upload, Award, BarChart3, MessageSquare, Bell } from 'lucide-react'
import { useDashboardSummary } from '../../src/useDashboardSummary'

const classes = [
  { name: 'Form 4A - Mathematics', students: 32, period: '09:00 - 10:00', room: 'Room 12' },
  { name: 'Form 3B - Mathematics', students: 28, period: '10:30 - 11:30', room: 'Room 9' },
  { name: 'Form 4C - Science', students: 35, period: '01:00 - 02:00', room: 'Lab 2' },
  { name: 'Form 3A - Science', students: 30, period: '02:30 - 03:30', room: 'Lab 1' },
]

const attendance = [
  { student: 'John Doe', status: 'Present' },
  { student: 'Jane Smith', status: 'Absent' },
  { student: 'Mike Brown', status: 'Late' },
  { student: 'Aisha Khan', status: 'Present' },
]

const pendingGrades = [
  { student: 'John Doe', exam: 'Mid-Term Test', class: 'Form 4A', status: 'Pending' },
  { student: 'Jane Smith', exam: 'Monthly Quiz', class: 'Form 3B', status: 'Pending' },
  { student: 'Mike Brown', exam: 'Project Work', class: 'Form 4C', status: 'Pending' },
]

const performance = [
  { subject: 'Mathematics', average: 84, trend: '+6%' },
  { subject: 'Science', average: 79, trend: '+3%' },
  { subject: 'English', average: 88, trend: '+4%' },
]

const messages = [
  { name: 'Mrs. Wanjiku', role: 'Parent', message: 'Could you share the revision notes for this week?', time: '10m ago' },
  { name: 'John Doe', role: 'Student', message: 'I submitted my assignment late after network issues.', time: '35m ago' },
  { name: 'Mr. Kariuki', role: 'Parent', message: 'Please confirm the grade for the last test.', time: '1h ago' },
]

export default function TeacherDashboard(){
  const { data, loading, error } = useDashboardSummary('teacher')
  const summary = data?.summary || {}
  const announcements = data?.announcements || []
  const summaryValues = summary as Record<string, string | number | undefined>

  const stats = useMemo<Array<{ title: string; value: string | number }>>(() => ([
    { title: 'My Classes', value: Number(summaryValues.classes) || 4 },
    { title: 'Total Students', value: Number(summaryValues.students) || 126 },
    { title: 'Active Assignments', value: Number(summaryValues.assignments) || 8 },
    { title: 'Pending Grades', value: Number(summaryValues.pending_grades) || 23 },
  ]), [summaryValues])

  return (
    <Layout role="teacher">
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)}
      </div>

      {loading && <div className="md:col-span-3 text-sm text-white/60">Loading dashboard summary from backend...</div>}
      {error && <div className="md:col-span-3 text-sm text-red-500">{error}</div>}

      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Class Management</h3>
        </div>
        <div className="space-y-3">
          {classes.map((cls, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{cls.name}</p>
                  <p className="text-sm text-gray-500">{cls.period}</p>
                  <p className="text-xs text-gray-400 mt-1">{cls.room}</p>
                </div>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  {cls.students} students
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Attendance Management</h3>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-100 bg-green-50 p-4">
            <p className="font-semibold text-gray-900">Open the live attendance register</p>
            <p className="text-sm text-gray-600 mt-1">Mark present, absent, late, or leave for an entire class and date, then edit the saved records when needed.</p>
          </div>
          <Link href="/teacher/attendance" className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
            Open Attendance Register
          </Link>
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Assignments and Notes</h3>
        </div>
        <div className="rounded-lg border border-gray-100 bg-green-50/50 p-4">
          <p className="font-semibold text-gray-900">Use the live LMS workspace</p>
          <p className="text-sm text-gray-600 mt-1">Create and publish assignments, attach links/notes, and grade student submissions from one page.</p>
          <Link href="/teacher/assignments" className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
            Open LMS Workspace
          </Link>
        </div>
      </div>

      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
        </div>
        <div className="space-y-2">
          {pendingGrades.map((grade, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{grade.student}</p>
                <p className="text-xs text-gray-500">{grade.exam} • {grade.class}</p>
              </div>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                {grade.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Student Performance Analytics</h3>
        </div>
        <div className="space-y-3">
          {performance.map((item, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{item.subject}</p>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {item.trend}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.average}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Average score: {item.average}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Messaging with Parents and Students</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            {messages.map((item, idx) => (
              <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {item.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.message}</p>
                <p className="text-xs text-gray-400 mt-2">{item.time}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border border-dashed border-green-200 rounded-lg bg-green-50/40">
            <p className="font-semibold text-gray-900 mb-2">Compose a message</p>
            <p className="text-sm text-gray-600 mb-3">Send updates to parents or students from one place.</p>
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-white border border-gray-200" />
              <div className="h-24 rounded-lg bg-white border border-gray-200" />
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="space-y-3">
          {(announcements.length ? announcements : [
            { title: 'Exam Schedules', body: 'Final exams next month' },
            { title: 'Grade Submission', body: 'Submit marks by end of week' },
          ]).map((announcement, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">📚 {announcement.title}</p>
              <p className="text-xs text-green-700 mt-1">{announcement.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
