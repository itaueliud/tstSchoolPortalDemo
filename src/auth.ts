export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

export type AuthUser = {
  id?: string
  username: string
  first_name?: string
  last_name?: string
  email?: string
  role: UserRole
  phone_number?: string
}

export type AuthSession = {
  role: UserRole
  token: string
  refreshToken?: string
  username: string
  user?: AuthUser
}

const SESSION_KEYS = {
  role: 'demo_role',
  token: 'demo_token',
  refreshToken: 'demo_refresh_token',
  username: 'demo_user',
  user: 'demo_user_profile',
} as const

function isUserRole(value: string | null): value is UserRole {
  return value === 'student' || value === 'parent' || value === 'teacher' || value === 'admin'
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEYS.role, session.role)
  sessionStorage.setItem(SESSION_KEYS.token, session.token)
  sessionStorage.setItem(SESSION_KEYS.username, session.username || 'demo-user')
  if (session.refreshToken) {
    sessionStorage.setItem(SESSION_KEYS.refreshToken, session.refreshToken)
  } else {
    sessionStorage.removeItem(SESSION_KEYS.refreshToken)
  }
  if (session.user) {
    sessionStorage.setItem(SESSION_KEYS.user, JSON.stringify(session.user))
  } else {
    sessionStorage.removeItem(SESSION_KEYS.user)
  }
}

export function saveDemoSession(role: UserRole, username: string) {
  saveAuthSession({ role, token: '', username: username || 'demo-user' })
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEYS.role)
  sessionStorage.removeItem(SESSION_KEYS.token)
  sessionStorage.removeItem(SESSION_KEYS.refreshToken)
  sessionStorage.removeItem(SESSION_KEYS.username)
  sessionStorage.removeItem(SESSION_KEYS.user)
}

export function clearDemoSession() {
  clearAuthSession()
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  const role = sessionStorage.getItem(SESSION_KEYS.role)
  const token = sessionStorage.getItem(SESSION_KEYS.token) || ''
  const username = sessionStorage.getItem(SESSION_KEYS.username) || ''
  if (!isUserRole(role)) {
    return null
  }
  const userRaw = sessionStorage.getItem(SESSION_KEYS.user)
  const refreshToken = sessionStorage.getItem(SESSION_KEYS.refreshToken) || undefined
  let user: AuthUser | undefined
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AuthUser
    } catch {
      user = undefined
    }
  }
  return {
    role,
    token,
    refreshToken,
    username,
    user,
  }
}

export function getAuthRole(): UserRole | null {
  return getAuthSession()?.role ?? null
}

export function getAuthToken(): string | null {
  return getAuthSession()?.token || null
}

export function getAuthUsername(): string | null {
  return getAuthSession()?.username || null
}

export function getDemoRole(): UserRole | null {
  return getAuthRole()
}
