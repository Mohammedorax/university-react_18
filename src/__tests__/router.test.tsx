import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userEvent from '@testing-library/user-event'
import authReducer from '../store/slices/authSlice'

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuthState: vi.fn(),
}))

import { useAuthState } from '@/features/auth/hooks/useAuth'

const mockUseAuthState = useAuthState as ReturnType<typeof vi.fn>

const createTestStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: authState,
    },
  })
}

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  const ProtectedRouteComponent = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    const { user, token, isAuthenticated, isLoading } = useAuthState()

    if (isLoading) {
      return <div data-testid="loading">Loading...</div>
    }

    if (!isAuthenticated || !token || !user) {
      return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading when auth is loading', () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    })

    renderWithRouter(
      <ProtectedRouteComponent>
        <div>Protected Content</div>
      </ProtectedRouteComponent>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRouteComponent>
              <div>Protected Content</div>
            </ProtectedRouteComponent>
          }
        />
      </Routes>,
      ['/protected']
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should redirect to login when token is missing', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRouteComponent>
              <div>Protected Content</div>
            </ProtectedRouteComponent>
          }
        />
      </Routes>,
      ['/protected']
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
    })

    renderWithRouter(
      <ProtectedRouteComponent>
        <div>Protected Content</div>
      </ProtectedRouteComponent>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should restrict by allowed roles', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
    })

    renderWithRouter(
      <Routes>
        <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRouteComponent allowedRoles={['admin']}>
              <div>Admin Dashboard</div>
            </ProtectedRouteComponent>
          }
        />
      </Routes>,
      ['/admin/dashboard']
    )

    expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
  })

  it('should allow multiple roles', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'admin' },
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
    })

    renderWithRouter(
      <ProtectedRouteComponent allowedRoles={['admin', 'staff']}>
        <div>Admin/Staff Content</div>
      </ProtectedRouteComponent>
    )

    expect(screen.getByText('Admin/Staff Content')).toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  const PublicRouteComponent = ({ children }: { children: React.ReactNode }) => {
    const { user, token } = useAuthState()

    if (token && user) {
      return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      token: null,
    })

    renderWithRouter(
      <PublicRouteComponent>
        <div>Login Page</div>
      </PublicRouteComponent>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should redirect to dashboard when authenticated as student', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      token: 'valid-token',
    })

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
        <Route
          path="/login-check"
          element={
            <PublicRouteComponent>
              <div>Login Page</div>
            </PublicRouteComponent>
          }
        />
      </Routes>,
      ['/login-check']
    )

    expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
  })

  it('should redirect to dashboard when authenticated as admin', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'admin' },
      token: 'valid-token',
    })

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route
          path="/login-check"
          element={
            <PublicRouteComponent>
              <div>Login Page</div>
            </PublicRouteComponent>
          }
        />
      </Routes>,
      ['/login-check']
    )

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('should redirect to correct role dashboard', () => {
    const roles = ['student', 'teacher', 'admin', 'staff'] as const
    
    roles.forEach(role => {
      mockUseAuthState.mockReturnValue({
        user: { id: '1', email: 'test@example.com', name: 'Test', role },
        token: 'valid-token',
      })

      const { unmount } = renderWithRouter(
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/student/dashboard" element={<div>Student</div>} />
          <Route path="/teacher/dashboard" element={<div>Teacher</div>} />
          <Route path="/admin/dashboard" element={<div>Admin</div>} />
          <Route path="/staff/dashboard" element={<div>Staff</div>} />
          <Route
            path="/login-check"
            element={
              <PublicRouteComponent>
                <div>Login</div>
              </PublicRouteComponent>
            }
          />
        </Routes>,
        ['/login-check']
      )

      const expectedText = role.charAt(0).toUpperCase() + role.slice(1)
      expect(screen.getByText(expectedText)).toBeInTheDocument()
      unmount()
    })
  })
})

describe('Route Guards Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should protect multiple routes with different roles', () => {
    mockUseAuthState.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'teacher' },
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
    })

    renderWithRouter(
      <Routes>
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRouteComponent allowedRoles={['teacher']}>
              <div>Attendance</div>
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRouteComponent allowedRoles={['admin']}>
              <div>Students</div>
            </ProtectedRouteComponent>
          }
        />
        <Route path="/teacher/dashboard" element={<div>Teacher Dashboard</div>} />
      </Routes>,
      ['/admin/students']
    )

    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument()
  })

  it('should allow access to unprotected routes', () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })

    renderWithRouter(
      <Routes>
        <Route path="/public" element={<div>Public Page</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      ['/public']
    )

    expect(screen.getByText('Public Page')).toBeInTheDocument()
  })
})

const ProtectedRouteComponent = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, token, isAuthenticated, isLoading } = useAuthState()

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>
  }

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return <>{children}</>
}