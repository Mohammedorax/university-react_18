import { useMemo, useState, useCallback } from 'react'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { useCourses, useEnrolledCourses } from '@/features/courses/hooks/useCourses'
import { Course } from '@/features/courses/types'

type ScheduleEntry = {
    day: string
    start_time: string
    end_time: string
    room: string
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Clock, MapPin, Calendar, BookOpen,
    GraduationCap, Printer,
    Info, RefreshCcw, Search,
    AlertCircle, Star, Sun, Moon, Coffee
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

/** تقويم الجامعة - الأحداث الأكاديمية الرئيسية */
const UNIVERSITY_CALENDAR = [
    { id: 1, title: 'بداية الفصل الدراسي الأول', date: '2024-09-01', type: 'semester', icon: Star },
    { id: 2, title: 'الإجازة الوطنية', date: '2024-09-23', type: 'holiday', icon: Sun },
    { id: 3, title: 'نهاية التسجيل والإضافة والحذف', date: '2024-09-28', type: 'deadline', icon: AlertCircle },
    { id: 4, title: 'إجازة منتصف الفصل', date: '2024-11-05', type: 'holiday', icon: Coffee },
    { id: 5, title: 'اختبارات نهاية الفصل الأول', date: '2024-12-21', type: 'exam', icon: Moon },
    { id: 6, title: 'إجازة الفصل الدراسي', date: '2025-01-04', type: 'holiday', icon: Sun },
    { id: 7, title: 'بداية الفصل الدراسي الثاني', date: '2025-01-26', type: 'semester', icon: Star },
    { id: 8, title: 'نهاية التسجيل والإضافة والحذف', date: '2025-02-08', type: 'deadline', icon: AlertCircle },
    { id: 9, title: 'إجازة منتصف الفصل الثاني', date: '2025-03-25', type: 'holiday', icon: Coffee },
    { id: 10, title: 'اختبارات نهاية الفصل الثاني', date: '2025-05-17', type: 'exam', icon: Moon },
    { id: 11, title: 'إجازة الصيف', date: '2025-06-01', type: 'holiday', icon: Sun },
    { id: 12, title: 'بداية الفصل الصيفي', date: '2025-07-01', type: 'semester', icon: Star },
]

type ViewTab = 'week' | 'day' | 'calendar'

/**
 * @page SchedulePage
 * @description صفحة الجدول الدراسي الأسبوعي.
 */
const SchedulePage = () => {
    const { user } = useAuthState()
    const { data: enrolledCourses = [], isLoading: isLoadingEnrolled, refetch: refetchEnrolled, error: enrolledError } = useEnrolledCourses(user?.id || '')
    const { data: coursesResponse, isLoading: isLoadingCourses, refetch: refetchCourses, error: coursesError } = useCourses()
    const allCourses = useMemo(() => coursesResponse?.items || [], [coursesResponse])

    const [selectedDay, setSelectedDay] = useState<string>(DAYS[0])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<ViewTab>('week')

    const isLoading = user?.role === 'student' ? isLoadingEnrolled : isLoadingCourses
    const error = user?.role === 'student' ? enrolledError : coursesError

    const handleRefresh = async () => {
        try {
            if (user?.role === 'student') await refetchEnrolled()
            else await refetchCourses()
            toast.success('تم تحديث الجدول الدراسي بنجاح')
        } catch {
            toast.error('حدث خطأ أثناء تحديث الجدول')
        }
    }

    const userCourses = useMemo(() => {
        if (!user) return []
        let courses: Course[] = []
        if (user.role === 'student') courses = enrolledCourses
        else if (user.role === 'teacher') courses = allCourses.filter(c => c.teacher_id === user.id)
        else courses = allCourses

        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            courses = courses.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.code.toLowerCase().includes(lower)
            )
        }
        return courses
    }, [user, enrolledCourses, allCourses, searchTerm])

    const scheduleGrid = useMemo(() => {
        const grid: Record<string, any[]> = {}
        userCourses.forEach(course => {
            course.schedule?.forEach((s: ScheduleEntry) => {
                const start = s.start_time.length === 4 ? `0${s.start_time}` : s.start_time
                const end = s.end_time.length === 4 ? `0${s.end_time}` : s.end_time
                TIME_SLOTS.forEach(slot => {
                    if (start <= slot && end > slot) {
                        const key = `${s.day}-${slot}`
                        if (!grid[key]) grid[key] = []
                        grid[key].push({ ...course, currentRoom: s.room, currentStartTime: s.start_time, currentEndTime: s.end_time })
                    }
                })
            })
        })
        return grid
    }, [userCourses])

    const dayCourses = useMemo(() => {
        return userCourses
            .filter(c => c.schedule?.some((s: ScheduleEntry) => s.day === selectedDay))
            .sort((a, b) => {
                const ta = a.schedule?.find((s: ScheduleEntry) => s.day === selectedDay)?.start_time || ''
                const tb = b.schedule?.find((s: ScheduleEntry) => s.day === selectedDay)?.start_time || ''
                return ta.localeCompare(tb)
            })
    }, [userCourses, selectedDay])

    const handlePrint = useCallback(() => window.print(), [])

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="bg-destructive/10 p-4 rounded-full inline-flex mb-4">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h2>
                    <p className="text-muted-foreground mb-6">{String(error || 'يرجى المحاولة مرة أخرى')}</p>
                    <Button onClick={() => user?.role === 'student' ? refetchEnrolled() : refetchCourses()} variant="outline" className="gap-2">
                        <RefreshCcw className="h-4 w-4" /> إعادة المحاولة
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-10">
                <div className="relative overflow-hidden bg-primary/90 pb-16 pt-6 sm:pb-24 sm:pt-10">
                    <div className="container mx-auto px-4 relative z-10">
                        <Skeleton className="h-12 w-72 bg-primary-foreground/20 mb-4" />
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-primary-foreground/20" />)}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 -mt-10 sm:-mt-16 relative z-20">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar">
            {/* Hero */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10">
                <div className="absolute top-0 right-0 p-10 opacity-10" aria-hidden="true">
                    <Calendar size={300} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-2xl border border-primary-foreground/20 shadow-xl" aria-hidden="true">
                                <Clock size={48} className="text-primary-foreground" />
                            </div>
                            <div className="text-center md:text-right">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">الجدول الدراسي الأسبوعي</h1>
                                <p className="text-primary-foreground/80 text-lg">تنظيم الوقت والمحاضرات بشكل ذكي</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative group w-full md:w-56">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" aria-hidden="true" />
                                <Input
                                    placeholder="بحث في الجدول..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 pr-10 bg-primary-foreground/10 border-none text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-foreground/30"
                                    aria-label="البحث في الجدول"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl" onClick={handleRefresh} aria-label="تحديث">
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 h-10 px-5 rounded-xl gap-2" onClick={handlePrint}>
                                <Printer className="h-4 w-4" /> طباعة
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="region" aria-label="إحصائيات">
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 flex items-center gap-4">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg"><BookOpen size={22} /></div>
                            <div>
                                <p className="text-sm opacity-80">المقررات المسجلة</p>
                                <p className="text-2xl font-bold">{userCourses.length}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 flex items-center gap-4">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg"><Clock size={22} /></div>
                            <div>
                                <p className="text-sm opacity-80">ساعات الأسبوع</p>
                                <p className="text-2xl font-bold">{userCourses.reduce((s, c) => s + (c.credits || 3), 0)} ساعة</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hidden sm:flex items-center gap-4">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg"><GraduationCap size={22} /></div>
                            <div>
                                <p className="text-sm opacity-80">نوع الحساب</p>
                                <p className="text-2xl font-bold">
                                    {user?.role === 'student' ? 'طالب' : user?.role === 'teacher' ? 'محاضر' : 'إدارة'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-container -mt-10 sm:-mt-16 relative z-20">
                <Card className="card-unified shadow-2xl overflow-hidden">
                    <CardHeader className="bg-card border-b pb-0 pt-5 px-5">
                        {/* View Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5">
                            <div>
                                <CardTitle className="text-xl">جدول المحاضرات</CardTitle>
                                <CardDescription className="mt-0.5">
                                    {user?.role === 'student' ? 'متابعة مواعيد محاضراتك المسجلة' :
                                        user?.role === 'teacher' ? 'متابعة مواعيد محاضراتك' :
                                            'استعراض جميع المحاضرات المجدولة'}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-muted p-1 rounded-xl flex gap-1" role="tablist" aria-label="طريقة العرض">
                                    {([
                                        { value: 'week' as ViewTab, label: 'أسبوعي' },
                                        { value: 'day' as ViewTab, label: 'يومي' },
                                        { value: 'calendar' as ViewTab, label: 'تقويم الجامعة' },
                                    ] as { value: ViewTab; label: string }[]).map(tab => (
                                        <button
                                            key={tab.value}
                                            onClick={() => setActiveTab(tab.value)}
                                            role="tab"
                                            aria-selected={activeTab === tab.value}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                activeTab === tab.value
                                                    ? "bg-background text-primary shadow-sm"
                                                    : "text-muted-foreground hover:text-primary"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Day selector for week/day tabs */}
                        {activeTab !== 'calendar' && (
                            <div className="hidden md:flex gap-1 bg-muted/50 p-1 rounded-xl w-fit mb-2 flex-wrap" role="navigation" aria-label="اختر اليوم">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        aria-pressed={selectedDay === day}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                            selectedDay === day
                                                ? "bg-background text-primary shadow-sm"
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* University Calendar Tab */}
                        {activeTab === 'calendar' && (
                            <div className="p-6 space-y-3">
                                <div className="flex flex-wrap gap-3 mb-5 text-sm">
                                    {[
                                        { type: 'semester', label: 'بداية الفصل', color: 'bg-primary/10 text-primary border-primary/20' },
                                        { type: 'holiday', label: 'عطلة / إجازة', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
                                        { type: 'exam', label: 'اختبارات', color: 'bg-rose-500/10 text-rose-700 border-rose-200' },
                                        { type: 'deadline', label: 'مواعيد مهمة', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
                                    ].map(({ type, label, color }) => (
                                        <span key={type} className={cn('px-3 py-1 rounded-full border font-bold text-xs', color)}>{label}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {UNIVERSITY_CALENDAR.map(event => {
                                        const colorMap: Record<string, string> = {
                                            semester: 'border-primary/30 bg-primary/5 hover:border-primary/60',
                                            holiday: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 dark:bg-emerald-500/5 dark:border-emerald-800',
                                            exam: 'border-rose-200 bg-rose-50/50 hover:border-rose-400 dark:bg-rose-500/5 dark:border-rose-800',
                                            deadline: 'border-amber-200 bg-amber-50/50 hover:border-amber-400 dark:bg-amber-500/5 dark:border-amber-800',
                                        }
                                        const iconColorMap: Record<string, string> = {
                                            semester: 'text-primary',
                                            holiday: 'text-emerald-600',
                                            exam: 'text-rose-600',
                                            deadline: 'text-amber-600',
                                        }
                                        const badgeMap: Record<string, string> = {
                                            semester: 'bg-primary/10 text-primary',
                                            holiday: 'bg-emerald-500/10 text-emerald-700',
                                            exam: 'bg-rose-500/10 text-rose-700',
                                            deadline: 'bg-amber-500/10 text-amber-700',
                                        }
                                        const labelMap: Record<string, string> = {
                                            semester: 'فصل دراسي',
                                            holiday: 'إجازة',
                                            exam: 'اختبارات',
                                            deadline: 'موعد مهم',
                                        }
                                        const IconComp = event.icon
                                        const dateObj = new Date(event.date)
                                        const dateStr = dateObj.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
                                        return (
                                            <div
                                                key={event.id}
                                                className={cn('flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-default', colorMap[event.type])}
                                                role="listitem"
                                            >
                                                <div className={cn('p-3 rounded-xl bg-background/80 shadow-sm shrink-0', iconColorMap[event.type])}>
                                                    <IconComp size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground truncate">{event.title}</p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
                                                </div>
                                                <Badge className={cn('shrink-0 font-bold text-xs border-none', badgeMap[event.type])}>
                                                    {labelMap[event.type]}
                                                </Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Weekly Grid View — مرئي على كل الشاشات مع تمرير أفقي عند الحاجة */}
                        {activeTab === 'week' && (
                            <div className="flex overflow-x-auto">
                                {/* Left: time grid */}
                                <div className="flex-1 min-w-0">
                                    {/* Header row */}
                                    <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-muted/30 border-b">
                                        <div className="p-3 font-bold text-center border-l bg-muted/50 text-sm text-muted-foreground">الوقت</div>
                                        {DAYS.map(day => (
                                            <div key={day} className={cn(
                                                "p-3 font-bold text-center border-l text-sm cursor-pointer transition-colors hover:text-primary",
                                                selectedDay === day ? "bg-primary/5 text-primary" : "text-foreground"
                                            )} onClick={() => setSelectedDay(day)}>
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Body */}
                                    {TIME_SLOTS.map(time => (
                                        <div key={time} className="grid grid-cols-[80px_repeat(5,1fr)] border-b last:border-b-0">
                                            <div className="p-2 text-center text-xs font-bold bg-muted/20 border-l flex items-center justify-center text-muted-foreground min-h-[76px]">
                                                {time}
                                            </div>
                                            {DAYS.map(day => {
                                                const cells = scheduleGrid[`${day}-${time}`] || []
                                                return (
                                                    <div
                                                        key={`${day}-${time}`}
                                                        className={cn(
                                                            "p-1 border-l min-h-[76px] flex flex-col gap-1",
                                                            selectedDay === day ? "bg-primary/[0.03]" : ""
                                                        )}
                                                    >
                                                        {cells.map((course: any, i: number) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1 rounded-lg bg-primary/10 border border-primary/25 p-1.5 hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                                                                title={`${course.name} — ${course.currentRoom}`}
                                                                onClick={() => setSelectedDay(day)}
                                                            >
                                                                <div className="font-bold text-primary text-[10px] truncate leading-tight">{course.name}</div>
                                                                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mt-0.5">
                                                                    <MapPin className="h-2 w-2 shrink-0" />
                                                                    <span className="truncate">{course.currentRoom}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Right: Details panel */}
                                <div className="w-72 shrink-0 border-l bg-muted/5 p-4 overflow-y-auto" style={{ maxHeight: `${TIME_SLOTS.length * 76 + 44}px` }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="font-bold text-base">محاضرات {selectedDay}</h3>
                                    </div>
                                    {dayCourses.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground text-sm">لا توجد محاضرات اليوم</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {dayCourses.map(course => {
                                                const s = course.schedule.find((sc: ScheduleEntry) => sc.day === selectedDay)
                                                return (
                                                    <div key={course.id} className="bg-card rounded-xl p-3 border shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-2 gap-2">
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-sm truncate">{course.name}</h4>
                                                                <p className="text-[10px] text-muted-foreground font-mono">{course.code}</p>
                                                            </div>
                                                            <Badge className="text-[9px] font-bold bg-primary text-primary-foreground border-none shrink-0">
                                                                {s?.start_time} - {s?.end_time}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                                                            <span>{s?.room}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Day View — يظهر فقط عند اختيار تبويب اليوم */}
                        {activeTab === 'day' && (
                            <div className="p-4 space-y-4">
                                {/* Day Tabs - mobile */}
                                <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                                    <TabsList className="grid grid-cols-5 h-auto p-1 bg-muted rounded-2xl">
                                        {DAYS.map(day => (
                                            <TabsTrigger
                                                key={day}
                                                value={day}
                                                className="text-[10px] sm:text-xs py-2.5 px-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all"
                                            >
                                                {day.replace('ال', '')}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-base">محاضرات {selectedDay}</span>
                                    <Badge variant="outline" className="font-bold">{dayCourses.length} محاضرات</Badge>
                                </div>

                                {dayCourses.length === 0 ? (
                                    <div className="py-12">
                                        <EmptyState
                                            icon={Calendar}
                                            title="لا توجد محاضرات اليوم"
                                            description={`لا توجد محاضرات مجدولة ليوم ${selectedDay}.`}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dayCourses.map(course => {
                                            const s = course.schedule?.find((sc: ScheduleEntry) => sc.day === selectedDay)
                                            return (
                                                <div
                                                    key={`${selectedDay}-${course.id}`}
                                                    className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                                                >
                                                    <div className="absolute right-0 top-0 w-1.5 h-full bg-primary/20 rounded-r-2xl" />
                                                    <div className="flex justify-between items-start gap-3 pr-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-base truncate">{course.name}</h4>
                                                            <p className="text-xs font-mono text-primary mt-0.5 mb-3">{course.code}</p>
                                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className="p-1 bg-muted rounded-lg"><MapPin className="h-3.5 w-3.5 text-primary/70" /></div>
                                                                    {s?.room}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className="p-1 bg-muted rounded-lg"><Clock className="h-3.5 w-3.5 text-primary/70" /></div>
                                                                    {s?.start_time} - {s?.end_time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-primary text-primary-foreground border-none shrink-0 text-xs">
                                                            {course.credits || 3} ساعات
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Tip */}
                                <div className="bg-primary/90 rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h4 className="font-bold text-base mb-1">نصيحة اليوم</h4>
                                        <p className="text-primary-foreground/90 text-sm">الالتزام بمواعيد المحاضرات يساعدك على تحصيل علمي أفضل. تأكد من الوصول قبل 5 دقائق.</p>
                                    </div>
                                    <Info className="absolute -bottom-4 -left-4 w-20 h-20 text-primary-foreground/10" aria-hidden="true" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SchedulePage
