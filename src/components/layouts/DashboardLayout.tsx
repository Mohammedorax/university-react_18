import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useLogout, useAuthState } from '@/features/auth/hooks/useAuth'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { useTheme } from '@/components/ThemeProvider'
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
    ScrollText
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

/**
 * TypeScript interface for navigation menu items.
 * Defines the structure for each navigation item in the dashboard sidebar.
 */
interface NavItem {
    /** Display label for the navigation item */
    label: string
    /** Route path for navigation */
    href: string
    /** Icon component to display */
    icon: React.ComponentType<{ className?: string }>
    /** Array of user roles that can access this navigation item */
    roles: string[]
}

/**
 * Main dashboard layout component for the application.
 * Contains a sidebar for navigation and hamburger menu for mobile devices.
 * Supports different user roles and shows navigation items based on role permissions.
 *
 * @returns {JSX.Element} The dashboard layout with sidebar, header, and main content area
 */
const DashboardLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuthState()
    const { data: systemSettings } = useSettings()
    const { logo } = useTheme()
    const logoutMutation = useLogout()

    useNotificationSimulator()

    const { showWarning, remainingTime, continueSession, logout } = useAutoLogout()

    const universityName = systemSettings?.universityName || 'جامعة العرب'
    const direction = systemSettings?.direction || 'rtl'
    const isRTL = direction === 'rtl'

    const handleLogout = () => {
        logoutMutation.mutate()
    }

    // Fix #8: TypeScript type for navItems
    const navItems: NavItem[] = [
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
            icon: ScrollText,
            roles: ['admin']
        },
        {
            label: 'سجل التدقيق',
            href: '/admin/logs',
            icon: ClipboardCheck,
            roles: ['admin']
        },
        {
            label: 'الحضور والغياب',
            href: '/teacher/attendance',
            icon: ClipboardCheck,
            roles: ['teacher']
        },
        {
            label: 'إعدادات النظام',
            href: '/settings',
            icon: Settings,
            roles: ['admin']
        },
        {
            label: 'هيكيلة المشروع',
            href: '/project-structure',
            icon: FileText,
            roles: ['admin']
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
        <div className="min-h-screen bg-background" dir={direction}>
            {/* Skip to Content Link */}
            <a 
                href="#main-content" 
                className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg ${isRTL ? 'focus:left-4' : 'focus:right-4'}`}
            >
                انتقل إلى المحتوى الرئيسي
            </a>

            <div className={`flex min-h-screen w-full ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Sidebar - always visible, compact on small screens and full on large screens */}
                <aside className={`sticky top-0 z-20 h-screen w-[78px] flex-shrink-0 border-b bg-sidebar-background text-sidebar-foreground sm:w-[88px] md:w-[220px] lg:w-[280px] shadow-sidebar ${isRTL ? 'border-l' : 'border-r'} transition-colors duration-300`}>
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        <div className={`flex h-14 items-center justify-center border-b border-sidebar-border/50 px-3 lg:h-[60px] lg:px-6 ${isRTL ? 'md:justify-end md:px-4' : 'md:justify-start md:px-4'} bg-gradient-to-r from-sidebar-primary/5 to-transparent`}>
                            <Link to="/" className={`flex items-center gap-2 font-semibold transition-all hover:scale-105 ${isRTL ? 'md:flex-row-reverse' : ''}`} aria-label={`الصفحة الرئيسية لـ ${universityName}`}>
                                {logo ? (
                                    <img src={logo} alt={`شعار ${universityName}`} className="h-8 w-8 object-contain drop-shadow-md" />
                                ) : (
                                    <GraduationCap className="h-6 w-6 text-sidebar-primary drop-shadow-sm" aria-hidden="true" />
                                )}
                                <span className={`hidden text-lg font-bold md:inline ${isRTL ? 'me-3' : 'ms-3'} bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent`}>{universityName}</span>
                            </Link>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <nav className="grid items-start gap-1 px-2 py-2 text-sm font-medium lg:px-3 lg:py-3" aria-label="قائمة التنقل الجانبية">
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        aria-current={location.pathname === item.href ? 'page' : undefined}
                                        title={item.label}
                                        className={`group flex items-center justify-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 md:px-4 md:py-2.5 
                                        ${location.pathname === item.href 
                                            ? 'bg-sidebar-active-bg text-sidebar-active-foreground shadow-md font-semibold' 
                                            : 'text-sidebar-foreground/80 hover:bg-sidebar-hover-bg hover:text-sidebar-foreground hover:shadow-sm'
                                        }
                                        ${isRTL ? 'md:flex-row-reverse md:text-right' : 'md:justify-start'}
                                        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring`}
                                    >
                                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                                            location.pathname === item.href 
                                                ? 'text-sidebar-active-foreground scale-110' 
                                                : 'text-sidebar-foreground/70 group-hover:text-sidebar-primary group-hover:scale-105'
                                        } ${isRTL ? 'md:me-0 md:ms-3' : 'md:ms-0 md:me-3'}`} aria-hidden="true" />
                                        <span className="hidden md:inline flex-1 truncate font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="mt-auto border-t border-sidebar-border/50 bg-gradient-to-t from-sidebar-accent/30 to-transparent p-3 md:p-4">
                            <div className={`mb-3 flex items-center justify-center gap-3 rounded-lg bg-sidebar-accent/50 p-2 md:px-1 ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
                                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-sidebar-primary/20 shadow-md">
                                    <AvatarImage src={user?.avatar} alt={`صورة ${user?.name}`} />
                                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className={`hidden min-w-0 flex-1 md:block ${isRTL ? 'text-right me-3' : 'text-left ms-3'}`}>
                                    <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
                                    <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className={`w-full justify-center gap-3 text-destructive transition-all hover:bg-destructive/10 hover:text-destructive hover:shadow-sm md:px-4 md:py-2.5 ${isRTL ? 'md:flex-row-reverse md:text-right' : 'md:justify-start'} active:scale-[0.98]`}
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                aria-label="تسجيل الخروج من النظام"
                                title="تسجيل الخروج"
                            >
                                <LogOut className={`h-4 w-4 flex-shrink-0 transition-transform ${isRTL ? 'md:me-0 md:ms-3' : 'md:ms-0 md:me-3'} hover:scale-110`} aria-hidden="true" />
                                <span className="hidden md:inline flex-1 truncate font-medium">
                                    {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                                </span>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content - flex layout handles sidebar offset */}
                <main id="main-content" className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6" tabIndex={-1}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Breadcrumbs />
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
                                <DropdownMenuContent align={isRTL ? 'end' : 'start'}>
                                    <DropdownMenuLabel>حسابي: {user?.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="ms-2 h-4 w-4" aria-hidden="true" />
                                        الملف الشخصي
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending} className="text-destructive focus:text-destructive">
                                        <LogOut className="ms-2 h-4 w-4" aria-hidden="true" />
                                        {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <Outlet />
                </main>
            </div>

            {/* نافذة تنبيه تسجيل الخروج التلقائي */}
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
