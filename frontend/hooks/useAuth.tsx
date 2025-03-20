"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, saveTokens, clearTokens, getAccessToken } from '@/lib/api'

// 用户类型
type User = {
  id: number
  username: string
  name: string
} | null

// 认证上下文类型
type AuthContextType = {
  user: User
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 初始化时检查用户登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 仅在有访问令牌的情况下尝试获取用户信息
        const token = getAccessToken()
        if (token) {
          try {
            const userData = await authAPI.getCurrentUser()
            setUser(userData)
          } catch (error) {
            // 获取用户信息失败，可能是令牌无效
            console.error('获取用户信息失败:', error)
            clearTokens()
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        clearTokens()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // 登录
  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authAPI.login(username, password)
      setUser({
        id: data.user_id,
        username: data.username,
        name: data.name,
      })
      saveTokens(data.access_token, data.refresh_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const register = async (username: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authAPI.register(username, password, name)
      setUser({
        id: data.user_id,
        username: data.username,
        name: data.name,
      })
      saveTokens(data.access_token, data.refresh_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  // 登出
  const logout = async () => {
    setLoading(true)
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      setUser(null)
      clearTokens()
      router.push('/')
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证的自定义钩子
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }
  return context
} 