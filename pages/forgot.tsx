'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Mail, ArrowLeft } from 'lucide-react';
import { requestJson } from '../src/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await requestJson('/api/auth/password-reset/', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
      setEmail('');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to process password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="fixed top-4 left-4 z-20">
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
          <ArrowLeft size={18} />
          Back to Login
        </Link>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/login.jpg')" }}
      >
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-green-700/55 mix-blend-multiply" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px, 48px 48px',
              opacity: 0.18,
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TST School Portal</h1>
              <p className="text-sm text-white/80">Secure Access</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">Reset Your Password</h2>
            <p className="text-white/90 text-lg">We'll help you regain access to your TST School Portal account.</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-white/80">
              <p>If you don't receive an email within 5 minutes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam folder</li>
                <li>Verify the email address is correct</li>
                <li>Contact support for assistance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/10 clip-path-wave"></div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-12 text-gray-900">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Password Recovery</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Forgot Your Password?</h1>
            <p className="text-gray-600">Don't worry! Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-green-800">
                    We've sent password reset instructions to {email}. Please check your email and follow the link to reset your password.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@school.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter the email associated with your account</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">Remember your password?</p>
            <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Go back to login
            </Link>
          </div>

          {success && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Didn't receive an email?</h4>
              <ul className="text-xs text-blue-800 space-y-1 mb-4">
                <li>• Check your spam or junk folder</li>
                <li>• Wait a few minutes before requesting again</li>
                <li>• Verify the email address is correct</li>
              </ul>
              <button
                onClick={() => setSuccess(false)}
                className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                Try Another Email
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .clip-path-wave {
          clip-path: polygon(0 30%, 0 100%, 100% 100%, 100% 30%, 95% 27%, 90% 30%, 85% 27%, 80% 30%, 75% 27%, 70% 30%, 65% 27%, 60% 30%, 55% 27%, 50% 30%, 45% 27%, 40% 30%, 35% 27%, 30% 30%, 25% 27%, 20% 30%, 15% 27%, 10% 30%, 5% 27%, 0 30%);
        }
      `}</style>
    </div>
  );
}
