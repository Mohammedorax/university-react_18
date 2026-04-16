import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as mockApi } from '@/services/api';
import { toast } from 'sonner';

/**
 * @hook useEntityDocuments
 * @description خطاف موحد لإدارة الوثائق لمختلف الكيانات (طلاب، معلمون، مقررات).
 * 
 * @param entityId - المعرف الفريد للكيان
 * @param entityType - نوع الكيان ('student' | 'teacher' | 'course' | 'staff')
 */
export function useEntityDocuments(entityId: string, entityType: 'student' | 'teacher' | 'course' | 'staff') {
  const queryClient = useQueryClient();
  const queryKey = ['documents', entityType, entityId];

  const documentsQuery = useQuery({
    queryKey,
    queryFn: () => mockApi.getDocuments(entityId, entityType),
    enabled: !!entityId,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => mockApi.uploadDocument(entityId, entityType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('تم رفع المستند بنجاح');
    },
    onError: () => {
      toast.error('فشل رفع المستند');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => mockApi.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('تم حذف المستند بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف المستند');
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isUploading: uploadMutation.isPending,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
  };
}
