import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Powerful Features for Modern <span className="text-[#123a78]">Schools</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Everything you need to manage your school efficiently in one unified platform.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: '👥',
              title: 'Student Management',
              desc: 'Complete student profiles, admission tracking, class assignments, and performance records all in one place.',
              features: ['Student profiles', 'Admission tracking', 'Class assignments', 'Performance history']
            },
            {
              icon: '✓',
              title: 'Attendance Tracking',
              desc: 'Real-time attendance recording with automated reports and alerts for irregular attendance patterns.',
              features: ['Daily attendance', 'Automated alerts', 'Attendance reports', 'Class summaries']
            },
            {
              icon: '💳',
              title: 'Fee Management',
              desc: 'Streamlined fee collection with M-Pesa integration, invoicing, and automated reminders.',
              features: ['Fee tracking', 'M-Pesa payments', 'Invoices', 'Payment receipts']
            },
            {
              icon: '📊',
              title: 'Exams & Results',
              desc: 'Manage exam schedules, publish results, generate report cards, and track academic performance.',
              features: ['Exam scheduling', 'Result publishing', 'Report cards', 'Performance analytics']
            },
            {
              icon: '📚',
              title: 'Learning Management',
              desc: 'Centralized LMS for uploading learning materials, assignments, and resources.',
              features: ['Resource library', 'Assignment tracking', 'Material sharing', 'Student submissions']
            },
            {
              icon: '💬',
              title: 'Communication Hub',
              desc: 'Instant messaging between teachers, parents, and administrators with announcement broadcasts.',
              features: ['Direct messaging', 'Announcements', 'Group chats', 'Notifications']
            },
            {
              icon: '📋',
              title: 'Timetable & Scheduling',
              desc: 'Easy-to-manage class schedules, teacher timetables, and resource allocation.',
              features: ['Class schedules', 'Teacher assignments', 'Room allocation', 'Calendar view']
            },
            {
              icon: '⚙️',
              title: 'Dashboard Analytics',
              desc: 'Comprehensive insights into school operations with real-time dashboards and detailed reports.',
              features: ['Live metrics', 'Custom reports', 'Growth analytics', 'Export data']
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-4 text-sm md:text-base">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-[#123a78] font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <Link href="/role-select" className="inline-block px-6 py-3 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p>&copy; 2026 TST School Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
