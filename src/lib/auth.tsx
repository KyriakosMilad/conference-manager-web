import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { api, getToken, setToken, setUnauthorizedHandler } from './api'
import type { Organisation, User } from './types'
import { isUiPreview, previewOrganisation, previewUser } from './ui-preview'

type AuthContextValue = {
  user: User | null
  organisation: Organisation | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const preview = isUiPreview()

  const meQuery = useQuery({
    queryKey: ['me'],
    enabled: !preview && Boolean(getToken()),
    queryFn: () => api<User>('/auth/me'),
    retry: false,
  })

  const orgQuery = useQuery({
    queryKey: ['organisation', meQuery.data?.org_id],
    enabled: !preview && Boolean(meQuery.data?.org_id),
    queryFn: () => api<Organisation>(`/organisations/${meQuery.data!.org_id}`),
    retry: false,
  })

  useEffect(() => {
    if (preview) {
      setUnauthorizedHandler(null)
      return
    }
    setUnauthorizedHandler(() => {
      queryClient.clear()
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate, preview, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? (preview ? previewUser : null),
      organisation: orgQuery.data ?? (preview ? previewOrganisation : null),
      isLoading: !preview && Boolean(getToken()) && (meQuery.isLoading || (Boolean(meQuery.data) && orgQuery.isLoading)),
      isAuthenticated: preview || Boolean(meQuery.data),
      login: async (token, user) => {
        setToken(token)
        queryClient.setQueryData(['me'], user)
        await queryClient.invalidateQueries({ queryKey: ['organisation'] })
      },
      logout: async () => {
        try {
          if (getToken()) await api('/auth/logout', { method: 'POST' })
        } catch {
          // still clear local session
        }
        setToken(null)
        queryClient.clear()
        navigate('/login', { replace: true })
      },
    }),
    [meQuery.data, meQuery.isLoading, navigate, orgQuery.data, orgQuery.isLoading, preview, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
