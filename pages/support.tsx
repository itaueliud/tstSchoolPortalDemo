'use client'

import Link from 'next/link'
import LandingNav from '../components/LandingNav'
import { useState } from 'react'

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'How do I get started with TST Portal?',
      a: 'Simply sign up on our website, and you\'ll get access to a 30-day free trial. Our onboarding team will guide you through the setup process.'
    },
    {
      q: 'What should I do if I forget my password?',
      a: 'Click on "Forgot Password" on the login page. You\'ll receive an email with instructions to reset your password within minutes.'
    },
    {
      q: 'How secure is my data?',
      a: 'We use enterprise-grade encryption (AES-256) and comply with GDPR and other international data protection standards. Your data is backed up daily.'
    },
    {
      q: 'Can I import existing student data?',
      a: 'Yes! We provide data import templates and can assist with bulk uploads. Contact our support team for detailed migration assistance.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept M-Pesa, bank transfers, and credit cards. Enterprise customers can arrange custom payment terms.'
    },
    {
      q: 'Do you offer training for staff?',
      a: 'Absolutely! We provide comprehensive onboarding training, video tutorials, and ongoing support for all team members.'
    },
    {
      q: 'Can I use TST Portal on mobile devices?',
      a: 'Yes, TST Portal is fully responsive and works on smartphones, tablets, and desktops. We also have dedicated mobile apps.'
    },
    {
      q: 'What is your uptime guarantee?',
      a: 'We guarantee 99.9% uptime with redundant systems and daily backups. Our 24/7 team monitors the system constantly.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            How Can We <span className="text-[#123a78]">Help?</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team.
          </p>
        </div>
      </section>

      {/* SUPPORT OPTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: '📧',
              title: 'Email Support',
              desc: 'Response within 24 hours',
              contact: 'support@tstportal.com'
            },
            {
              icon: '📞',
              title: 'Phone Support',
              desc: 'Available 9 AM - 5 PM EAT',
              contact: '+254 700 000 000'
            },
            {
              icon: '💬',
              title: 'Live Chat',
              desc: 'Chat with support team',
              contact: 'Available on website'
            }
          ].map((option, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition">
              <div className="text-4xl mb-3">{option.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{option.desc}</p>
              <p className="text-sm font-semibold text-[#123a78]">{option.contact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          Frequently Asked <span className="text-[#123a78]">Questions</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-blue-50 transition"
              >
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <span className="text-[#123a78] font-bold text-lg">
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
                  <p className="text-gray-700 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* KNOWLEDGE BASE */}
      <section className="bg-blue-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
            Knowledge Base & <span className="text-[#123a78]">Resources</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started Guide', link: '#', icon: '📖' },
              { title: 'Video Tutorials', link: '#', icon: '🎥' },
              { title: 'API Documentation', link: '#', icon: '⚙️' },
              { title: 'Best Practices', link: '#', icon: '✨' },
              { title: 'Integration Guide', link: '#', icon: '🔗' },
              { title: 'Troubleshooting', link: '#', icon: '🔧' }
            ].map((resource, i) => (
              <a
                key={i}
                href={resource.link}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition flex items-center gap-4"
              >
                <span className="text-3xl">{resource.icon}</span>
                <span className="font-semibold text-gray-900">{resource.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still need help?
          </h2>
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
