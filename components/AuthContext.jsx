'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')

    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setAdminEmail(data.email)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token verification error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (token, email) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('adminEmail', email)
    setIsAuthenticated(true)
    setAdminEmail(email)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminEmail')
    setIsAuthenticated(false)
    setAdminEmail('')
  }

  const getToken = () => {
    return localStorage.getItem('authToken')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        loading,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
