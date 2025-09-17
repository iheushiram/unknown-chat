'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nickname: string
  isAnonymous: boolean
}

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    nickname: string
    isAnonymous: boolean
  }
  session?: {
    token: string
    expiresAt: string
  }
  error?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }, [])

  const getUserData = useCallback(() => {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }, [])

  const saveAuth = useCallback((authData: AuthResponse) => {
    if (authData.success && authData.session && authData.user) {
      localStorage.setItem('auth_token', authData.session.token)
      localStorage.setItem('user_data', JSON.stringify(authData.user))
      setUser(authData.user)
      setIsAuthenticated(true)
    }
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const verifyToken = useCallback(async () => {
    const token = getToken()
    if (!token) return false

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()
    } catch (error) {
      console.log(`Token verification failed:`, error)
      return false
    }
  }, [getToken])

  const anonymousLogin = useCallback(
    async (nickname?: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/anonymous`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nickname: nickname?.trim() || undefined,
            }),
          },
        )

        const data: AuthResponse = await response.json()

        if (data.success) {
          saveAuth(data)
          return { success: true }
        } else {
          return { success: false, error: data.error }
        }
      } catch (error) {
        console.error(`Login error:`, error)
        return { success: false, error: 'サーバに接続できません' }
      }
    },
    [saveAuth],
  )

  const logout = useCallback(() => {
    clearAuth()
    router.push('/')
  }, [clearAuth, router])

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUserData()
      const token = getToken()

      if (!token || !userData) {
        setIsLoading(false)
        return
      }

      const isValid = await verifyToken()

      if (isValid) {
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        clearAuth()
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [getUserData, getToken, verifyToken, clearAuth])
}
