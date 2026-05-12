import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white">
      <LandingNav />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="text-green-600 text-sm font-semibold mb-2 uppercase tracking-wide">Welcome to TST School Portal</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
              Empower Your <span className="text-green-600">School</span>.<br/>
              Engage Your <span className="text-emerald-600">Community</span>.<br/>
              Elevate <span className="text-green-500">Education</span>.
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
              TST School Portal is a comprehensive, secure solution for managing academics, attendance, fees, communication and more — all in one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <Link href="/role-select" className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition w-full sm:w-auto text-center">
                Get Started Now →
              </Link>
              <button className="px-6 py-3 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 transition font-semibold w-full sm:w-auto">
                Learn More
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span> <span className="text-gray-700 font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span> <span className="text-gray-700 font-medium">Role-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span> <span className="text-gray-700 font-medium">Cloud-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span> <span className="text-gray-700 font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* HERO STATS PANEL */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-green-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600">842</div>
                  <div className="text-sm text-gray-700 font-medium">Students</div>
                  <div className="text-xs text-green-600">↑ 12% growth</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600">36</div>
                  <div className="text-sm text-gray-700 font-medium">Teachers</div>
                  <div className="text-xs text-emerald-600">↑ 8% growth</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600">24</div>
                  <div className="text-sm text-gray-700 font-medium">Classes</div>
                  <div className="text-xs text-green-600">All active</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="text-2xl font-bold text-emerald-600">1.59M</div>
                  <div className="text-sm text-gray-700 font-medium">Total Revenue (KES)</div>
                  <div className="text-xs text-emerald-600">↑ 15% growth</div>
                </div>
              </div>

              <div className="border-t border-green-200 pt-6">
                <h3 className="text-sm text-gray-700 font-semibold mb-4">Attendance Rate</h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                      <div className="h-full bg-green-600" style={{width: '92%'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Overall: 92%</span>
                      <span>Present: 775/842</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-green-200 pt-6">
                <h3 className="text-sm text-gray-700 font-semibold mb-4">Latest Updates</h3>
                <ul className="space-y-3 text-xs">
                  <li className="flex gap-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-lg">📢</span>
                    <span><strong>School Holiday</strong> - 20th June</span>
                  </li>
                  <li className="flex gap-3 p-2 bg-blue-50 rounded-lg">
                    <span className="text-lg">📅</span>
                    <span><strong>PTA Meeting</strong> - This Saturday</span>
                  </li>
                  <li className="flex gap-3 p-2 bg-yellow-50 rounded-lg">
                    <span className="text-lg">✏️</span>
                    <span><strong>Assignment Reminder</strong> - Submit on time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Everything You Need, <span className="text-green-600">All in One</span> Place
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Powerful modules to simplify school management, enhance collaboration, and improve educational outcomes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: '👥', title: 'Student Management', desc: 'Manage records, admissions and profiles' },
              { icon: '✓', title: 'Attendance Tracking', desc: 'Real-time tracking with detailed reports' },
              { icon: '💳', title: 'Fee Management', desc: 'Collect fees with M-Pesa integration' },
              { icon: '📊', title: 'Exams & Results', desc: 'Publish results and report cards' },
              { icon: '📚', title: 'Learning Management', desc: 'Centralized LMS for materials' },
              { icon: '💬', title: 'Messaging', desc: 'Instant school communication' },
              { icon: '📋', title: 'Timetable Scheduling', desc: 'Easy class scheduling' },
              { icon: '⚙️', title: 'Dashboard Analytics', desc: 'Comprehensive insights' }
            ].map((mod, i) => (
              <div key={i} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition border border-gray-200 hover:border-green-300">
                <div className="text-4xl mb-3">{mod.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{mod.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-gray-900">
          Dashboard <span className="text-green-600">Overview</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UPCOMING EVENTS */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-lg font-bold">
                  <span className="text-green-600">20</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">School Closing</div>
                  <div className="text-xs text-gray-500">Thursday, 20 June</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-lg font-bold">
                  <span className="text-purple-600">22</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">PTA Meeting</div>
                  <div className="text-xs text-gray-500">Saturday, 22 June</div>
                </div>
              </div>
            </div>
            <a href="#" className="text-green-600 text-xs mt-6 inline-block hover:text-green-700 font-semibold">View Calendar →</a>
          </div>

          {/* FEE COLLECTION */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Fee Collection</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="8" 
                    strokeDasharray={`${(70/100) * 314}`} strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="8" 
                    strokeDasharray={`${(30/100) * 314}`} strokeDashoffset={`-${(70/100) * 314}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">70%</div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-gray-700">Collected</span>
                </div>
                <span className="font-semibold text-gray-900">KES 1,120,600</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-semibold text-gray-900">KES 470,200</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition text-sm font-medium text-gray-900">
                <span className="text-xl">👤</span>
                <span>Add Student</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-sm font-medium text-gray-900">
                <span className="text-xl">✓</span>
                <span>Mark Attendance</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition text-sm font-medium text-gray-900">
                <span className="text-xl">💳</span>
                <span>Collect Fee</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition text-sm font-medium text-gray-900">
                <span className="text-xl">✉️</span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-green-100 mb-8 text-base md:text-lg max-w-2xl mx-auto">
            Join thousands of schools already using TST Portal to streamline operations and improve student outcomes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/role-select" className="px-6 py-3 rounded-lg bg-white text-green-600 font-semibold hover:bg-green-50 transition w-full sm:w-auto text-center">
              Start Your Free Trial
            </Link>
            <a href="#" className="px-6 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 transition font-semibold w-full sm:w-auto text-center">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-sm">TST</div>
                TST Portal
              </div>
              <p className="text-sm">Empowering schools with modern solutions.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 TST School Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
