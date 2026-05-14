import Link from 'next/link'
import { Home } from 'lucide-react'

export default function RoleSelect() {
  const roles = [
    {
      id: 'admin',
      label: 'Administrator',
      icon: '⚙️',
      description: 'Manage school operations, users, and system settings',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: '📚',
      description: 'Track attendance, manage grades, and communicate with parents',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'student',
      label: 'Student',
      icon: '👨‍🎓',
      description: 'View your grades, attendance, assignments, and communications',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'parent',
      label: 'Parent',
      icon: '👨‍👩‍👧',
      description: 'Monitor your child\'s progress, fees, and school communications',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#123a78] hover:bg-[#0b1f4d] text-white font-medium transition-colors">
          <Home size={18} />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Choose Your <span className="text-[#123a78]">Role</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select your role to access the TST School Portal. Each role has a customized dashboard with features tailored to your needs.
        </p>
      </section>

      {/* Role Selection Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/login?role=${role.id}`}
              className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Card Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

              {/* Card Content */}
              <div className="relative bg-white p-6 md:p-8 h-full flex flex-col justify-between border border-gray-200 group-hover:border-transparent transition-colors duration-300">
                {/* Icon */}
                <div className="text-5xl mb-4">{role.icon}</div>

                {/* Title and Description */}
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-white transition-colors duration-300">
                    {role.label}
                  </h2>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    {role.description}
                  </p>
                </div>

                {/* CTA Text */}
                <div className="text-sm font-semibold text-[#123a78] group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                  Sign In <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Demo Info */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Credentials Available</h3>
          <p className="text-sm text-blue-800">
            Select any role above and use the demo credentials provided on the login page to explore the portal. Each role has a unique dashboard with features specific to their needs.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p>&copy; 2026 TST School Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
