import Link from 'next/link'
import LandingNav from '../components/LandingNav'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Transparent, Flexible <span className="text-[#123a78]">Pricing</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the plan that works best for your school. No hidden fees.
          </p>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '3,500',
              period: '/month',
              desc: 'Perfect for small schools',
              features: [
                'Up to 50 students',
                'Basic attendance tracking',
                'Fee management',
                'Announcements',
                'Email support'
              ]
            },
            {
              name: 'Professional',
              price: '9,999',
              period: '/month',
              desc: 'Most popular choice',
              highlighted: true,
              features: [
                'Up to 500 students',
                'Complete attendance system',
                'Advanced fee tracking',
                'Learning management system',
                'Parent communication',
                'Priority support',
                'Custom reports'
              ]
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'pricing',
              desc: 'For large institutions',
              features: [
                'Unlimited students',
                'All features included',
                'API access',
                'Dedicated account manager',
                'Custom integrations',
                '24/7 phone support',
                'Advanced analytics'
              ]
            }
          ].map((plan, i) => (
            <div key={i} className={`rounded-xl border-2 transition ${
              plan.highlighted 
                ? 'border-[#123a78] bg-blue-50 shadow-lg transform scale-105' 
                : 'border-gray-200 bg-white'
            } p-6 md:p-8`}>
              {plan.highlighted && <div className="text-[#123a78] font-bold text-sm mb-4 uppercase">⭐ Most Popular</div>}
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#123a78]">KES {plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
              <Link href="/role-select" className={`block w-full py-2 rounded-lg font-semibold text-center transition mb-6 ${
                plan.highlighted
                  ? 'bg-[#123a78] text-white hover:bg-[#0b1f4d]'
                  : 'bg-blue-50 text-[#123a78] hover:bg-blue-100'
              }`}>
                Start Free Trial
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-[#123a78] font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-blue-50 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan anytime. Changes take effect at the start of your next billing cycle.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans come with a 30-day free trial. No credit card required to get started.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept M-Pesa, bank transfers, and credit cards. Contact us for other payment options.'
              },
              {
                q: 'Do you offer volume discounts?',
                a: 'Yes, we offer special pricing for multi-year commitments and large deployments. Contact sales for details.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0b1f4d] to-[#123a78] py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 mb-6">Join hundreds of schools already using TST Portal</p>
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
