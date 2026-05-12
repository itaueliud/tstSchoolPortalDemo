import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { Calendar, BookOpen, Award, Users, CreditCard, Bell } from 'lucide-react'

export default function StudentDashboard(){
  const timetable = [
    { day: 'Monday', subject: 'Mathematics', time: '09:00 AM - 10:00 AM', teacher: 'Mr. Smith' },
    { day: 'Tuesday', subject: 'English', time: '10:30 AM - 11:30 AM', teacher: 'Mrs. Johnson' },
    { day: 'Wednesday', subject: 'Science', time: '01:00 PM - 02:00 PM', teacher: 'Mr. Williams' },
  ]

  const assignments = [
    { title: 'Mathematics Assignment 5', subject: 'Mathematics', dueDate: '2026-05-20', status: 'Pending' },
    { title: 'English Essay', subject: 'English', dueDate: '2026-05-18', status: 'Submitted' },
    { title: 'Science Project', subject: 'Science', dueDate: '2026-05-25', status: 'In Progress' },
  ]

  const examResults = [
    { exam: 'Term 1 Exams', date: '2026-03-15', gpa: '3.8', remarks: 'Excellent Performance' },
    { exam: 'Mid-Term Test', date: '2026-04-20', gpa: '3.6', remarks: 'Good Performance' },
  ]

  return (
    <Layout role="student">
      {/* Key Stats */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={'92%'} />
        <StatCard title="Fee Balance" value={'KES 12,450'} />
        <StatCard title="Active Assignments" value={3} />
        <StatCard title="Current GPA" value={'3.8'} />
      </div>

      {/* Timetable */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Weekly Timetable</h3>
        </div>
        <div className="space-y-3">
          {timetable.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.subject}</p>
                <p className="text-sm text-gray-500">{item.day} • {item.time}</p>
                <p className="text-xs text-gray-400 mt-1">Instructor: {item.teacher}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900">🎉 PTA Meeting</p>
            <p className="text-xs text-green-700 mt-1">This Saturday at 10:00 AM</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">📚 Exams Start</p>
            <p className="text-xs text-blue-700 mt-1">Next month - Prepare well!</p>
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Assignments & LMS</h3>
        </div>
        <div className="space-y-3">
          {assignments.map((assignment, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.subject}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  assignment.status === 'Submitted' ? 'bg-green-100 text-green-700' :
                  assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {assignment.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Due: {assignment.dueDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Results */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Exam Results</h3>
        </div>
        <div className="space-y-3">
          {examResults.map((result, idx) => (
            <div key={idx} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{result.exam}</p>
                  <p className="text-xs text-gray-500 mt-1">{result.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{result.gpa}</p>
                  <p className="text-xs text-green-600">{result.remarks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
