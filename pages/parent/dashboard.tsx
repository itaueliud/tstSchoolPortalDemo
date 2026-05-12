import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { User, BookOpen, Award, CreditCard, Bell, Calendar, TrendingUp } from 'lucide-react'

const childInfo = {
  name: 'John Doe',
  class: 'Form 4A',
  admissionNo: 'JD-2024-001',
  attendance: '92%',
  gpa: '3.8',
}

const recentGrades = [
  { subject: 'Mathematics', grade: 'A', score: 92 },
  { subject: 'English', grade: 'B+', score: 85 },
  { subject: 'Science', grade: 'A-', score: 88 },
  { subject: 'History', grade: 'A', score: 90 },
]

const timetable = [
  { day: 'Monday', classes: ['Mathematics', 'English', 'Science'] },
  { day: 'Tuesday', classes: ['History', 'Geography', 'PE'] },
  { day: 'Wednesday', classes: ['Mathematics', 'Science', 'Art'] },
]

const announcements = [
  { title: 'Parent-Teacher Meeting', date: '2026-05-20', description: 'Scheduled at 4:00 PM' },
  { title: 'Sports Day', date: '2026-05-25', description: 'All students to participate' },
  { title: 'Exam Schedule', date: '2026-06-01', description: 'Final exams begin' },
]

export default function ParentDashboard(){
  return (
    <Layout role="parent">
      {/* Child Info */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Child" value={childInfo.name} />
        <StatCard title="Attendance" value={childInfo.attendance} />
        <StatCard title="Current GPA" value={childInfo.gpa} />
        <StatCard title="Class" value={childInfo.class} />
      </div>

      {/* Child Profile */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Child Information</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Admission Number</p>
            <p className="font-semibold text-gray-900">{childInfo.admissionNo}</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Current Class</p>
            <p className="font-semibold text-gray-900">{childInfo.class}</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Year of Study</p>
            <p className="font-semibold text-gray-900">2024/2025</p>
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
          {announcements.map((announcement, idx) => (
            <div key={idx} className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-semibold text-gray-900">{announcement.title}</p>
              <p className="text-xs text-gray-500">{announcement.date} • {announcement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Academic Performance</h3>
        </div>
        <div className="space-y-2">
          {recentGrades.map((grade, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{grade.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${grade.score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                  {grade.grade} ({grade.score}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Timetable */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Weekly Timetable</h3>
        </div>
        <div className="space-y-2">
          {timetable.map((day, idx) => (
            <div key={idx} className="p-2 border border-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm mb-1">{day.day}</p>
              <p className="text-xs text-gray-600">{day.classes.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Status */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fee Status</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-semibold">FEES PAID</p>
            <p className="text-lg font-bold text-green-900 mt-1">KES 45,000</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700 font-semibold">FEES DUE</p>
            <p className="text-lg font-bold text-yellow-900 mt-1">KES 8,500</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
