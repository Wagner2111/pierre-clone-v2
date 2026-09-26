'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const userData = { email, name: email.split('@')[0] }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    router.push('/dashboard')
  }

  const register = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const userData = { email, name }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
  }

  if (!mounted) return <>{children}</>

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
