import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useLogout, useAuthState } from '@/features/auth/hooks/useAuth'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { useTheme } from '@/components/ThemeProvider'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useNotificationSimulator } from '@/features/notifications/hooks/useNotificationSimulator'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    User,
    LogOut,
    Menu,
    Calendar,
    FileText,
    Package,
    Percent,
    Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DashboardLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuthState()
    const { data: systemSettings } = useSettings()
    const { logo } = useTheme()
    const logoutMutation = useLogout()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // تفعيل محاكي الإشعارات اللحظية
    useNotificationSimulator()

    const universityName = systemSettings?.universityName || 'الجامعة الافتراضية'

    const handleLogout = () => {
        logoutMutation.mutate()
    }

    const navItems = [
        {
            label: 'لوحة التحكم',
            href: `/${user?.role}/dashboard`,
            icon: LayoutDashboard,
            roles: ['student', 'teacher', 'admin', 'staff']
        },
        {
            label: 'إدارة الطلاب',
            href: '/admin/students',
            icon: GraduationCap,
            roles: ['admin', 'staff']
        },
        {
            label: 'إدارة المعلمين',
            href: '/admin/teachers',
            icon: User,
            roles: ['admin', 'staff']
        },
        {
            label: 'إدارة الموظفين',
            href: '/admin/staff',
            icon: User,
            roles: ['admin', 'staff']
        },
        {
            label: 'المقررات',
            href: '/courses',
            icon: BookOpen,
            roles: ['student', 'teacher', 'admin', 'staff']
        },
        {
            label: 'الدرجات',
            href: '/grades',
            icon: FileText,
            roles: ['student', 'teacher', 'admin']
        },
        {
            label: 'الجدول الدراسي',
            href: '/schedule',
            icon: Calendar,
            roles: ['student', 'teacher', 'admin']
        },
        {
            label: 'المخزون',
            href: '/inventory',
            icon: Package,
            roles: ['admin', 'staff']
        },
        {
            label: 'الخصومات والمنح',
            href: '/discounts',
            icon: Percent,
            roles: ['admin', 'staff']
        },
        {
            label: 'التقارير',
            href: '/reports',
            icon: FileText,
            roles: ['admin', 'staff']
        },
        {
            label: 'إعدادات النظام',
            href: '/settings',
            icon: Settings,
            roles: ['admin', 'staff']
        },
        {
            label: 'الملف الشخصي',
            href: '/profile',
            icon: User,
            roles: ['student', 'teacher', 'admin', 'staff']
        }
    ]

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role))

    return (
        <div className="min-h-screen bg-background">
            {/* Skip to Content Link */}
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
            >
                انتقل إلى المحتوى الرئيسي
            </a>

            {/* Mobile Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0" aria-label="فتح قائمة التنقل">
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="flex flex-col" aria-label="قائمة التنقل الرئيسية">
                        <nav className="grid gap-2 text-lg font-medium" aria-label="روابط التنقل">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-lg font-semibold"
                                aria-label={`الصفحة الرئيسية لـ ${universityName}`}
                            >
                                {logo ? (
                                    <img src={logo} alt={`شعار ${universityName}`} className="h-8 w-8 object-contain" />
                                ) : (
                                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                                )}
                                <span className="sr-only">{universityName}</span>
                            </Link>
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={location.pathname === item.href ? 'page' : undefined}
                                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-primary hover:bg-primary/5 ${location.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" aria-hidden="true" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="w-full flex-1">
                    <span className="text-lg font-semibold">{universityName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full" aria-label="فتح قائمة المستخدم">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar} alt={`صورة الملف الشخصي لـ ${user?.name}`} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>حسابي: {user?.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="ml-2 h-4 w-4" aria-hidden="true" />
                                الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending} className="text-destructive focus:text-destructive">
                                <LogOut className="ml-2 h-4 w-4" aria-hidden="true" />
                                {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex min-h-screen w-full">
                {/* Sidebar for Desktop */}
                <aside className="hidden border-l bg-muted/40 md:block md:w-[220px] lg:w-[280px]">
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                            <Link to="/" className="flex items-center gap-2 font-semibold" aria-label={`الصفحة الرئيسية لـ ${universityName}`}>
                                {logo ? (
                                    <img src={logo} alt={`شعار ${universityName}`} className="h-8 w-8 object-contain" />
                                ) : (
                                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                                )}
                                <span className="text-lg">{universityName}</span>
                            </Link>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <nav className="grid items-start px-2 text-sm font-medium lg:px-4" aria-label="قائمة التنقل الجانبية">
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        aria-current={location.pathname === item.href ? 'page' : undefined}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-primary/5 ${location.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" aria-hidden="true" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="mt-auto p-4 border-t">
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                onClick={handleLogout} 
                                disabled={logoutMutation.isPending}
                                aria-label="تسجيل الخروج من النظام"
                            >
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6" tabIndex={-1}>
                    <Breadcrumbs />
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
