import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api as mockApi } from '@/services/api'
import type { Course } from '@/features/courses/types'

/**
 * مفاتيح الاستعلام الخاصة بالمقررات لإدارة التخزين المؤقت في React Query.
 *
 * ملاحظة معمارية:
 * بيانات المقررات هي Server-State، لذا تم نقلها من Redux (coursesSlice) إلى
 * React Query كجزء من سياسة إدارة الحالة الموحدة (Hybrid: Server-State أولًا).
 */
export const courseKeys = {
    all: ['courses'] as const,
    lists: () => [...courseKeys.all, 'list'] as const,
    details: () => [...courseKeys.all, 'detail'] as const,
    detail: (id: string) => [...courseKeys.details(), id] as const,
    enrolled: (studentId: string) => [...courseKeys.all, 'enrolled', studentId] as const,
}

interface UseCoursesOptions {
    query?: string
    department?: string
    page?: number
    limit?: number
}

/**
 * جلب قائمة المقررات مع البحث/الفلترة/الترقيم.
 * يحافظ على الواجهة القديمة لتوافق الاستدعاءات الحالية في الصفحات.
 */
export const useCourses = ({ query = '', department = 'all', page = 1, limit = 8 }: UseCoursesOptions = {}) => {
    const q = useQuery({
        queryKey: [...courseKeys.lists(), { query, department, page, limit }],
        queryFn: () => mockApi.getCourses({ query, department, page, limit }),
        placeholderData: keepPreviousData,
    })

    const totalItems = q.data?.total ?? 0
    const courses = q.data?.items ?? []

    return {
        data: { items: courses, total: totalItems },
        isLoading: q.isLoading,
        isRefetching: q.isFetching && !q.isLoading,
        error: q.error as unknown,
        refetch: q.refetch,
        courses,
        currentPage: page,
        totalItems,
    }
}

export const useCourse = (id: string) => {
    return useQuery({
        queryKey: courseKeys.detail(id),
        queryFn: () => mockApi.getCourseById(id),
        enabled: !!id,
    })
}

export const useAddCourse = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Omit<Course, 'id' | 'enrolled_students'>) => mockApi.addCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
        },
    })
}

export const useUpdateCourse = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ courseId, courseData }: { courseId: string; courseData: Partial<Course> }) =>
            mockApi.updateCourse(courseId, courseData),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(vars.courseId) })
        },
    })
}

export const useDeleteCourse = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (courseId: string) => mockApi.deleteCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
        },
    })
}

export const useEnrollStudentInCourse = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) =>
            mockApi.enrollInCourse(studentId, courseId),
        onSuccess: (_d, vars) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
            queryClient.invalidateQueries({ queryKey: courseKeys.enrolled(vars.studentId) })
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

export const useUnenrollStudentFromCourse = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) =>
            mockApi.unenrollFromCourse(studentId, courseId),
        onSuccess: (_d, vars) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
            queryClient.invalidateQueries({ queryKey: courseKeys.enrolled(vars.studentId) })
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

/**
 * جلب المقررات التي سجل فيها طالب محدد.
 * إن لم يكن لدى mockApi دالة مخصصة نستخدم قائمة المقررات ونفلتر في الواجهة.
 */
export const useEnrolledCourses = (studentId: string) => {
    return useQuery({
        queryKey: courseKeys.enrolled(studentId),
        queryFn: async () => {
            const res = await mockApi.getCourses({ page: 1, limit: 1000 })
            return (res.items as Course[]).filter((c) => c.enrolled_students > 0)
        },
        enabled: !!studentId,
    })
}
