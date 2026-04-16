import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api as mockApi } from '@/services/api'
import type { Discount } from '@/services/api'
import { Student } from '@/features/students/types'

/**
 * مفاتيح الاستعلام الخاصة بالطلاب لإدارة التخزين المؤقت (Cache) في React Query.
 */
export const studentKeys = {
    /** جميع بيانات الطلاب */
    all: ['students'] as const,
    /** قوائم الطلاب مع الفلترة */
    lists: () => [...studentKeys.all, 'list'] as const,
    /** تفاصيل طالب محدد */
    details: () => [...studentKeys.all, 'detail'] as const,
    /** مفتاح تفاصيل طالب معين حسب المعرف */
    detail: (id: string) => [...studentKeys.details(), id] as const,
    /** الخصومات المرتبطة بالطلاب */
    discounts: ['discounts'] as const,
}

/**
 * خطاف لجلب قائمة الطلاب مع دعم البحث والفلترة والترقيم.
 * 
 * @param {Object} [params] - معاملات البحث والفلترة
 * @param {string} [params.query] - نص البحث (الاسم أو الرقم الجامعي)
 * @param {string} [params.department] - القسم الدراسي
 * @param {number} [params.page] - رقم الصفحة
 * @param {number} [params.limit] - عدد العناصر في الصفحة
 * @returns {UseQueryResult} كائن يحتوي على بيانات الطلاب وحالة الاستعلام
 */
export const useStudents = (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
    return useQuery({
        queryKey: [...studentKeys.lists(), params],
        queryFn: () => mockApi.getStudents(params),
        placeholderData: keepPreviousData,
    })
}

/**
 * خطاف لجلب بيانات طالب محدد باستخدام المعرف.
 * 
 * @param {string} id - المعرف الفريد للطالب
 * @returns {UseQueryResult} كائن يحتوي على بيانات الطالب
 */
export const useStudent = (id: string) => {
    return useQuery({
        queryKey: studentKeys.detail(id),
        queryFn: () => mockApi.getStudentById(id),
        enabled: !!id,
    })
}

/**
 * خطاف لإضافة طالب جديد إلى النظام.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الإضافة وحالة التنفيذ
 */
export const useAddStudent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newStudent: Omit<Student, 'id'>) => mockApi.addStudent(newStudent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
        },
    })
}

/**
 * خطاف لتحديث بيانات طالب موجود.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة التحديث وحالة التنفيذ
 */
export const useUpdateStudent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) => mockApi.updateStudent(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
        },
    })
}

/**
 * خطاف لحذف طالب من النظام.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الحذف وحالة التنفيذ
 */
export const useDeleteStudent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => mockApi.deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['grades'] })
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
            // Note: Since courses are in Redux, they will need a manual refetch or page reload to show updated counts
            // In a real app, we might dispatch a Redux action here.
        },
    })
}

/**
 * خطاف لتعيين خصم أو منحة لطالب محدد.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة التعيين وحالة التنفيذ
 */
export const useAssignDiscount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ studentId, discountId }: { studentId: string; discountId: string }) =>
            mockApi.assignDiscountToStudent(studentId, discountId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
        }
    })
}

/**
 * خطاف لإزالة خصم من طالب محدد.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الإزالة وحالة التنفيذ
 */
export const useRemoveDiscount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ studentId, discountId }: { studentId: string; discountId: string }) =>
            mockApi.removeDiscountFromStudent(studentId, discountId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
        }
    })
}

/**
 * خطاف لجلب إحصائيات الطلاب (التوزيع والنمو).
 * 
 * @returns {UseQueryResult} كائن يحتوي على إحصائيات الطلاب
 */
export const useStudentStats = () => {
    return useQuery({
        queryKey: [...studentKeys.all, 'stats'],
        queryFn: () => mockApi.getStudentStats(),
    })
}
