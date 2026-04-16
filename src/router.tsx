import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

// Layouts - تحميل فوري لأنها مطلوبة دائماً
import MainLayout from '@/components/layouts/MainLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import DashboardLayout from '@/components/layouts/DashboardLayout'

/**
 * دالة مساعدة لاستيراد كسول مع إعادة المحاولة التلقائية لمعالجة أخطاء التحميل الديناميكي
 * يحل مشكلة "Failed to fetch dynamically imported module" في Vite
 */
const lazyWithRetry = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  retries = 3,
  delay = 1000
) => {
  return new Promise<{ default: React.ComponentType<any> }>((resolve, reject) => {
    const attemptImport = (attempt: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (attempt < retries) {
            logger.warn('Lazy chunk load failed, retrying', { attempt: attempt + 1, retries, error: (error as Error)?.message })
            setTimeout(() => attemptImport(attempt + 1), delay * attempt)
          } else {
            logger.error('Lazy chunk load failed after all retries', { error: (error as Error)?.message })
            reject(error)
          }
        })
    }
    attemptImport(0)
  })
}

// Pages - تحميل كسول مع معالجة أخطاء وإعادة المحاولة التلقائية
const LoginPage = lazy(() => lazyWithRetry(() => import('@/features/auth/pages/LoginPage')))
const RegisterPage = lazy(() => lazyWithRetry(() => import('@/features/auth/pages/RegisterPage')))
const StudentDashboard = lazy(() => lazyWithRetry(() => import('@/features/students/pages/StudentDashboard')))
const TeacherDashboard = lazy(() => lazyWithRetry(() => import('@/features/teachers/pages/TeacherDashboard')))
const AdminDashboard = lazy(() => lazyWithRetry(() => import('@/features/admin/pages/AdminDashboard')))
const ProfilePage = lazy(() => lazyWithRetry(() => import('@/features/profile/pages/ProfilePage')))
const CoursesPage = lazy(() => lazyWithRetry(() => import('@/features/courses/pages/CoursesPage')))
const GradesPage = lazy(() => lazyWithRetry(() => import('@/features/grades/pages/GradesPage')))
const SchedulePage = lazy(() => lazyWithRetry(() => import('@/features/schedule/pages/SchedulePage')))
const ReportsPage = lazy(() => lazyWithRetry(() => import('@/features/reports/pages/ReportsPage')))
const InventoryPage = lazy(() => lazyWithRetry(() => import('@/features/inventory/pages/InventoryPage')))
const DiscountsPage = lazy(() => lazyWithRetry(() => import('@/features/finance/pages/DiscountsPage')))
const StudentsPage = lazy(() => lazyWithRetry(() => import('@/features/students/pages/StudentsPage')))
const TeachersPage = lazy(() => lazyWithRetry(() => import('@/features/teachers/pages/TeachersPage')))
const StaffPage = lazy(() => lazyWithRetry(() => import('@/features/staff/pages/StaffPage')))
const StaffDashboard = lazy(() => lazyWithRetry(() => import('@/features/staff/pages/StaffDashboard')))
const SettingsPage = lazy(() => lazyWithRetry(() => import('@/features/settings/pages/SettingsPage')))
const AuditLogsPage = lazy(() => lazyWithRetry(() => import('@/features/admin/pages/AuditLogsPage')))
const ProjectStructurePage = lazy(() => lazyWithRetry(() => import('@/features/admin/pages/ProjectStructurePage')))
const AttendancePage = lazy(() => lazyWithRetry(() => import('@/features/teachers/pages/AttendancePage')))

/**
 * Loading component displayed while pages are being loaded asynchronously.
 * Provides a visual indicator and accessibility features for screen readers.
 *
 * @returns {JSX.Element} A centered spinner with loading text
 */
const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center" role="status" aria-label="جاري التحميل">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">جاري تحميل الصفحة...</span>
    </div>
)

/**
 * Protected route component that restricts access based on authentication and role permissions.
 * Redirects unauthenticated users to login page and unauthorized users to their role-specific dashboard.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {string[]} [props.allowedRoles] - Array of roles allowed to access this route. If undefined, all authenticated users can access
 * @returns {JSX.Element} Either the children, a loader, or a redirect component
 */
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    const { user, isAuthenticated, isLoading } = useAuthState()
    const location = useLocation()

    // Show loader while auth state is loading
    if (isLoading) {
        return <PageLoader />
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
}

/**
 * Public route component that redirects authenticated users to their role-specific dashboard.
 * Used for login/register pages to prevent access when already logged in.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render for unauthenticated users
 * @returns {JSX.Element} Either the children or a redirect to dashboard
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated } = useAuthState()

    if (isAuthenticated && user) {
        return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
}

/**
 * Main application router component that defines all application routes and their guards.
 * Uses lazy loading for performance optimization and wraps routes in appropriate layouts.
 *
 * @returns {JSX.Element} The complete routing structure with BrowserRouter, Suspense, and all routes
 */
/**
 * مكون معالجة الأخطاء لالتقاط أخطاء تحميل الصفحات وعرض رسالة مناسبة
 */
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    logger.error('Page-level error boundary caught error', { message: error.message, stack: error.stack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="max-w-md space-y-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600">حدث خطأ أثناء تحميل الصفحة</h2>
            <p className="text-gray-600">
              واجه النظام مشكلة تقنية غير متوقعة. الرجاء المحاولة مرة أخرى.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
              >
                🔄 إعادة تحميل الصفحة
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                🏠 العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const AppRouter = () => {
    return (
        <BrowserRouter>
            <PageErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                    <Route element={<MainLayout />}>
                        {/* Public Routes */}
                        <Route element={<AuthLayout />}>
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <RegisterPage />
                                    </PublicRoute>
                                }
                            />
                        </Route>

                        {/* Protected Routes */}
                        <Route element={<DashboardLayout />}>
                            {/* Student Routes */}
                            <Route
                                path="/student/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Teacher Routes */}
                            <Route
                                path="/teacher/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['teacher']}>
                                        <TeacherDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/teacher/attendance"
                                element={
                                    <ProtectedRoute allowedRoles={['teacher']}>
                                        <AttendancePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Staff Routes */}
                            <Route
                                path="/staff/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['staff']}>
                                        <StaffDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/students"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                        <StudentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/teachers"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                        <TeachersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/staff"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <StaffPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/logs"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AuditLogsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/project-structure"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ProjectStructurePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/reports"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ReportsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/inventory"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                        <InventoryPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/discounts"
                                element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                        <DiscountsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Shared Routes */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/courses"
                                element={
                                    <ProtectedRoute>
                                        <CoursesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/grades"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                                        <GradesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/schedule"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                                        <SchedulePage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

                        {/* Default Redirects */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
                </Suspense>
            </PageErrorBoundary>
        </BrowserRouter>
    )
}

export default AppRouter
