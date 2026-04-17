import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api as mockApi } from '@/services/api'
import { useAppDispatch, useAppSelector } from '@/store'
import { setAuthenticated, clearAuth, updateProfile } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Custom hook for managing and retrieving authentication state.
 * Provides information about the current user, token, and access permissions.
 *
 * @returns {Object} Authentication state object containing:
 *   - user: Current user data
 *   - token: Access token
 *   - isAuthenticated: Whether user is logged in
 *   - isLoading: Whether authentication state is loading
 *   - isAdmin: Whether user has admin role
 *   - isTeacher: Whether user has teacher role
 *   - isStudent: Whether user has student role
 *   - isStaff: Whether user has staff role
 */
export const useAuthState = () => {
    const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth)
    return {
        user,
        isAuthenticated,
        isLoading,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
        isStaff: user?.role === 'staff'
    }
}

/**
 * Custom hook for handling user login process.
 * Uses React Query mutation to send login credentials and update application state.
 *
 * @returns {UseMutationResult} Object containing mutate function and operation status
 */
export const useLogin = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            mockApi.login(email, password),
          onSuccess: (data) => {
            // Token is handled securely via server cookies only, not stored in Redux or localStorage
            dispatch(setAuthenticated({ user: data.user }))
            toast.success('تم تسجيل الدخول بنجاح')
            navigate(`/${data.user.role}/dashboard`)
        },
        onError: (error: Error) => {
            toast.error(error.message || 'خطأ في تسجيل الدخول')
        }
    })
}

/**
 * Custom hook for handling user logout process.
 * Clears authentication data from Redux store and clears query cache.
 *
 * @returns {UseMutationResult} Object containing mutate function and operation status
 */
export const useLogout = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => mockApi.logout(),
        onSuccess: () => {
            dispatch(clearAuth())
            queryClient.clear()
            navigate('/login')
            toast.success('تم تسجيل الخروج بنجاح')
        },
        onError: (error: Error) => {
            logger.error('Logout error:', { message: error.message })
            // Force logout anyway
            dispatch(clearAuth())
            queryClient.clear()
            navigate('/login')
        }
    })
}

/**
 * خطاف مخصص لتحديث بيانات الملف الشخصي للمستخدم الحالي.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة mutate وحالة العملية
 */
export const useUpdateProfile = () => {
    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: async (data: { name: string; email: string }) => {
            // محاكاة عملية تحديث البيانات
            await new Promise(resolve => setTimeout(resolve, 500))
            return data
        },
        onSuccess: (data) => {
            dispatch(updateProfile(data))
            toast.success('تم تحديث الملف الشخصي بنجاح')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'خطأ في تحديث الملف الشخصي')
        }
    })
}
