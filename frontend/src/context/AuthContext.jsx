import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = async () => {
    const token = localStorage.getItem('sb_access')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me/')
      setUser(res.data)
    } catch (e) {
      localStorage.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    localStorage.setItem('sb_access', res.data.access)
    localStorage.setItem('sb_refresh', res.data.refresh)
    localStorage.setItem('sb_role', res.data.role)
    localStorage.setItem('sb_display_name', res.data.display_name)
    await loadMe()
    return res.data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const refreshUser = loadMe

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
