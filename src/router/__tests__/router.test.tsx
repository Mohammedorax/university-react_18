import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute, PublicRoute } from '../router';
import authReducer from '../../store/slices/authSlice';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useAuthState
vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuthState: vi.fn(),
}));

// Mock useLocation from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

import { useAuthState } from '../../features/auth/hooks/useAuth';
import { useLocation } from 'react-router-dom';

const mockUseAuthState = vi.mocked(useAuthState);
const mockUseLocation = vi.mocked(useLocation);

describe('Router Components', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );

  describe('ProtectedRoute', () => {
    const TestComponent = () => <div>Protected Content</div>;

    it('should show loading when auth is loading', () => {
      mockUseAuthState.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        isStaff: false,
      });

      const { getByRole } = render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper }
      );

      expect(getByRole('status')).toBeInTheDocument();
      expect(getByRole('status')).toHaveAttribute('aria-label', 'جاري التحميل');
    });

    it('should redirect to login when not authenticated', () => {
      mockUseAuthState.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        isStaff: false,
      });

      mockUseLocation.mockReturnValue({
        pathname: '/protected',
        search: '',
        hash: '',
        state: null,
        key: 'test',
      });

      const { container } = render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper }
      );

      // Since Navigate component renders null, we check that our component is not rendered
      expect(container.textContent).not.toContain('Protected Content');
    });

    it('should redirect to role dashboard when authenticated but not authorized', () => {
      mockUseAuthState.mockReturnValue({
        user: {
          id: '1',
          email: 'student@example.com',
          name: 'Student User',
          role: 'student',
        },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        isStaff: false,
      });

      const { container } = render(
        <ProtectedRoute allowedRoles={['admin']}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper }
      );

      // Should redirect to student dashboard
      expect(container.textContent).not.toContain('Protected Content');
    });

    it('should render content when authenticated and authorized', () => {
      mockUseAuthState.mockReturnValue({
        user: {
          id: '1',
          email: 'student@example.com',
          name: 'Student User',
          role: 'student',
        },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        isStaff: false,
      });

      const { getByText } = render(
        <ProtectedRoute allowedRoles={['student']}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper }
      );

      expect(getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render content when authenticated and no role restrictions', () => {
      mockUseAuthState.mockReturnValue({
        user: {
          id: '1',
          email: 'student@example.com',
          name: 'Student User',
          role: 'student',
        },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        isStaff: false,
      });

      const { getByText } = render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper }
      );

      expect(getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('PublicRoute', () => {
    const TestComponent = () => <div>Public Content</div>;

    it('should render content when not authenticated', () => {
      mockUseAuthState.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        isStaff: false,
      });

      const { getByText } = render(
        <PublicRoute>
          <TestComponent />
        </PublicRoute>,
        { wrapper }
      );

      expect(getByText('Public Content')).toBeInTheDocument();
    });

    it('should redirect to role dashboard when authenticated', () => {
      mockUseAuthState.mockReturnValue({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: true,
        isTeacher: false,
        isStudent: false,
        isStaff: false,
      });

      const { container } = render(
        <PublicRoute>
          <TestComponent />
        </PublicRoute>,
        { wrapper }
      );

      // Should redirect to admin dashboard
      expect(container.textContent).not.toContain('Public Content');
    });

    it('should handle different user roles', () => {
      const roles = ['student', 'teacher', 'admin', 'staff'] as const;

      roles.forEach(role => {
        mockUseAuthState.mockReturnValue({
          user: {
            id: '1',
            email: `${role}@example.com`,
            name: `${role} User`,
            role,
          },
          token: 'token',
          isAuthenticated: true,
          isLoading: false,
          isAdmin: role === 'admin',
          isTeacher: role === 'teacher',
          isStudent: role === 'student',
          isStaff: role === 'staff',
        });

        const { container } = render(
          <PublicRoute>
            <TestComponent />
          </PublicRoute>,
          { wrapper }
        );

        expect(container.textContent).not.toContain('Public Content');
      });
    });
  });
});