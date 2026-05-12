'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Home } from 'lucide-react';

type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | null;

export default function Login() {
  const [role, setRole] = useState<UserRole>(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      alert('Please select a role to continue');
      return;
    }

    // For demo: accept any credentials and redirect to selected role dashboard
    // Persist demo session (optional)
    try {
      sessionStorage.setItem('demo_role', role);
      sessionStorage.setItem('demo_user', admissionNo || 'demo-user');
    } catch (err) {
      // ignore storage errors
    }

    // Map role to route
    const routeMap: Record<string, string> = {
      student: '/student/dashboard',
      parent: '/parent/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };

    const target = routeMap[role] || '/';
    router.push(target);
  };

  const roleButtons = [
    { id: 'student', label: 'Student', icon: '👤' },
    { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
    { id: 'teacher', label: 'Teacher', icon: '📚' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green Gradient with School Info */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/login.jpg')" }}
      >
        {/* Translucent green overlay and subtle grid pattern */}
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

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your School</h1>
              <p className="text-sm text-white/80">Portal</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">Welcome to Your School Portal</h2>
            <p className="text-white/90 text-lg">Access academic records, fees, attendance, and communication in one place.</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="relative z-10 space-y-4 mb-12">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Track Performance</h3>
              <p className="text-sm text-white/80">Monitor grades and progress</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Fees Management</h3>
              <p className="text-sm text-white/80">View and pay fees online</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">📅</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Attendance Records</h3>
              <p className="text-sm text-white/80">Check daily attendance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">💬</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Messages & Notices</h3>
              <p className="text-sm text-white/80">Stay informed with updates</p>
            </div>
          </div>
        </div>

        {/* Wavy Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/10 clip-path-wave"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 lg:p-12 text-gray-900">
        <div className="w-full max-w-md">
          {/* Demo Mode Badge */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Demo Mode</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Login to Portal</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roleButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setRole(btn.id as UserRole)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    role === btn.id
                      ? 'bg-green-600 text-white border-2 border-green-600'
                      : 'bg-gray-100 text-gray-900 border-2 border-transparent hover:border-green-600'
                  }`}
                >
                  <div className="text-lg mb-1">{btn.icon}</div>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admission Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Admission No.</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="GVA-2024-001"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
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
              <Link href="/forgot" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all mt-6"
            >
              Login
            </button>
          </form>

          {/* Help Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/contact" className="text-green-600 hover:text-green-700 font-medium">
                Contact admin
              </a>
            </p>
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
