import LandingNav from '../components/LandingNav'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <LandingNav />

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Privacy <span className="text-[#123a78]">Policy</span>
        </h1>
        <p className="text-gray-600 text-sm">Last updated: May 2026</p>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 mb-12 bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              TST School Portal ("we", "us", "our", or "Company") operates the TST Portal website and related services. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our service.</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Student and staff records (as authorized)</li>
              <li>Academic and attendance data</li>
              <li>Usage data (cookies, log files)</li>
              <li>Device information (IP address, browser type)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
            <p>TST Portal uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information for service improvement</li>
              <li>To monitor the usage of our service</li>
              <li>To detect and prevent fraudulent transactions</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> privacy@tstportal.com
              <br />
              <strong>Address:</strong> Nairobi, Kenya
            </p>
          </div>
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
