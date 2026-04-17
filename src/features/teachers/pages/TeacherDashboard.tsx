import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState, useLogout } from '@/features/auth/hooks/useAuth'
import { useCourses } from '@/features/courses/hooks/useCourses'
import { Course } from '@/features/courses/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddCourseDialog } from '@/features/courses/components/AddCourseDialog'
import { EditCourseDialog } from '@/features/courses/components/EditCourseDialog'
import { CourseStudentsDialog } from '@/features/courses/components/CourseStudentsDialog'
import { TeacherStudentsDialog } from '@/features/teachers/components/TeacherStudentsDialog'
import {
    BookOpen,
    Users,
    GraduationCap,
    Clock,
    Calendar,
    TrendingUp,
    Briefcase,
    Search,
    Filter,
    Bell,
    Settings,
    Mail,
    Loader2,
    LogOut,
    LayoutDashboard,
    RefreshCcw,
    UserCheck,
    LayoutGrid,
    List
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { ViewModeButton } from '@/components/ViewModeButton'

/**
 * @page TeacherDashboard
 * @description لوحة تحكم الأستاذ الرئيسية.
 * توفر نظرة عامة على المقررات التي يدرسها، إحصائيات الطلاب، والجداول الدراسية.
 * تتيح للأستاذ البحث في مقرراته، تصفيتها، وإدارة درجات الطلاب وحضورهم.
 * 
 * @returns {JSX.Element} صفحة لوحة التحكم للأستاذ
 */
export default function TeacherDashboard() {
    const navigate = useNavigate()
    const { user } = useAuthState()
    const { data: coursesResponse, isLoading } = useCourses()
    const courses = useMemo(() => coursesResponse?.items || [], [coursesResponse])
    const logoutMutation = useLogout()
    const queryClient = useQueryClient()

    // حالة البحث والتصفية
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const [selectedDepartment, setSelectedDepartment] = useState('all')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')

    /**
     * معالجة تحديث البيانات
     */
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        try {
            await queryClient.invalidateQueries({ queryKey: ['courses'] })
            toast.success('تم تحديث البيانات بنجاح', {
                description: 'تمت مزامنة بيانات المقررات والطلاب.',
            })
        } catch (error) {
            toast.error('فشل تحديث البيانات', {
                description: 'يرجى المحاولة مرة أخرى لاحقاً.',
            })
        } finally {
            setIsRefreshing(false)
        }
    }, [queryClient])

    /**
     * معالجة عملية تسجيل الخروج
     */
    const handleLogout = () => {
        logoutMutation.mutate()
    }

    // تصفية المقررات التي يدرسها هذا المدرس
    const teacherCourses = useMemo(() =>
        courses.filter((course: Course) => course.teacher_id === user?.id),
        [courses, user?.id]
    )

    // Filter courses based on search and department
    const filteredCourses = useMemo(() =>
        teacherCourses.filter((course: Course) => {
            const matchesSearch = debouncedSearchTerm === '' ||
                course.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                course.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

            const matchesDepartment = selectedDepartment === 'all' ||
                course.department === selectedDepartment

            return matchesSearch && matchesDepartment
        }),
        [teacherCourses, debouncedSearchTerm, selectedDepartment]
    )

    // Get unique departments for filter
    const departments = useMemo(() =>
        Array.from(new Set(teacherCourses.map((c: Course) => c.department))),
        [teacherCourses]
    )

    // Calculate statistics
    const stats = useMemo(() => {
        const totalStudents = teacherCourses.reduce((sum: number, course: Course) => sum + course.enrolled_students, 0)
        const averageStudents = teacherCourses.length > 0 ? Math.round(totalStudents / teacherCourses.length) : 0
        const totalCapacity = teacherCourses.reduce((sum: number, course: Course) => sum + course.max_students, 0)
        const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

        return { totalStudents, averageStudents, totalCapacity, occupancyRate }
    }, [teacherCourses])

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10">
                <div className="absolute top-0 right-0 p-10 opacity-5" aria-hidden="true">
                    <Briefcase size={300} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-3xl border border-primary-foreground/20 shadow-2xl" aria-hidden="true">
                                <Briefcase size={48} className="text-primary-foreground" />
                            </div>
                            <div className="text-center md:text-right">
                                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">لوحة تحكم الأستاذ</h1>
                                <p className="-sm sm:text-lg max-w-xl">مرحباً، الدكتور {user?.name} | {user?.department}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm rounded-xl"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                aria-label="تحديث البيانات"
                            >
                                <RefreshCcw size={20} className={cn(isRefreshing && "animate-spin")} aria-hidden="true" />
                            </Button>
                            <Button variant="secondary" size="icon" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm rounded-xl" aria-label="التنبيهات">
                                <Bell size={20} aria-hidden="true" />
                            </Button>
                            <Button variant="secondary" size="icon" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm rounded-xl" onClick={() => navigate('/settings')} aria-label="الإعدادات">
                                <Settings size={20} aria-hidden="true" />
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleLogout}
                                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-2xl px-6 py-6 h-auto shadow-xl transition-all hover:scale-[1.02]"
                                disabled={logoutMutation.isPending}
                                aria-label="تسجيل الخروج من النظام"
                            >
                                {logoutMutation.isPending ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    <LogOut className="ml-2 h-4 w-4" aria-hidden="true" />
                                )}
                                <span className="hidden sm:inline ml-2">تسجيل الخروج</span>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8" role="region" aria-label="إحصائيات سريعة">
                        <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10 flex items-center gap-5 hover:bg-primary-foreground/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                            <div className="p-4 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-primary-foreground/70 font-bold uppercase tracking-wider mb-1">المقررات المدرسة</p>
                                <p className="text-3xl font-black">{teacherCourses.length}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10 flex items-center gap-5 hover:bg-primary-foreground/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                            <div className="p-4 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <Users size={28} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-primary-foreground/70 font-bold uppercase tracking-wider mb-1">إجمالي الطلاب</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-black">{stats.totalStudents}</p>
                                    <TeacherStudentsDialog teacherCourses={teacherCourses} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10 flex items-center gap-5 hover:bg-primary-foreground/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                            <div className="p-4 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-primary-foreground/70 font-bold uppercase tracking-wider mb-1">متوسط الطلاب</p>
                                <p className="text-3xl font-black">{stats.averageStudents}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10 flex items-center gap-5 hover:bg-primary-foreground/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                            <div className="p-4 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <LayoutDashboard size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-primary-foreground/70 font-bold uppercase tracking-wider mb-1">نسبة الإشغال</p>
                                <p className="text-3xl font-black">{stats.occupancyRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-10 sm:-mt-16 relative z-20 space-y-8">
                {/* Search and Filter Card */}
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="أدوات البحث والتصفية">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالمقرر أو الرمز..."
                                    className="w-full pl-10 pr-12 py-3.5 border border-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 transition-all focus:bg-background font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="البحث عن مقرر دراسي"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <Filter className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                <select
                                    className="w-full lg:w-auto px-6 py-3.5 border border-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 transition-all focus:bg-background font-medium cursor-pointer"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    aria-label="تصفية حسب القسم"
                                >
                                    <option value="all">جميع الأقسام</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center bg-muted/50 rounded-xl p-1 h-12 border border-muted" role="group" aria-label="وضع العرض">
                                <ViewModeButton active={viewMode === 'table'} onClick={() => setViewMode('table')} icon={List} label="جدول" />
                                <ViewModeButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} label="شبكة" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                <div className="space-y-6" role="region" aria-label="قائمة المقررات الدراسية">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl" aria-hidden="true">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground">المقررات الدراسية</h2>
                                <p className="text-sm text-muted-foreground font-medium">إدارة المحتوى الأكاديمي والطلاب</p>
                            </div>
                        </div>
                        <AddCourseDialog />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-80 rounded-3xl" />
                            ))}
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
                            {filteredCourses.map((course) => (
                                <Card key={course.id} className={cn("overflow-hidden hover:shadow-2xl transition-all duration-300 border-none bg-card group relative", viewMode === 'table' && "rounded-2xl")}>
                                    <div className="absolute top-0 right-0 w-2 h-full bg-primary/10 group-hover:bg-primary transition-colors duration-500" />
                                    <CardHeader className="pb-3 p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl font-black line-clamp-1 group-hover:text-primary transition-colors">{course.name}</CardTitle>
                                                <Badge variant="outline" className="mt-2 font-mono bg-primary/5 text-primary border-primary/20 px-3">{course.code}</Badge>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold px-3 py-1 rounded-lg">{course.credits} ساعات</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm font-bold">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Users size={18} className="text-primary" />
                                                    الطلاب المسجلين
                                                </span>
                                                <span className={cn(
                                                    "font-black px-3 py-1 rounded-lg",
                                                    course.enrolled_students >= course.max_students ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                                                )}>
                                                    {course.enrolled_students} / {course.max_students}
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000 rounded-full",
                                                        (course.enrolled_students / course.max_students) > 0.9 ? 'bg-destructive' : 'bg-primary'
                                                    )}
                                                    style={{ width: `${Math.min((course.enrolled_students / course.max_students) * 100, 100)}%` }}
                                                />
                                            </div>

                                            {course.schedule && course.schedule.length > 0 && (
                                                <div className="bg-muted/50 p-4 rounded-2xl space-y-3 border border-transparent group-hover:border-muted transition-colors">
                                                    {course.schedule.map((schedule: { day: string; start_time: string; end_time: string; room: string }, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs">
                                                            <span className="flex items-center gap-2 font-bold text-foreground">
                                                                <Calendar size={14} className="text-primary" />
                                                                {schedule.day}
                                                            </span>
                                                            <span className="text-muted-foreground font-medium">{schedule.start_time} - {schedule.end_time}</span>
                                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono border-primary/10 bg-card">{schedule.room}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <CourseStudentsDialog course={course} />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate('/teacher/attendance')}
                                                className="flex-1 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-xl font-bold h-10 transition-all"
                                            >
                                                <UserCheck className="ml-2 h-4 w-4" />
                                                التحضير
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate('/grades')}
                                                className="flex-1 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-xl font-bold h-10 transition-all"
                                            >
                                                <TrendingUp className="ml-2 h-4 w-4" />
                                                الدرجات
                                            </Button>
                                            <EditCourseDialog course={course} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12">
                            <EmptyState
                                icon={BookOpen}
                                title="لا توجد مقررات"
                                description="لم يتم العثور على مقررات دراسية تطابق معايير البحث الحالية أو أنك لم تقم بإضافة مقررات بعد."
                                actionLabel="إعادة تعيين البحث"
                                onAction={() => {
                                    setSearchTerm('')
                                    setSelectedDepartment('all')
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
