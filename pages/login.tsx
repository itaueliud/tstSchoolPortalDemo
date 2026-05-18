'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Home } from 'lucide-react';
import { saveAuthSession, type UserRole } from '../src/auth';
import { requestJson } from '../src/apiClient';

type LoginResponse = {
  token: string
  refresh: string
  role: UserRole
  user: {
    username: string
    first_name?: string
    last_name?: string
    email?: string
    role: UserRole
    phone_number?: string
  }
}

export default function Login() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const roleParam = router.query.role;
    if (typeof roleParam === 'string' && ['student', 'parent', 'teacher', 'admin'].includes(roleParam)) {
      setRole(roleParam as UserRole);
    }
  }, [router.query.role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await requestJson<LoginResponse>('/api/auth/login/', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          identifier: admissionNo,
          password,
          role,
        }),
      });

      saveAuthSession({
        role: response.role,
        token: response.token,
        refreshToken: response.refresh,
        username: response.user.username,
        user: response.user,
      });

      await router.push(`/${response.role}/dashboard`);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleButtons = [
    { id: 'student', label: 'Student', icon: 'S' },
    { id: 'parent', label: 'Parent', icon: 'P' },
    { id: 'teacher', label: 'Teacher', icon: 'T' },
    { id: 'admin', label: 'Admin', icon: 'A' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="fixed top-4 left-4 z-20">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
          <Home size={18} />
          Back to Home
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
            <h2 className="text-4xl font-bold text-white mb-3">Welcome to TST School Portal</h2>
            <p className="text-white/90 text-lg">Access academic records, fees, attendance, and communication in one place.</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/10 clip-path-wave"></div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-12 text-gray-900 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Production Ready</span>
            <span className="text-xs text-gray-500">Demo Mode</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Login to TST Portal</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Demo Tip:</strong>  Student (stude) pass(12345678), Parent (parent) pass(12345678), Teacher (teacher) pass(12345678), Admin (admin) password <code className="bg-blue-100 px-1 rounded">Admin@12345</code>
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">Select Role</label>
            <div className="grid grid-cols-2 gap-2.5">
              {roleButtons.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setRole(btn.id as UserRole)}
                  className={`h-16 px-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center justify-center gap-1.5 ${
                    role === btn.id
                      ? 'bg-green-600 text-white border-2 border-green-600'
                      : 'bg-gray-100 text-gray-900 border-2 border-transparent hover:border-green-600'
                  }`}
                >
                  <div className="text-base leading-none">{btn.icon}</div>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Admission Number / Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="e.g., ADM001 or PARENT001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !role}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">Don't have an account?</p>
            <Link href="/role-select" className="block w-full py-2 text-center border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors">
              Request Account Access
            </Link>
          </div>
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
