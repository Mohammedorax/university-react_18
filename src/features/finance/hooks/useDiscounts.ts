import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { mockApi, Discount } from '@/services/mockApi'

/**
 * مفاتيح الاستعلام الخاصة بالخصومات لإدارة التخزين المؤقت (Cache) في React Query.
 */
export const discountKeys = {
    /** جميع بيانات الخصومات */
    all: ['discounts'] as const,
    /** قوائم الخصومات */
    lists: () => [...discountKeys.all, 'list'] as const,
    /** تفاصيل خصم محدد */
    details: () => [...discountKeys.all, 'detail'] as const,
    /** مفتاح تفاصيل خصم معين حسب المعرف */
    detail: (id: string) => [...discountKeys.details(), id] as const,
}

/**
 * خطاف لجلب قائمة الخصومات والمنح الدراسية المتاحة في النظام.
 * 
 * @returns {UseQueryResult} كائن يحتوي على بيانات الخصومات وحالة التحميل
 */
export const useDiscounts = () => {
    return useQuery({
        queryKey: discountKeys.lists(),
        queryFn: () => mockApi.getDiscounts(),
        placeholderData: keepPreviousData,
    })
}

/**
 * خطاف لإضافة خصم أو منحة دراسية جديدة.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الإضافة وحالة التنفيذ
 */
export const useAddDiscount = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (newDiscount: Omit<Discount, 'id'>) => mockApi.addDiscount(newDiscount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: discountKeys.lists() })
        },
    })
}

/**
 * خطاف لتحديث بيانات خصم موجود مسبقاً.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة التحديث وحالة التنفيذ
 */
export const useUpdateDiscount = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Discount> }) => mockApi.updateDiscount(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: discountKeys.lists() })
            queryClient.invalidateQueries({ queryKey: discountKeys.detail(data.id) })
        },
    })
}

/**
 * خطاف لحذف خصم أو منحة من النظام بشكل نهائي.
 * 
 * @returns {UseMutationResult} كائن يحتوي على دالة الحذف وحالة التنفيذ
 */
export const useDeleteDiscount = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: string) => mockApi.deleteDiscount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: discountKeys.lists() })
        },
    })
}
