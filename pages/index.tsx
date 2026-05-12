import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-navy to-deepblue">
      <LandingNav />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-neon text-sm font-semibold mb-2">SMART SCHOOL. SMART FUTURE.</div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Empowering <span className="text-neon">Schools</span>.<br/>
              Engaging <span className="text-blue-400">Students</span>.<br/>
              Elevating <span className="text-purple-400">Education</span>.
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Greenfield Academy School Portal is a secure, smart and all-in-one solution to manage academics, attendance, fees, communication and more — effortlessly.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/role-select" className="px-6 py-3 rounded-lg bg-neon text-navy font-semibold hover:bg-neon/90 transition">
                Get Started Now →
              </Link>
              <button className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition flex items-center gap-2">
                Explore Features <span>▶</span>
              </button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neon">✓</span> Secure & Reliable
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon">✓</span> Role Based Access
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon">✓</span> Cloud Based
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon">✓</span> 24/7 Support
              </div>
            </div>
          </div>

          {/* HERO STATS PANEL */}
          <div className="relative">
            <div className="card p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/6 rounded-lg p-4">
                  <div className="text-3xl font-bold text-neon">842</div>
                  <div className="text-sm text-white/70">Students</div>
                  <div className="text-xs text-green-400">↑ 12% from last month</div>
                </div>
                <div className="bg-white/6 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">36</div>
                  <div className="text-sm text-white/70">Teachers</div>
                  <div className="text-xs text-green-400">↑ 8% from last month</div>
                </div>
                <div className="bg-white/6 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">24</div>
                  <div className="text-sm text-white/70">Classes</div>
                  <div className="text-xs text-green-400">↑ 0% from last month</div>
                </div>
                <div className="bg-white/6 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-400">KES 1.59M</div>
                  <div className="text-sm text-white/70">Total Revenue</div>
                  <div className="text-xs text-green-400">↑ 15% from last month</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm text-white/70 mb-4">Attendance Overview</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#5BE12C" strokeWidth="8" 
                        strokeDasharray={`${(92/100) * 314}`} strokeDashoffset="0" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-3xl font-bold">92%</div>
                      <div className="text-xs text-white/60">Overall</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-neon font-semibold">92%</div>
                    <div className="text-white/60">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-semibold">6%</div>
                    <div className="text-white/60">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">2%</div>
                    <div className="text-white/60">Leave</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm text-white/70 mb-4">Recent Announcements</h3>
                <ul className="space-y-3 text-xs">
                  <li className="flex gap-2">
                    <span className="text-neon">📢</span>
                    <span>School will be closed on <strong>20th June (Public holiday)</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neon">📅</span>
                    <span><strong>PTA Meeting</strong> this Saturday at 10:00 AM</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neon">✏️</span>
                    <span>Reminder: Submit assignments <strong>on time</strong></span>
                  </li>
                </ul>
                <a href="#" className="text-neon text-xs mt-4 inline-block hover:underline">View all →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section className="bg-white/2 py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
            Everything You Need, <span className="text-neon">All in One</span> Place
          </h2>
          <p className="text-center text-white/60 mb-12">
            Powerful modules to simplify school management and enhance collaboration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '👥', title: 'Student Management', desc: 'Manage student records, admissions and profiles' },
              { icon: '✓', title: 'Attendance Tracking', desc: 'Real-time attendance tracking and detailed reports' },
              { icon: '💳', title: 'Fee Management', desc: 'Collect fees, track payments and integrate with M-Pesa seamlessly' },
              { icon: '📊', title: 'Exams & Results', desc: 'Create exams, publish results and generate report cards' },
              { icon: '📚', title: 'Learning Management', desc: 'Share materials, assignments in one centralized LMS' },
              { icon: '💬', title: 'Messaging', desc: 'Instant communication between teachers, students and parents' },
              { icon: '📋', title: 'Timetable Scheduling', desc: 'Create and manage class schedules easily' },
              { icon: '👁️', title: 'View All Modules', desc: '', special: true }
            ].map((mod, i) => (
              <div key={i} className="card p-6 hover:bg-white/8 transition">
                <div className="text-4xl mb-4">{mod.icon}</div>
                <h3 className="font-semibold mb-2">{mod.title}</h3>
                {mod.desc && <p className="text-white/60 text-sm">{mod.desc}</p>}
                {mod.special && (
                  <div className="text-neon text-sm font-semibold">View All ➜</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* UPCOMING EVENTS */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-neon/20 flex items-center justify-center text-lg font-bold">
                  <span className="text-neon">20</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">School Closing (Public Holiday)</div>
                  <div className="text-xs text-white/60">Thursday, 20 June 2024</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg font-bold">
                  <span className="text-purple-400">22</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">PTA Meeting</div>
                  <div className="text-xs text-white/60">Saturday, 22 June 2024</div>
                </div>
              </div>
            </div>
            <a href="#" className="text-neon text-xs mt-6 inline-block hover:underline">View Calendar →</a>
          </div>

          {/* FEE COLLECTION */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Fee Collection Overview</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#5BE12C" strokeWidth="8" 
                    strokeDasharray={`${(70/100) * 314}`} strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#FF9800" strokeWidth="8" 
                    strokeDasharray={`${(30/100) * 314}`} strokeDashoffset={`-${(70/100) * 314}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon">70%</div>
                    <div className="text-xs text-white/60">of total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon"></div>
                  <span>Collected</span>
                </div>
                <span className="font-semibold">KES 1,120,600</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Pending</span>
                </div>
                <span className="font-semibold">KES 470,200</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/10 transition text-sm">
                <span className="text-xl">👤</span>
                <span>Add Student</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/10 transition text-sm">
                <span className="text-xl">✓</span>
                <span>Mark Attendance</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/10 transition text-sm">
                <span className="text-xl">💳</span>
                <span>Collect Fee</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/10 transition text-sm">
                <span className="text-xl">✉️</span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="bg-gradient-to-r from-neon/10 via-transparent to-deepblue/20 border-t border-white/10 py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-white/70 mb-8">Join hundreds of schools already using TechSwiftTrix to streamline operations and enhance learning.</p>
          <Link href="/role-select" className="inline-block px-8 py-4 rounded-lg bg-neon text-navy font-semibold hover:bg-neon/90 transition">
            Start Your Free Trial Today
          </Link>
        </div>
      </section>
    </div>
  )
}
