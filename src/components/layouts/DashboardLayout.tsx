import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useLogout, useAuthState } from '@/features/auth/hooks/useAuth'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { UniversityLogo } from '@/components/UniversityLogo'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useNotificationSimulator } from '@/features/notifications/hooks/useNotificationSimulator'
import { useAutoLogout } from '@/hooks/useAutoLogout'
import { AutoLogoutWarning } from '@/components/AutoLogoutWarning'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    User,
    LogOut,
    Calendar,
    FileText,
    Package,
    Percent,
    Settings,
    ClipboardCheck,
    ScrollText,
    Menu,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles: string[]
}

const NAV_ITEMS: NavItem[] = [
    { label: 'لوحة التحكم', href: 'dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin', 'staff'] },
    { label: 'إدارة الطلاب', href: '/admin/students', icon: GraduationCap, roles: ['admin', 'staff'] },
    { label: 'إدارة المعلمين', href: '/admin/teachers', icon: User, roles: ['admin', 'staff'] },
    { label: 'إدارة الموظفين', href: '/admin/staff', icon: User, roles: ['admin'] },
    { label: 'المقررات', href: '/courses', icon: BookOpen, roles: ['student', 'teacher', 'admin', 'staff'] },
    { label: 'الدرجات', href: '/grades', icon: FileText, roles: ['student', 'teacher', 'admin'] },
    { label: 'الجدول الدراسي', href: '/schedule', icon: Calendar, roles: ['student', 'teacher', 'admin'] },
    { label: 'المخزون', href: '/inventory', icon: Package, roles: ['admin', 'staff'] },
    { label: 'الخصومات والمنح', href: '/discounts', icon: Percent, roles: ['admin', 'staff'] },
    { label: 'التقارير', href: '/reports', icon: ScrollText, roles: ['admin'] },
    { label: 'الحضور والغياب', href: '/teacher/attendance', icon: ClipboardCheck, roles: ['teacher'] },
    { label: 'سجل التدقيق', href: '/admin/logs', icon: ClipboardCheck, roles: ['admin'] },
    { label: 'إعدادات النظام', href: '/settings', icon: Settings, roles: ['admin'] },
    { label: 'هيكلة المشروع', href: '/project-structure', icon: FileText, roles: ['admin'] },
    { label: 'الملف الشخصي', href: '/profile', icon: User, roles: ['student', 'teacher', 'admin', 'staff'] },
]

/** مكوّن انتقال الصفحات — يُطبّق تلاشياً وانزلاقاً خفيفاً عند كل تغيير مسار */
function PageTransition({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.classList.remove('page-enter-active')
        void el.offsetWidth // force reflow
        el.classList.add('page-enter-active')
    }, [location.pathname])

    return (
        <div
            ref={ref}
            className="page-enter p-3 sm:p-6 lg:p-8"
            style={{ willChange: 'opacity, transform' }}
        >
            {children}
        </div>
    )
}

const DashboardLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuthState()
    const { data: systemSettings } = useSettings()
    const logoutMutation = useLogout()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useNotificationSimulator()
    const { showWarning, remainingTime, continueSession, logout } = useAutoLogout()

    // أغلق الشريط الجانبي تلقائياً عند تغيير الصفحة على الجوال
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    const universityName = systemSettings?.universityName || 'جامعة العرب'
    const direction = systemSettings?.direction || 'rtl'
    const isRTL = direction === 'rtl'

    const handleLogout = () => logoutMutation.mutate()

    const filteredNavItems = NAV_ITEMS
        .filter((item) => !user || item.roles.includes(user.role))
        .map((item) => ({
            ...item,
            href: item.href === 'dashboard' ? `/${user?.role}/dashboard` : item.href,
        }))

    const sidebarContent = (
        <div className="flex h-full min-h-0 flex-1 flex-col bg-sidebar text-sidebar-foreground">
            {/* رأس الشريط الجانبي */}
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3 sm:h-16 sm:gap-3 sm:px-4">
                <Link
                    to="/"
                    className="flex min-w-0 flex-1 items-center gap-2 font-semibold transition-opacity hover:opacity-80 sm:gap-3"
                    aria-label={`الصفحة الرئيسية لـ ${universityName}`}
                >
                    <UniversityLogo className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9" />
                    <span className="min-w-0 truncate text-sm font-bold leading-tight text-sidebar-foreground sm:text-base">
                        {universityName}
                    </span>
                </Link>
                {/* زر إغلاق - يظهر فقط على الجوال */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 shrink-0 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-hover-bg"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="إغلاق القائمة"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3 sm:py-4" aria-label="قائمة التنقل الجانبية">
                <ul className="space-y-0.5 sm:space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        'group flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:gap-3 sm:px-3 sm:py-2.5',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                                        isActive
                                            ? 'bg-sidebar-active-bg text-sidebar-active-foreground shadow-sm'
                                            : 'text-sidebar-foreground hover:bg-sidebar-hover-bg hover:text-sidebar-foreground'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'h-5 w-5 shrink-0',
                                            isActive
                                                ? 'text-sidebar-active-foreground'
                                                : 'text-sidebar-foreground/70 group-hover:text-sidebar-primary'
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0 flex-1 truncate text-right">{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="shrink-0 border-t border-sidebar-border p-2 sm:p-3">
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-sidebar-accent/40 px-2 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-sidebar-primary/20">
                        <AvatarImage src={user?.avatar} alt={user?.name ? `صورة ${user.name}` : undefined} />
                        <AvatarFallback className="bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                            {user?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-right">
                        <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name || '...'}</p>
                        <p className="truncate text-xs text-sidebar-foreground/60">{user?.email || ''}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="h-10 w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    aria-label="تسجيل الخروج من النظام"
                >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate text-sm font-medium">
                        {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                    </span>
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-[100dvh] min-w-0 bg-background" dir={direction}>
            <a
                href="#main-content"
                className={cn(
                    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground',
                    isRTL ? 'focus:left-4' : 'focus:right-4'
                )}
            >
                انتقل إلى المحتوى الرئيسي
            </a>

            {/* طبقة تعتيم الخلفية — جوال فقط */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* الشريط الجانبي */}
            <aside
                className={cn(
                    // ديسكتوب: ثابت دائماً، جوال: شرائح من الجانب
                    'fixed inset-y-0 z-50 flex flex-col border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300 ease-in-out',
                    'md:relative md:translate-x-0 md:w-56 lg:w-64 md:shadow-md md:z-auto md:transition-none',
                    'w-72',
                    // اتجاه السحب حسب RTL/LTR
                    isRTL
                        ? cn('right-0 border-l', sidebarOpen ? 'translate-x-0' : 'translate-x-full')
                        : cn('left-0 border-r', sidebarOpen ? 'translate-x-0' : '-translate-x-full'),
                )}
                aria-label="الشريط الجانبي الرئيسي"
            >
                {sidebarContent}
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {/* شريط العنوان العلوي */}
                <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:h-16 sm:gap-3 sm:px-6">
                    {/* زر الهمبرغر — جوال فقط */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-9 w-9 shrink-0 rounded-xl"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="فتح القائمة الجانبية"
                        aria-expanded={sidebarOpen}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                        <Breadcrumbs />
                    </div>

                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <NotificationCenter />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full" aria-label="فتح قائمة المستخدم">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} alt={user?.name ? `صورة الملف الشخصي لـ ${user.name}` : undefined} />
                                        <AvatarFallback>{user?.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'end' : 'start'}>
                                <DropdownMenuLabel>حسابي: {user?.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    <User className="ms-2 h-4 w-4" aria-hidden="true" />
                                    الملف الشخصي
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="ms-2 h-4 w-4" aria-hidden="true" />
                                    {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-x-hidden" tabIndex={-1}>
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>

            <AutoLogoutWarning
                isOpen={showWarning}
                remainingTime={remainingTime}
                onContinue={continueSession}
                onLogout={logout}
            />
        </div>
    )
}

export default DashboardLayout
