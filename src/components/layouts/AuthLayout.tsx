import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

/**
 * تخطيط الصفحات المصادقة مثل تسجيل الدخول وإعادة تعيين كلمة المرور.
 * يعرض شعار الجامعة ويحتوي على منطقة للنماذج.
 */
const AuthLayout = () => {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4" dir="rtl">
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-bold"
            >
                انتقل إلى المحتوى الرئيسي
            </a>
            <div className="mb-8 flex items-center gap-2" role="banner">
                <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
                <span className="text-2xl font-bold text-primary">نظام الجامعة</span>
            </div>
            <div className="w-full max-w-md" id="main-content">
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout
