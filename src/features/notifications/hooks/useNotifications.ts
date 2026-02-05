import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi, Notification, NotificationType } from '@/services/mockApi'
import { toast } from 'sonner'

/**
 * مفاتيح الاستعلام الخاصة بالتنبيهات لإدارة الكاش
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
}

/**
 * خطاف مخصص لجلب قائمة التنبيهات مع التحديث التلقائي
 * 
 * @hook useNotifications
 * @returns {UseQueryResult} نتيجة الاستعلام التي تحتوي على التنبيهات وحالة التحميل
 */
export const useNotifications = () => {
    const queryClient = useQueryClient()

    // إعداد التحديث اللحظي (محاكاة WebSockets)
    useEffect(() => {
        const unsubscribe = mockApi.subscribeToNotifications((newNotification) => {
            // تحديث الكاش فوراً عند استلام تنبيه جديد
            queryClient.setQueryData(notificationKeys.lists(), (oldData: Notification[] | undefined) => {
                if (!oldData) return [newNotification]
                return [newNotification, ...oldData]
            })

            // عرض إشعار للمستخدم
            toast(newNotification.title, {
                description: newNotification.message,
                action: newNotification.link ? {
                    label: 'عرض',
                    onClick: () => window.location.href = newNotification.link!
                } : undefined
            })
        })

        return () => unsubscribe()
    }, [queryClient])

    return useQuery({
        queryKey: notificationKeys.lists(),
        queryFn: () => mockApi.getNotifications(),
        // لم نعد بحاجة للـ Polling القصير لأننا نستخدم التحديث اللحظي
        refetchInterval: 300000, // تحديث خلفي كل 5 دقائق كإجراء احتياطي
    })
}

/**
 * خطاف مخصص لتعليم تنبيه معين كمقروء
 * 
 * @hook useMarkNotificationAsRead
 * @returns {UseMutationResult} نتيجة عملية التحديث
 */
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: string) => mockApi.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        },
    })
}

/**
 * خطاف مخصص لتعليم جميع التنبيهات كمقروءة
 * 
 * @hook useMarkAllNotificationsAsRead
 * @returns {UseMutationResult} نتيجة عملية التحديث
 */
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: () => mockApi.markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        },
    })
}

/**
 * خطاف مخصص لحذف تنبيه معين
 * 
 * @hook useDeleteNotification
 * @returns {UseMutationResult} نتيجة عملية الحذف
 */
export const useDeleteNotification = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: string) => mockApi.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        },
    })
}

/**
 * خطاف مخصص لمسح كافة التنبيهات
 * 
 * @hook useClearAllNotifications
 * @returns {UseMutationResult} نتيجة عملية المسح
 */
export const useClearAllNotifications = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: () => mockApi.clearAllNotifications(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        },
    })
}

/**
 * خطاف مخصص لإضافة تنبيه جديد للنظام
 * 
 * @hook useAddNotification
 * @returns {UseMutationResult} نتيجة عملية الإضافة
 */
export const useAddNotification = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => 
            mockApi.addNotification(notification),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        },
    })
}
