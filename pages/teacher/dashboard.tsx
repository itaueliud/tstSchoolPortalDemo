import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { Users, BookOpen, FileText, Bell, CheckCircle, Award, Calendar } from 'lucide-react'

const classes = [
  { name: 'Form 4A - Mathematics', students: 32, period: '09:00 - 10:00' },
  { name: 'Form 3B - Mathematics', students: 28, period: '10:30 - 11:30' },
  { name: 'Form 4C - Science', students: 35, period: '01:00 - 02:00' },
  { name: 'Form 3A - Science', students: 30, period: '02:30 - 03:30' },
]

const assignments = [
  { title: 'Algebra Homework', class: 'Form 4A', dueDate: '2026-05-15', submitted: 28, pending: 4 },
  { title: 'Science Lab Report', class: 'Form 4C', dueDate: '2026-05-18', submitted: 32, pending: 3 },
  { title: 'Essay Assignment', class: 'Form 3B', dueDate: '2026-05-20', submitted: 22, pending: 6 },
]

const pendingGrades = [
  { student: 'John Doe', exam: 'Mid-Term Test', class: 'Form 4A', status: 'Pending' },
  { student: 'Jane Smith', exam: 'Monthly Quiz', class: 'Form 3B', status: 'Pending' },
  { student: 'Mike Brown', exam: 'Project Work', class: 'Form 4C', status: 'Pending' },
]

export default function TeacherDashboard(){
  return (
    <Layout role="teacher">
      {/* Key Stats */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Classes" value={4} />
        <StatCard title="Total Students" value={126} />
        <StatCard title="Active Assignments" value={8} />
        <StatCard title="Pending Grades" value={23} />
      </div>

      {/* My Classes */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
        </div>
        <div className="space-y-3">
          {classes.map((cls, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{cls.name}</p>
                  <p className="text-sm text-gray-500">{cls.period}</p>
                </div>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  {cls.students} students
                </span>
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900">📚 Exam Schedules</p>
            <p className="text-xs text-green-700 mt-1">Final exams next month</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">📊 Grade Submission</p>
            <p className="text-xs text-blue-700 mt-1">Submit marks by end of week</p>
          </div>
        </div>
      </div>

      {/* Assignments Status */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Assignment Submission Status</h3>
        </div>
        <div className="space-y-3">
          {assignments.map((assignment, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.class} • Due: {assignment.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600"><strong>{assignment.submitted}</strong> submitted</span>
                </span>
                <span className="text-yellow-600"><strong>{assignment.pending}</strong> pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Grades */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending Grades</h3>
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

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="flex flex-col gap-2">
          <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
            ✏️ Mark Attendance
          </button>
          <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
            📤 Upload Assignment
          </button>
          <button className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
            📊 Submit Grades
          </button>
        </div>
      </div>
    </Layout>
  )
}
