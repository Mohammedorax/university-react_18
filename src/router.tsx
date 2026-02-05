import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { Loader2 } from 'lucide-react'

// Layouts - تحميل فوري لأنها مطلوبة دائماً
import MainLayout from '@/components/layouts/MainLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import DashboardLayout from '@/components/layouts/DashboardLayout'

// Pages - تحميل كسول (Lazy Loading) لتقليل حجم البندل الأولي
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const StudentDashboard = lazy(() => import('@/features/students/pages/StudentDashboard'))
const TeacherDashboard = lazy(() => import('@/features/teachers/pages/TeacherDashboard'))
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const CoursesPage = lazy(() => import('@/features/courses/pages/CoursesPage'))
const GradesPage = lazy(() => import('@/features/grades/pages/GradesPage'))
const SchedulePage = lazy(() => import('@/features/schedule/pages/SchedulePage'))
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'))
const InventoryPage = lazy(() => import('@/features/inventory/pages/InventoryPage'))
const DiscountsPage = lazy(() => import('@/features/finance/pages/DiscountsPage'))
const StudentsPage = lazy(() => import('@/features/students/pages/StudentsPage'))
const TeachersPage = lazy(() => import('@/features/teachers/pages/TeachersPage'))
const StaffPage = lazy(() => import('@/features/staff/pages/StaffPage'))
const StaffDashboard = lazy(() => import('@/features/staff/pages/StaffDashboard'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))

// Loading Component - مكون التحميل
const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center" role="status" aria-label="جاري التحميل">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">جاري تحميل الصفحة...</span>
    </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    const { user, token } = useAuthState()
    const location = useLocation()

    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
}

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, token } = useAuthState()

    if (token && user) {
        return <Navigate to={`/${user.role}/dashboard`} replace />
    }

    return <>{children}</>
}

const AppRouter = () => {
    return (
        <BrowserRouter>
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
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                                        <GradesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/schedule"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
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
        </BrowserRouter>
    )
}

export default AppRouter
