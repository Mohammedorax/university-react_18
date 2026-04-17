import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import authReducer from '@/store/slices/authSlice'
import { setAuthenticated } from '@/store/slices/authSlice'
import { useAuthState, useLogin, useLogout, useUpdateProfile } from '../useAuth'

vi.mock('@/services/api', () => ({
  api: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const mockApi = vi.mocked(api)
const mockNavigate = vi.mocked(useNavigate)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe('useAuth hooks', () => {
  let store: ReturnType<typeof configureStore>
  let queryClient: QueryClient

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    })

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    vi.clearAllMocks()
    mockNavigate.mockReturnValue(vi.fn())
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )

  describe('useAuthState', () => {
    it('should return initial auth state', () => {
      const { result } = renderHook(() => useAuthState(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isTeacher).toBe(false)
      expect(result.current.isStudent).toBe(false)
      expect(result.current.isStaff).toBe(false)
    })

    it('should return authenticated state for student', () => {
      store.dispatch(
        setAuthenticated({
          user: {
            id: '1',
            email: 'student@example.com',
            name: 'Student User',
            role: 'student',
          },
        })
      )

      const { result } = renderHook(() => useAuthState(), { wrapper })

      expect(result.current.user?.role).toBe('student')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isStudent).toBe(true)
      expect(result.current.isAdmin).toBe(false)
    })

    it('should return authenticated state for admin', () => {
      store.dispatch(
        setAuthenticated({
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
          },
        })
      )

      const { result } = renderHook(() => useAuthState(), { wrapper })

      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isTeacher).toBe(false)
    })
  })

  describe('useLogin', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student' as const,
      }

      mockApi.login.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useLogin(), { wrapper })

      result.current.mutate({ email: 'test@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApi.login).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockToastSuccess).toHaveBeenCalledWith('تم تسجيل الدخول بنجاح')
      expect(mockNavigate).toHaveBeenCalled()
    })

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials')
      mockApi.login.mockRejectedValue(error)

      const { result } = renderHook(() => useLogin(), { wrapper })

      result.current.mutate({ email: 'test@example.com', password: 'wrong' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  describe('useLogout', () => {
    beforeEach(() => {
      store.dispatch(
        setAuthenticated({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        })
      )
    })

    it('should handle successful logout', async () => {
      mockApi.logout.mockResolvedValue(undefined)

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApi.logout).toHaveBeenCalled()
      expect(mockToastSuccess).toHaveBeenCalledWith('تم تسجيل الخروج بنجاح')
      expect(mockNavigate).toHaveBeenCalled()
    })

    it('should handle logout error but still clear auth', async () => {
      const error = new Error('Logout failed')
      mockApi.logout.mockRejectedValue(error)

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('useUpdateProfile', () => {
    it('should handle successful profile update', async () => {
      store.dispatch(
        setAuthenticated({
          user: {
            id: '1',
            email: 'old@example.com',
            name: 'Old Name',
            role: 'student',
          },
        })
      )

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      result.current.mutate({ name: 'New Name', email: 'new@example.com' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockToastSuccess).toHaveBeenCalledWith('تم تحديث الملف الشخصي بنجاح')
    })

    it('should expose mutate function', () => {
      store.dispatch(
        setAuthenticated({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            role: 'student',
          },
        })
      )

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })
      expect(result.current).toHaveProperty('mutate')
      expect(typeof result.current.mutate).toBe('function')
    })
  })
})
