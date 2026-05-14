import { getAuthToken } from './auth'

const DEFAULT_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://tstschoolportaldemo.onrender.com'
  : 'http://localhost:8000'

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

type RequestJsonOptions = RequestInit & {
  auth?: boolean
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options
  const requestHeaders = new Headers(headers || {})

  if (!requestHeaders.has('Content-Type') && rest.body) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getAuthToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.detail || payload?.message || 'Request failed'
    throw new Error(message)
  }

  return payload as T
}

export async function requestBlob(path: string, options: RequestJsonOptions = {}): Promise<Blob> {
  const { auth = true, headers, ...rest } = options
  const requestHeaders = new Headers(headers || {})

  if (auth) {
    const token = getAuthToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.detail || payload?.message || 'Request failed'
    throw new Error(message)
  }

  return response.blob()
}
