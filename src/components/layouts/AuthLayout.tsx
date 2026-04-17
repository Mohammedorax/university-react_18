import { Outlet } from 'react-router-dom'

/**
 * تخطيط صفحات المصادقة (تسجيل الدخول، التسجيل، …).
 * يعرض المحتوى فقط دون شريط علوي مكرر؛ الشعار والعناوين داخل كل صفحة.
 */
const AuthLayout = () => {
    return (
        <div
            className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-muted/40 px-3 py-4 sm:p-6"
            dir="rtl"
        >
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:font-bold"
            >
                انتقل إلى المحتوى الرئيسي
            </a>
            <div className="w-full max-w-sm sm:max-w-md" id="main-content">
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout
