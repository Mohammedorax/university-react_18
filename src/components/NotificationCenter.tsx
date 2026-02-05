import { Bell, Check, Trash2, X } from 'lucide-react'
import { 
    useNotifications, 
    useMarkNotificationAsRead, 
    useMarkAllNotificationsAsRead, 
    useDeleteNotification, 
    useClearAllNotifications 
} from '@/features/notifications/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { arSA } from 'date-fns/locale'

/**
 * مركز التنبيهات - مكون يعرض قائمة الإشعارات الواردة للمستخدم مع إمكانيات الإدارة.
 * 
 * المميزات:
 * - عرض الإشعارات اللحظية (عبر useNotifications).
 * - تعليم الإشعارات كمقروءة (فردياً أو جماعياً).
 * - حذف الإشعارات.
 * - التصفح السريع للروابط المرتبطة بالإشعارات.
 * - دعم كامل للغة العربية وتنسيق الوقت النسبي.
 * 
 * @component
 * @returns {JSX.Element} مكون مركز التنبيهات في شريط الأدوات
 */
export function NotificationCenter() {
    const { data: notifications = [], isLoading } = useNotifications()
    const markAsReadMutation = useMarkNotificationAsRead()
    const markAllAsReadMutation = useMarkAllNotificationsAsRead()
    const deleteNotificationMutation = useDeleteNotification()
    const clearAllNotificationsMutation = useClearAllNotifications()

    const unreadCount = notifications.filter(n => !n.read).length

    const getIconColor = (type: string) => {
        switch (type) {
            case 'info': return 'text-primary bg-primary/10'
            case 'success': return 'text-primary bg-primary/20'
            case 'warning': return 'text-primary/70 bg-primary/5'
            case 'error': return 'text-destructive bg-destructive/10'
            default: return 'text-muted-foreground bg-muted'
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`الإشعارات (${unreadCount} غير مقروءة)`}>
                    <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96" aria-label="قائمة الإشعارات">
                <div className="flex items-center justify-between p-4 pb-2">
                    <DropdownMenuLabel className="text-base font-semibold">الإشعارات</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-auto py-1 px-2"
                            onClick={() => markAllAsReadMutation.mutate()}
                            aria-label="تحديد جميع الإشعارات كمقروءة"
                        >
                            <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]" role="region" aria-label="قائمة الإشعارات المفصلة">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full py-8">
                            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="p-2 space-y-2">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-3 rounded-lg transition-colors relative group",
                                        notification.read ? "bg-background hover:bg-muted/50" : "bg-muted/30 border-r-2 border-primary"
                                    )}
                                    role="article"
                                    aria-label={`إشعار: ${notification.title}. المحتوى: ${notification.message}`}
                                >
                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", getIconColor(notification.type))} aria-hidden="true">
                                        <Bell className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <p className={cn("text-sm font-medium leading-none", !notification.read && "font-bold")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap" aria-label={`توقيت الإشعار: ${formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: arSA })}`}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: arSA })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotificationMutation.mutate(notification.id)
                                        }}
                                        aria-label={`حذف إشعار ${notification.title}`}
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" aria-hidden="true" />
                                    </Button>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-muted">
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-xs font-bold text-destructive hover:bg-destructive/5 h-10 rounded-xl"
                                    onClick={() => clearAllNotificationsMutation.mutate()}
                                    aria-label="مسح كافة الإشعارات"
                                >
                                    مسح كافة الإشعارات
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Bell className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                            </div>
                            <p className="font-bold text-foreground">لا توجد إشعارات</p>
                            <p className="text-xs text-muted-foreground mt-1">أنت مطلع على كل شيء! لا توجد تنبيهات جديدة حالياً.</p>
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button 
                                variant="outline" 
                                className="w-full text-xs h-8 gap-2"
                                onClick={() => clearAllNotificationsMutation.mutate()}
                                aria-label="مسح جميع الإشعارات من القائمة"
                            >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                                مسح جميع الإشعارات
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
