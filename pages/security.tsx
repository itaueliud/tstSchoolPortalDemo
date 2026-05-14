import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Security() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Enterprise-Grade <span className="text-[#123a78]">Security</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your data security is our top priority. Learn about our comprehensive security measures.
          </p>
        </div>
      </section>

      {/* SECURITY FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: '🔒',
              title: 'End-to-End Encryption',
              desc: 'All data transmitted and stored with industry-standard AES-256 encryption'
            },
            {
              icon: '🔐',
              title: 'Multi-Factor Authentication',
              desc: 'Protect accounts with two-factor authentication for enhanced security'
            },
            {
              icon: '👤',
              title: 'Role-Based Access Control',
              desc: 'Fine-grained permissions ensure users only access authorized information'
            },
            {
              icon: '📊',
              title: 'Audit Logging',
              desc: 'Complete audit trail of all system activities for compliance and accountability'
            },
            {
              icon: '🛡️',
              title: 'DDoS Protection',
              desc: 'Advanced protection against distributed denial-of-service attacks'
            },
            {
              icon: '✅',
              title: 'Regular Security Audits',
              desc: 'Third-party security audits and penetration testing performed regularly'
            },
            {
              icon: '📱',
              title: 'Data Backup',
              desc: 'Automated daily backups with redundancy across multiple geographic locations'
            },
            {
              icon: '🔄',
              title: 'GDPR Compliance',
              desc: 'Full compliance with international data protection regulations'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 md:p-8 border border-gray-200">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="bg-blue-50 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Compliance & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { cert: 'ISO 27001', desc: 'Information Security Management' },
              { cert: 'SOC 2 Type II', desc: 'Service Organization Controls' },
              { cert: 'GDPR', desc: 'EU Data Protection Regulation' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <div className="text-2xl font-bold text-[#123a78] mb-2">{c.cert}</div>
                <p className="text-gray-600 text-sm">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trust TST with Your Data
          </h2>
          <p className="text-blue-100 mb-6">Learn more about our security practices</p>
          <Link href="/contact" className="inline-block px-6 py-3 rounded-lg bg-white text-[#123a78] font-semibold hover:bg-blue-50 transition">
            Contact Us
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
