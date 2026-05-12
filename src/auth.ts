export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

export function saveDemoSession(role: UserRole, username: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('demo_role', role)
  sessionStorage.setItem('demo_user', username || 'demo-user')
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('demo_role')
  sessionStorage.removeItem('demo_user')
}

export function getDemoRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  const role = sessionStorage.getItem('demo_role')
  if (role === 'student' || role === 'parent' || role === 'teacher' || role === 'admin') {
    return role
  }
  return null
}
