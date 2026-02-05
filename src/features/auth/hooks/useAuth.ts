import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/services/mockApi'
import { useAppDispatch, useAppSelector } from '@/store'
import { setToken, clearAuth, updateProfile } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * خطاف مخصص لإدارة واسترجاع حالة المصادقة (Authentication State).
 * يوفر معلومات حول المستخدم الحالي، التوكن، وصلاحيات الوصول.
 * 
 * @returns {Object} كائن يحتوي على حالة المصادقة:
 *  - user: بيانات المستخدم الحالي
 *  - token: توكن الوصول
 *  - isAuthenticated: هل المستخدم مسجل دخوله
 *  - isAdmin: هل المستخدم مسؤول
 *  - isTeacher: هل المستخدم أستاذ
 *  - isStudent: هل المستخدم طالب
 */
export const useAuthState = () => {
    const { user, token } = useAppSelector((state) => state.auth)
    return {
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student'
    }
}

/**
 * خطاف مخصص لعملية تسجيل الدخول.
 * يستخدم React Query Mutation لإرسال بيانات الدخول وتحديث حالة التطبيق.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة mutate وحالة العملية
 */
export const useLogin = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => 
            mockApi.login(email, password),
        onSuccess: (data) => {
            dispatch(setToken(data.token))
            dispatch(updateProfile(data.user))
            toast.success('تم تسجيل الدخول بنجاح')
            navigate(`/${data.user.role}/dashboard`)
        },
        onError: (error: Error) => {
            toast.error(error.message || 'خطأ في تسجيل الدخول')
        }
    })
}

/**
 * خطاف مخصص لعملية تسجيل الخروج.
 * يقوم بمسح بيانات المصادقة من الـ Redux Store وتنظيف التخزين المؤقت للاستعلامات.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة mutate وحالة العملية
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
