import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { Users, Banknote, FileText, Bell, CreditCard, BarChart3, Settings } from 'lucide-react'

const analyticsData = [
  { month: 'Jan', attendance: 85, revenue: 120 },
  { month: 'Feb', attendance: 88, revenue: 140 },
  { month: 'Mar', attendance: 82, revenue: 160 },
  { month: 'Apr', attendance: 90, revenue: 175 },
  { month: 'May', revenue: 190 },
]

const users = [
  { name: 'John Student', role: 'Student', email: 'john@school.com', status: 'Active' },
  { name: 'Sarah Parent', role: 'Parent', email: 'sarah@school.com', status: 'Active' },
  { name: 'Mike Teacher', role: 'Teacher', email: 'mike@school.com', status: 'Active' },
  { name: 'Jane Admin', role: 'Admin', email: 'jane@school.com', status: 'Active' },
]

const feeData = [
  { student: 'John Doe', class: 'Form 4A', amount: '25,000', status: 'Paid' },
  { student: 'Jane Smith', class: 'Form 3B', amount: '18,500', status: 'Pending' },
  { student: 'Peter Brown', class: 'Form 2C', amount: '22,000', status: 'Partial' },
]

const reports = [
  { name: 'Monthly Attendance Report', date: '2026-05-01', type: 'PDF' },
  { name: 'Fee Collection Summary', date: '2026-05-10', type: 'Excel' },
  { name: 'Student Performance', date: '2026-05-08', type: 'PDF' },
]

export default function AdminDashboard(){
  return (
    <Layout role="admin">
      {/* Key Stats */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={542} />
        <StatCard title="Teachers" value={45} />
        <StatCard title="Classes" value={18} />
        <StatCard title="Revenue" value={'KES 2.4M'} />
      </div>

      {/* Analytics Chart */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">School Analytics</h3>
        </div>
        <div className="space-y-4">
          {analyticsData.map((item) => (
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900">🎉 Sports Day</p>
            <p className="text-xs text-green-700 mt-1">Next Saturday - All students participate</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">📚 New LMS Update</p>
            <p className="text-xs text-blue-700 mt-1">Platform improved with new features</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="md:col-span-3 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 text-gray-600 font-semibold">Name</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Role</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Email</th>
                <th className="text-left p-2 text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 text-gray-900 font-medium">{user.name}</td>
                  <td className="p-2 text-gray-600">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600">{user.email}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Tracking */}
      <div className="md:col-span-2 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fee Tracking</h3>
        </div>
        <div className="space-y-3">
          {feeData.map((fee, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{fee.student}</p>
                  <p className="text-sm text-gray-500">{fee.class}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">KES {fee.amount}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    fee.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {fee.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports and Exports */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        </div>
        <div className="space-y-2">
          {reports.map((report, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-500">{report.date}</p>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                {report.type}
              </span>
            </div>
          ))}
        </div>
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
    </Layout>
  )
}
