import { useEffect } from 'react'
import { useAddNotification } from './useNotifications'
import { useAuthState } from '@/features/auth/hooks/useAuth'

/**
 * خطاف مخصص لمحاكاة وصول إشعارات جديدة بشكل دوري.
 * يستخدم لأغراض العرض والتوضيح لمحاكاة نظام الـ WebSockets/Polling.
 * 
 * @hook useNotificationSimulator
 */
export const useNotificationSimulator = () => {
    const { user } = useAuthState()
    const addNotification = useAddNotification()

    useEffect(() => {
        if (!user) return

        // قائمة بالإشعارات المحتملة للمحاكاة
        const possibleNotifications = [
            {
                title: 'تحديث في المقررات',
                message: 'تم إضافة مادة جديدة متوافقة مع تخصصك.',
                type: 'info' as const,
                link: '/courses'
            },
            {
                title: 'تنبيه أكاديمي',
                message: 'تم رصد درجات الفصل الدراسي الحالي، يمكنك الاطلاع عليها الآن.',
                type: 'success' as const,
                link: '/grades'
            },
            {
                title: 'موعد هام',
                message: 'بقي يوم واحد فقط على انتهاء فترة الحذف والإضافة.',
                type: 'warning' as const,
                link: '/schedule'
            },
            {
                title: 'صيانة النظام',
                message: 'سيكون النظام متوقفاً للصيانة غداً من الساعة 2 صباحاً وحتى 4 صباحاً.',
                type: 'error' as const,
            }
        ]

        // وظيفة لإضافة إشعار عشوائي
        const triggerRandomNotification = () => {
            const randomNotif = possibleNotifications[Math.floor(Math.random() * possibleNotifications.length)]
            addNotification.mutate(randomNotif)
        }

        // محاكاة وصول أول إشعار بعد دقيقتين، ثم كل 5 دقائق
        const firstTimeout = setTimeout(triggerRandomNotification, 120000)
        const interval = setInterval(triggerRandomNotification, 300000)

        return () => {
            clearTimeout(firstTimeout)
            clearInterval(interval)
        }
    }, [user, addNotification])
}
