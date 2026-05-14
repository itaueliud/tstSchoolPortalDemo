import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import LandingNav from '../components/LandingNav'

const moduleCards = [
  { icon: Users, title: 'Student Management', desc: 'Manage records, admissions and profiles' },
  { icon: Check, title: 'Attendance Tracking', desc: 'Real-time tracking with detailed reports' },
  { icon: CreditCard, title: 'Fee Management', desc: 'Collect fees with M-Pesa integration' },
  { icon: CalendarDays, title: 'Exams & Results', desc: 'Publish results and report cards' },
  { icon: BookOpen, title: 'Learning Management', desc: 'Centralized LMS for materials' },
  { icon: MessageSquare, title: 'Messaging', desc: 'Instant school communication' },
  { icon: ClipboardList, title: 'Timetable Scheduling', desc: 'Easy class scheduling' },
  { icon: Settings, title: 'Dashboard Analytics', desc: 'Comprehensive insights' },
]

export default function Home(){
  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="text-[#123a78] text-sm font-semibold mb-2 uppercase tracking-wide">Welcome to TST School Portal</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">
              Empower Your <span className="text-[#123a78]">School</span>.<br/>
              Engage Your <span className="text-[#1b4f9a]">Community</span>.<br/>
              Elevate <span className="text-[#1b4f9a]">Education</span>.
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
              TST School Portal is a comprehensive, secure solution for managing academics, attendance, fees, communication and more all in one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <Link href="/role-select" className="px-6 py-3 rounded-lg bg-[#0b1f4d] text-white font-semibold hover:bg-[#123a78] transition w-full sm:w-auto text-center inline-flex items-center justify-center gap-2">
                Get Started Now <ArrowRight size={18} />
              </Link>
              <Link href="/features" className="px-6 py-3 rounded-lg border-2 border-[#123a78] text-[#123a78] hover:bg-blue-50 transition font-semibold w-full sm:w-auto text-center inline-flex items-center justify-center gap-2">
                Learn More <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-[#123a78]" /> <span className="text-gray-700 font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-[#123a78]" /> <span className="text-gray-700 font-medium">Role-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-[#123a78]" /> <span className="text-gray-700 font-medium">Cloud-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-[#123a78]" /> <span className="text-gray-700 font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* HERO STATS PANEL */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-blue-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-3xl font-bold text-[#123a78]">842</div>
                  <div className="text-sm text-gray-700 font-medium">Students</div>
                  <div className="text-xs text-[#123a78] inline-flex items-center gap-1"><ArrowUpRight size={12} /> 12% growth</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-3xl font-bold text-[#1b4f9a]">36</div>
                  <div className="text-sm text-gray-700 font-medium">Teachers</div>
                  <div className="text-xs text-[#1b4f9a] inline-flex items-center gap-1"><ArrowUpRight size={12} /> 8% growth</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-3xl font-bold text-[#123a78]">24</div>
                  <div className="text-sm text-gray-700 font-medium">Classes</div>
                  <div className="text-xs text-[#123a78]">All active</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-[#1b4f9a]">1.59M</div>
                  <div className="text-sm text-gray-700 font-medium">Total Revenue (KES)</div>
                  <div className="text-xs text-[#1b4f9a] inline-flex items-center gap-1"><ArrowUpRight size={12} /> 15% growth</div>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-6">
                <h3 className="text-sm text-gray-700 font-semibold mb-4">Attendance Rate</h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                      <div className="h-full bg-[#0b1f4d]" style={{width: '92%'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Overall: 92%</span>
                      <span>Present: 775/842</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-6">
                <h3 className="text-sm text-gray-700 font-semibold mb-4">Latest Updates</h3>
                <ul className="space-y-3 text-xs">
                  <li className="flex gap-3 p-2 bg-blue-50 rounded-lg">
                    <Bell size={18} className="text-[#123a78] shrink-0 mt-0.5" />
                    <span><strong>School Holiday</strong> - 20th June</span>
                  </li>
                  <li className="flex gap-3 p-2 bg-blue-50 rounded-lg">
                    <CalendarDays size={18} className="text-[#123a78] shrink-0 mt-0.5" />
                    <span><strong>PTA Meeting</strong> - This Saturday</span>
                  </li>
                  <li className="flex gap-3 p-2 bg-yellow-50 rounded-lg">
                    <Sparkles size={18} className="text-[#ca8a04] shrink-0 mt-0.5" />
                    <span><strong>Assignment Reminder</strong> - Submit on time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section id="modules" className="bg-gradient-to-b from-blue-50 to-slate-50 py-12 md:py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Everything You Need, <span className="text-[#123a78]">All in One</span> Place
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Powerful modules to simplify school management, enhance collaboration, and improve educational outcomes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {moduleCards.map((mod, i) => {
              const Icon = mod.icon

              return (
                <div key={i} className="bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition border border-gray-200 hover:border-blue-300">
                  <Icon size={32} className="text-[#123a78] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{mod.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{mod.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-gray-900">
          Dashboard <span className="text-[#123a78]">Overview</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UPCOMING EVENTS */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-lg font-bold">
                  <span className="text-[#123a78]">20</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">School Closing</div>
                  <div className="text-xs text-gray-500">Thursday, 20 June</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-lg font-bold">
                  <span className="text-[#123a78]">22</span>
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">PTA Meeting</div>
                  <div className="text-xs text-gray-500">Saturday, 22 June</div>
                </div>
              </div>
            </div>
            <a href="/parent/announcements" className="text-[#123a78] text-xs mt-6 inline-block hover:text-[#0b1f4d] font-semibold">View Calendar →</a>
          </div>

          {/* FEE COLLECTION */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Fee Collection</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#123a78" strokeWidth="8" 
                    strokeDasharray={`${(70/100) * 314}`} strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="8" 
                    strokeDasharray={`${(30/100) * 314}`} strokeDashoffset={`-${(70/100) * 314}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#123a78]">70%</div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0b1f4d]"></div>
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
              <Link href="/role-select" className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-sm font-medium text-gray-900">
                <Users size={18} className="text-[#123a78] shrink-0" />
                <span>Add Student</span>
              </Link>
              <Link href="/role-select" className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-sm font-medium text-gray-900">
                <CheckCircle2 size={18} className="text-[#123a78] shrink-0" />
                <span>Mark Attendance</span>
              </Link>
              <Link href="/role-select" className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-sm font-medium text-gray-900">
                <CreditCard size={18} className="text-[#123a78] shrink-0" />
                <span>Collect Fee</span>
              </Link>
              <Link href="/role-select" className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-sm font-medium text-gray-900">
                <MessageSquare size={18} className="text-[#123a78] shrink-0" />
                <span>Send Message</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-blue-100 mb-8 text-base md:text-lg max-w-2xl mx-auto">
            Join thousands of schools already using TST Portal to streamline operations and improve student outcomes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/role-select" className="px-6 py-3 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition w-full sm:w-auto text-center inline-flex items-center justify-center gap-2">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="px-6 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 transition font-semibold w-full sm:w-auto text-center inline-flex items-center justify-center gap-2">
              Contact Sales <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0b1f4d] text-white flex items-center justify-center text-sm">TST</div>
                TST Portal
              </div>
              <p className="text-sm">Empowering schools with modern solutions.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/support" className="hover:text-white transition">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 TST School Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}



