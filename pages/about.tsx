import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            About <span className="text-[#123a78]">TST School Portal</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transforming education through innovative technology and dedicated service.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[#123a78] mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To empower educational institutions worldwide with intelligent, user-friendly solutions that streamline operations, enhance collaboration, and ultimately improve student outcomes.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[#123a78] mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              A world where every school, regardless of size, has access to world-class management tools that enable educators to focus on what matters most: teaching and student development.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[#123a78] mb-4">Our Values</h3>
            <p className="text-gray-600 leading-relaxed">
              Innovation, integrity, and inclusivity guide our work. We believe in creating solutions that are secure, accessible, and impactful for all stakeholders in the education ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-blue-50 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Story</h2>
          <div className="prose prose-sm md:prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              TST School Portal was founded with a simple observation: schools were struggling with fragmented systems, paper-based processes, and lack of real-time communication between stakeholders.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We started as a small team of educators and technologists who believed there had to be a better way. After extensive research and collaboration with schools across Kenya, we built a comprehensive platform that addresses the real pain points faced by administrators, teachers, parents, and students.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, TST School Portal powers operations at hundreds of schools, helping them save time, reduce costs, and create better experiences for everyone involved in education.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '200+', label: 'Schools' },
            { number: '45K+', label: 'Students' },
            { number: '2.5K+', label: 'Teachers' },
            { number: '99.9%', label: 'Uptime' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-4xl font-bold text-[#123a78] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join our community of innovative schools
          </h2>
          <Link href="/role-select" className="inline-block px-6 py-3 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition">
            Get Started Today
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
