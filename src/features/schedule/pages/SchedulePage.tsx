import { useMemo, useState, useCallback } from 'react'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { useCourses, useEnrolledCourses } from '@/features/courses/hooks/useCourses'
import { Course } from '@/features/courses/types'

// Type for schedule entries within a course
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
import { 
    Loader2, Clock, MapPin, Calendar, BookOpen, 
    GraduationCap, Layout, Printer, Download,
    ChevronRight, ChevronLeft, Info, RefreshCcw, Search,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

/**
 * @page SchedulePage
 * @description صفحة الجدول الدراسي الأسبوعي.
 * تعرض المواعيد الدراسية للطلاب والمحاضرين بتنسيق شبكي وتفصيلي.
 * تدعم عرض المحاضرات حسب اليوم، والطباعة، وتصدير الجدول.
 * 
 * @returns {JSX.Element} صفحة الجدول الدراسي
 */
const SchedulePage = () => {
    const { user } = useAuthState()
    const { data: enrolledCourses = [], isLoading: isLoadingEnrolled, refetch: refetchEnrolled, error: enrolledError } = useEnrolledCourses(user?.id || '')
    const { data: coursesResponse, isLoading: isLoadingCourses, refetch: refetchCourses, error: coursesError } = useCourses()
    const allCourses = useMemo(() => coursesResponse?.items || [], [coursesResponse])

    const [selectedDay, setSelectedDay] = useState<string>(DAYS[0])
    const [searchTerm, setSearchTerm] = useState('')

    const isLoading = user?.role === 'student' ? isLoadingEnrolled : isLoadingCourses
    const error = user?.role === 'student' ? enrolledError : coursesError

    /**
     * معالجة تحديث البيانات
     */
    const handleRefresh = async () => {
        try {
            if (user?.role === 'student') {
                await refetchEnrolled()
            } else {
                await refetchCourses()
            }
            toast.success('تم تحديث الجدول الدراسي بنجاح')
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث الجدول')
        }
    }

    /**
     * حساب المقررات الخاصة بالمستخدم بناءً على دوره (طالب، أستاذ، مسؤول) وتصفيتها حسب البحث
     */
    const userCourses = useMemo(() => {
        if (!user) return []
        let courses = []
        if (user.role === 'student') courses = enrolledCourses
        else if (user.role === 'teacher') courses = allCourses.filter(course => course.teacher_id === user.id)
        else if (user.role === 'admin') courses = allCourses
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            courses = courses.filter(c => 
                c.name.toLowerCase().includes(searchLower) || 
                c.code.toLowerCase().includes(searchLower)
            )
        }
        return courses
    }, [user, enrolledCourses, allCourses, searchTerm])

    /**
     * بناء شبكة الجدول الزمني لربط المقررات بالأيام والساعات
     */
    const scheduleGrid = useMemo(() => {
        const grid: Record<string, any> = {}
        userCourses.forEach(course => {
            course.schedule?.forEach((s: ScheduleEntry) => {
                const day = s.day
                // تعيين المقرر لكل ساعة يغطيها في الجدول
                TIME_SLOTS.forEach(slot => {
                    if (s.start_time <= slot && s.end_time > slot) {
                        grid[`${day}-${slot}`] = {
                            ...course,
                            currentRoom: s.room,
                            currentStartTime: s.start_time,
                            currentEndTime: s.end_time
                        }
                    }
                })
            })
        })
        return grid
    }, [userCourses])

    /**
     * تصفية المقررات ليوم محدد وترتيبها زمنياً
     */
    const dayCourses = useMemo(() => {
        return userCourses
            .filter(course => course.schedule?.some(s => s.day === selectedDay))
            .sort((a, b) => {
                const timeA = a.schedule?.find(s => s.day === selectedDay)?.start_time || ''
                const timeB = b.schedule?.find(s => s.day === selectedDay)?.start_time || ''
                return timeA.localeCompare(timeB)
            })
    }, [userCourses, selectedDay])

    /**
     * معالجة طباعة الجدول
     */
    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    if (error) {
        return (
            <div className="min-h-screen bg-background pb-10 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="bg-destructive/10 p-4 rounded-full inline-flex mb-4">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h2>
                    <p className="text-muted-foreground mb-6">
                        {(error as Error)?.message || 'يرجى المحاولة مرة أخرى لاحقاً'}
                    </p>
                    <Button 
                        onClick={() => user?.role === 'student' ? refetchEnrolled() : refetchCourses()} 
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-10">
                <div className="relative overflow-hidden bg-primary/90 pb-24 pt-10">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <Skeleton className="h-20 w-20 rounded-2xl bg-primary-foreground/20" />
                                <div className="space-y-3">
                                    <Skeleton className="h-10 w-64 bg-primary-foreground/20" />
                                    <Skeleton className="h-6 w-96 bg-primary-foreground/20" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-10 w-28 rounded-xl bg-primary-foreground/20" />
                                <Skeleton className="h-10 w-28 rounded-xl bg-primary-foreground/20" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 rounded-xl bg-primary-foreground/20" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 -mt-16 relative z-20">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-24 pt-10">
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
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="relative group w-full md:w-64">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60 group-focus-within:text-primary-foreground transition-colors" aria-hidden="true" />
                                <Input
                                    placeholder="بحث في الجدول..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pr-11 bg-primary-foreground/10 border-none text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-foreground/30"
                                    aria-label="البحث في الجدول الدراسي"
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon"
                                className="h-11 w-11 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl" 
                                onClick={handleRefresh}
                                aria-label="تحديث بيانات الجدول"
                            >
                                <RefreshCcw className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            <Button 
                                variant="outline" 
                                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 h-11 px-6 rounded-xl" 
                                onClick={handlePrint}
                                aria-label="طباعة الجدول الدراسي"
                            >
                                <Printer className="ml-2 h-4 w-4" aria-hidden="true" />
                                طباعة
                            </Button>
                            <Button 
                                variant="outline" 
                                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 h-11 px-6 rounded-xl"
                                aria-label="تحميل الجدول الدراسي كملف PDF"
                            >
                                <Download className="ml-2 h-4 w-4" aria-hidden="true" />
                                تحميل PDF
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8" role="region" aria-label="إحصائيات سريعة للجدول">
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 flex items-center gap-4 hover:bg-primary-foreground/20 transition-colors">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg" aria-hidden="true">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">المقررات المسجلة</p>
                                <p className="text-2xl font-bold">{userCourses.length}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 flex items-center gap-4 hover:bg-primary-foreground/20 transition-colors">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg" aria-hidden="true">
                                <Layout size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">إجمالي الساعات</p>
                                <p className="text-2xl font-bold">{userCourses.length * 3} ساعة</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hidden md:flex items-center gap-4 hover:bg-primary-foreground/20 transition-colors">
                            <div className="p-3 bg-primary-foreground/20 rounded-lg" aria-hidden="true">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">نوع الحساب</p>
                                <p className="text-2xl font-bold">
                                    {user?.role === 'student' ? 'طالب' : 
                                     user?.role === 'teacher' ? 'محاضر' : 'إدارة'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
                    <CardHeader className="bg-card border-b pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl">جدول المحاضرات</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {user?.role === 'student' ? 'متابعة مواعيد محاضراتك المسجلة للفصل الحالي' : 
                                     user?.role === 'teacher' ? 'متابعة مواعيد محاضراتك التي تدرسها' :
                                     'استعراض وتدقيق جميع المحاضرات المجدولة في النظام'}
                                </CardDescription>
                            </div>
                            <div className="bg-muted p-1 rounded-xl hidden md:flex" role="navigation" aria-label="اختر اليوم لعرض محاضراته">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        aria-pressed={selectedDay === day}
                                        aria-label={`عرض محاضرات يوم ${day}`}
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
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Grid View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <div className="min-w-[1000px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-10 bg-muted/30 border-b">
                                    <div className="p-4 font-bold text-center border-l bg-muted/50">الوقت</div>
                                    {DAYS.map(day => (
                                        <div key={day} className={cn(
                                            "p-4 font-bold text-center border-l last:border-l-0 col-span-1",
                                            selectedDay === day ? "bg-primary/5 text-primary" : ""
                                        )}>
                                            {day}
                                        </div>
                                    ))}
                                    <div className="col-span-4 p-4 font-bold text-center">تفاصيل اليوم المحدد</div>
                                </div>

                                {/* Body */}
                                <div className="grid grid-cols-10" role="region" aria-label="تفاصيل الجدول الأسبوعي">
                                    {/* Grid Column */}
                                    <div className="col-span-6 border-l" role="grid" aria-label="جدول المحاضرات">
                                        {TIME_SLOTS.map((time, idx) => (
                                            <div key={time} className="grid grid-cols-6 border-b last:border-b-0 group" role="row">
                                                <div className="p-4 text-center text-xs font-bold bg-muted/30 border-l flex items-center justify-center group-hover:bg-primary/5 transition-colors" role="rowheader">
                                                    {time}
                                                </div>
                                                {DAYS.map(day => {
                                                    const course = scheduleGrid[`${day}-${time}`]
                                                    return (
                                                        <div key={`${day}-${time}`} className={cn(
                                                            "p-1 border-l last:border-l-0 min-h-[80px] transition-all",
                                                            selectedDay === day ? "bg-primary/5" : ""
                                                        )} role="gridcell">
                                                            {course && (
                                                                <div 
                                                                    className="h-full rounded-lg bg-card border-2 border-primary/20 p-2 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group/item"
                                                                    aria-label={`محاضرة ${course.name} في ${course.currentRoom} من ${course.currentStartTime} إلى ${course.currentEndTime}`}
                                                                >
                                                                    <div className="font-bold text-primary text-[10px] truncate">{course.name}</div>
                                                                    <div className="flex items-center gap-1 text-[8px] text-muted-foreground mt-1">
                                                                        <MapPin className="h-2 w-2" aria-hidden="true" />
                                                                        <span>{course.currentRoom}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Details Column */}
                                    <div className="col-span-4 bg-muted/10 p-6" role="region" aria-label={`تفاصيل محاضرات يوم ${selectedDay}`}>
                                        <div className="sticky top-6">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-2 h-8 bg-primary rounded-full" aria-hidden="true"></div>
                                                <h3 className="text-xl font-bold">محاضرات يوم {selectedDay}</h3>
                                            </div>
                                            
                                            {dayCourses.length === 0 ? (
                                                <div className="py-12">
                                                    <EmptyState
                                                        icon={Calendar}
                                                        title="لا توجد محاضرات مجدولة"
                                                        description={`لا توجد محاضرات مجدولة ليوم ${selectedDay}. استمتع بوقتك أو قم بمراجعة دروسك.`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {dayCourses.map(course => {
                                                        const s = course.schedule.find((sc: ScheduleEntry) => sc.day === selectedDay)
                                                        return (
                                                            <div key={course.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all group" role="article" aria-label={`محاضرة ${course.name}`}>
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <h4 className="font-bold text-card-foreground group-hover:text-primary transition-colors">{course.name}</h4>
                                                                        <p className="text-xs text-muted-foreground font-mono">{course.code}</p>
                                                                    </div>
                                                                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold" aria-label={`الوقت: من ${s.start_time} إلى ${s.end_time}`}>
                                                                        {s.start_time} - {s.end_time}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <MapPin className="h-4 w-4 text-primary/70" aria-hidden="true" />
                                                                        <span>{s.room}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Info className="h-4 w-4 text-primary/70" aria-hidden="true" />
                                                                        <span>3 ساعات معتمدة</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile & Tablet View */}
                        <div className="lg:hidden p-4 space-y-6" role="region" aria-label="عرض المحاضرات للأجهزة المحمولة">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">جدول اليوم</h3>
                                <div className="text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full" aria-label={`${dayCourses.length} محاضرات اليوم`}>
                                    {dayCourses.length} محاضرات
                                </div>
                            </div>

                            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
                                <TabsList className="grid grid-cols-5 h-auto p-1 bg-muted rounded-2xl" aria-label="اختر اليوم">
                                    {DAYS.map(day => (
                                        <TabsTrigger 
                                            key={day} 
                                            value={day}
                                            aria-label={`محاضرات يوم ${day}`}
                                            className="text-[10px] sm:text-xs py-3 px-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all"
                                        >
                                            {day.replace('ال', '')}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {dayCourses.length === 0 ? (
                                <div className="py-12">
                                    <EmptyState
                                        icon={Calendar}
                                        title="عطلة سعيدة! لا توجد محاضرات"
                                        description={`لا توجد محاضرات مجدولة ليوم ${selectedDay}. استمتع بوقتك أو قم بمراجعة دروسك.`}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dayCourses.map(course => {
                                        const schedule = course.schedule?.find((s: ScheduleEntry) => s.day === selectedDay);
                                        return (
                                            <div 
                                                key={`${selectedDay}-${course.id}`} 
                                                className="bg-card border border-border rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group"
                                                role="article"
                                                aria-label={`محاضرة ${course.name} في ${schedule?.room} من ${schedule?.start_time} إلى ${schedule?.end_time}`}
                                            >
                                                <div className="absolute top-0 right-0 w-2 h-full bg-primary/10"></div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></div>
                                                            <h4 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">{course.name}</h4>
                                                        </div>
                                                        <p className="text-primary text-xs font-mono mb-4 pr-4">{course.code}</p>
                                                        
                                                        <div className="flex flex-wrap gap-4 mt-2">
                                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                                <div className="p-1.5 bg-muted rounded-lg" aria-hidden="true">
                                                                    <MapPin className="h-4 w-4 text-primary/70" />
                                                                </div>
                                                                <span className="font-medium">{schedule?.room}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                                <div className="p-1.5 bg-muted rounded-lg" aria-hidden="true">
                                                                    <Clock className="h-4 w-4 text-primary/70" />
                                                                </div>
                                                                <span className="font-medium">{schedule?.start_time} - {schedule?.end_time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="عرض المزيد من التفاصيل">
                                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="bg-primary/90 rounded-3xl p-6 text-primary-foreground relative overflow-hidden shadow-lg" role="region" aria-label="نصيحة اليوم">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg mb-1 text-primary-foreground">نصيحة اليوم</h4>
                                    <p className="text-primary-foreground/90 text-sm leading-relaxed">
                                        الالتزام بمواعيد المحاضرات يساعدك على تحصيل علمي أفضل. تأكد من الوصول قبل 5 دقائق.
                                    </p>
                                </div>
                                <Info className="absolute -bottom-4 -left-4 w-24 h-24 text-primary-foreground/10" aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SchedulePage
