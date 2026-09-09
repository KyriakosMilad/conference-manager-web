import type { ApiEnvelope } from './types'

const TOKEN_KEY = 'cm.token'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function apiBase() {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
}

type RequestOptions = {
  method?: string
  body?: unknown
  query?: Record<string, string | number | undefined>
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path.replace(/^\//, ''), `${apiBase()}/`)
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    envelope = null
  }

  if (response.status === 401) {
    setToken(null)
    onUnauthorized?.()
    throw new ApiError(envelope?.message || 'Unauthorized', 401)
  }

  if (!envelope) {
    throw new ApiError(response.statusText || 'Request failed', response.status)
  }

  if (!envelope.success || response.status >= 400) {
    throw new ApiError(envelope.message || 'Request failed', envelope.status_code || response.status)
  }

  return envelope.data
}
