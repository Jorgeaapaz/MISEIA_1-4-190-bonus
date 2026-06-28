'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { JwtPayload } from '@/lib/types'
import { verifyToken } from '@/lib/auth-client'

interface AuthContextValue {
  user: JwtPayload | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function init() {
      const stored = localStorage.getItem('bv_token')
      if (stored) {
        const payload = verifyToken(stored)
        if (payload) {
          setToken(stored)
          setUser(payload)
        } else {
          localStorage.removeItem('bv_token')
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  function login(newToken: string) {
    const payload = verifyToken(newToken)
    if (payload) {
      localStorage.setItem('bv_token', newToken)
      setToken(newToken)
      setUser(payload)
    }
  }

  function logout() {
    localStorage.removeItem('bv_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
