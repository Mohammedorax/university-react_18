import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '@/services/mockApi'
import { Grade } from '@/features/grades/types'

// Keys
export const gradeKeys = {
    all: ['grades'] as const,
    lists: () => [...gradeKeys.all, 'list'] as const,
    list: (filters: string) => [...gradeKeys.lists(), { filters }] as const,
    student: (studentId: string) => [...gradeKeys.all, 'student', studentId] as const,
    course: (courseId: string) => [...gradeKeys.all, 'course', courseId] as const,
    statistics: (studentId: string) => [...gradeKeys.all, 'statistics', studentId] as const,
    details: () => [...gradeKeys.all, 'detail'] as const,
    detail: (id: string) => [...gradeKeys.details(), id] as const,
}

// Queries
export const useAllGrades = () => {
    return useQuery({
        queryKey: gradeKeys.lists(),
        queryFn: () => mockApi.getAllGrades(),
    })
}

export const useStudentGrades = (studentId: string) => {
    return useQuery({
        queryKey: gradeKeys.student(studentId),
        queryFn: () => mockApi.getStudentGrades(studentId),
        enabled: !!studentId,
    })
}

export const useCourseGrades = (courseId: string) => {
    return useQuery({
        queryKey: gradeKeys.course(courseId),
        queryFn: () => mockApi.getCourseGrades(courseId),
        enabled: !!courseId,
    })
}

export const useGradeStatistics = (studentId: string) => {
    return useQuery({
        queryKey: gradeKeys.statistics(studentId),
        queryFn: () => mockApi.getGradeStatistics(studentId),
        enabled: !!studentId,
    })
}

// Mutations
export const useSubmitGrade = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (gradeData: Partial<Grade>) => 
            mockApi.submitGrade(gradeData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: gradeKeys.all })
            if (variables.student_id) {
                queryClient.invalidateQueries({ queryKey: gradeKeys.student(variables.student_id) })
                queryClient.invalidateQueries({ queryKey: gradeKeys.statistics(variables.student_id) })
            }
            if (variables.course_id) {
                queryClient.invalidateQueries({ queryKey: gradeKeys.course(variables.course_id) })
            }
        },
    })
}

export const useDeleteGrade = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: string) => mockApi.deleteGrade(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gradeKeys.all })
        },
    })
}
