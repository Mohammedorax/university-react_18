import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'destructive' | 'default'
    onConfirm: () => void
}

/**
 * @component ConfirmDialog
 * @description مربع حوار تأكيد عملية يعرض رسالة تحذيرية مع خيارات التأكيد والإلغاء.
 * يُستخدم بديلاً عن window.confirm لتجربة مستخدم أفضل.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title = 'تأكيد العملية',
    description,
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    variant = 'destructive',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent dir="rtl" className="rounded-2xl border-none shadow-2xl max-w-md">
                <AlertDialogHeader className="text-right">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-xl ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            <AlertTriangle size={20} aria-hidden="true" />
                        </div>
                        <AlertDialogTitle className="text-xl font-black">{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base font-medium leading-relaxed text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-3 sm:flex-row-reverse">
                    <AlertDialogCancel className="rounded-xl font-bold">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`rounded-xl font-bold ${variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
