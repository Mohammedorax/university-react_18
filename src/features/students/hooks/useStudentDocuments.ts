import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi, StudentDocument } from '@/services/mockApi';
import { toast } from 'sonner';

/**
 * مفاتيح الاستعلام الخاصة بوثائق الطلاب لإدارة التخزين المؤقت (Cache) في React Query.
 */
export const studentDocumentKeys = {
    /** جميع بيانات وثائق الطلاب */
    all: ['student-documents'] as const,
    /** قوائم وثائق الطلاب مع الفلترة */
    lists: () => [...studentDocumentKeys.all, 'list'] as const,
    /** تفاصيل وثيقة طالب محدد */
    details: () => [...studentDocumentKeys.all, 'detail'] as const,
    /** مفتاح تفاصيل وثيقة معينة حسب المعرف */
    detail: (id: string) => [...studentDocumentKeys.details(), id] as const,
    /** وثائق طالب محدد */
    student: (studentId: string) => [...studentDocumentKeys.all, 'student', studentId] as const,
}

/**
 * خطاف لجلب قائمة وثائق طالب محدد.
 * 
 * @param {string} studentId - المعرف الفريد للطالب
 * @returns {UseQueryResult} كائن يحتوي على بيانات وثائق الطالب وحالة الاستعلام
 */
export const useStudentDocuments = (studentId: string) => {
    return useQuery({
        queryKey: studentDocumentKeys.student(studentId),
        queryFn: () => mockApi.getDocuments(studentId, 'student'),
        enabled: !!studentId,
    })
}

/**
 * خطاف لرفع وثيقة جديدة لطالب.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الرفع وحالة التنفيذ
 */
export const useUploadStudentDocument = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ studentId, file }: { studentId: string; file: File }) => 
            mockApi.uploadDocument(studentId, 'student', file),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: studentDocumentKeys.student(variables.studentId) })
            toast.success('تم رفع الوثيقة بنجاح')
        },
        onError: (error) => {
            toast.error('فشل في رفع الوثيقة')
        }
    })
}

/**
 * خطاف لحذف وثيقة لطالب.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الحذف وحالة التنفيذ
 */
export const useDeleteStudentDocument = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ documentId, studentId }: { documentId: string; studentId: string }) => 
            mockApi.deleteDocument(documentId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: studentDocumentKeys.student(variables.studentId) })
            toast.success('تم حذف الوثيقة بنجاح')
        },
        onError: (error) => {
            toast.error('فشل في حذف الوثيقة')
        }
    })
}