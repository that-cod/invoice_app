'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type UserProfile = {
  id: string
  gstin: string
  business_name: string
  owner_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  state_code?: string
  pincode?: string
  logo_url?: string | null
  selected_theme?: string
  onboarding_complete?: boolean
}

type AuthContextType = {
  user: UserProfile | null
  isLoading: boolean
  isDemoMode: false
  signIn: (gstin: string, password: string) => Promise<{ error: string | null }>
  signUp: (gstin: string, password: string, businessName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const signIn = async (gstin: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstin, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Login failed' }
    await refreshUser()
    window.location.href = data.redirectTo
    return { error: null }
  }

  const signUp = async (gstin: string, password: string, businessName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstin, password, businessName }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Signup failed' }
    await refreshUser()
    window.location.href = data.redirectTo
    return { error: null }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemoMode: false, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
