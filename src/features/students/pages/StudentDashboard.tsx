import { useState, useMemo } from 'react'
import { useAuthState, useLogout } from '@/features/auth/hooks/useAuth'
import { useEnrolledCourses } from '@/features/courses/hooks/useCourses'
import { Course } from '@/features/courses/types'
import { useStudentGrades, useGradeStatistics } from '@/features/grades/hooks/useGrades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    LogOut, 
    GraduationCap, 
    BookOpen, 
    Award, 
    User, 
    LayoutDashboard,
    TrendingUp,
    Loader2,
    RefreshCw,
    Search
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

/**
 * لوحة تحكم الطالب - تعرض الملخص الأكاديمي، المعدل التراكمي، والمقررات المسجلة
 * 
 * @component
 * @returns {JSX.Element} واجهة المستخدم الخاصة بلوحة تحكم الطالب
 */
export default function StudentDashboard() {
    const { user } = useAuthState()
    const logoutMutation = useLogout()
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    
    // React Query Hooks
    const { 
        data: enrolledCourses = [], 
        isLoading: coursesLoading,
        refetch: refetchCourses 
    } = useEnrolledCourses(user?.id || '')
    
    const { 
        data: studentGrades = [], 
        isLoading: gradesLoading,
        refetch: refetchGrades 
    } = useStudentGrades(user?.id || '')
    
    const { 
        data: statistics,
        refetch: refetchStats 
    } = useGradeStatistics(user?.id || '')

    /**
     * معالج تحديث البيانات يدوياً
     */
    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchCourses(),
                refetchGrades(),
                refetchStats()
            ])
            toast.success('تم تحديث البيانات بنجاح')
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث البيانات')
        }
    }

    /**
     * تصفية المقررات بناءً على نص البحث
     */
    const filteredCourses = useMemo(() => {
        if (!debouncedSearchTerm) return enrolledCourses
        
        const searchLower = debouncedSearchTerm.toLowerCase()
        return enrolledCourses.filter((course: Course) => 
            course.name.toLowerCase().includes(searchLower) || 
            course.code.toLowerCase().includes(searchLower) ||
            course.teacher_name.toLowerCase().includes(searchLower)
        )
    }, [enrolledCourses, debouncedSearchTerm])

    /**
     * معالج تسجيل الخروج من النظام
     * 
     * @function handleLogout
     * @returns {void}
     */
    const handleLogout = () => {
        logoutMutation.mutate()
    }

    /**
     * تحديد لون المعدل التراكمي بناءً على القيمة
     * 
     * @function getGPAColor
     * @param {number} gpa - قيمة المعدل التراكمي (0-4)
     * @returns {string} اسم فئة Tailwind للون المناسب
     */
    const getGPAColor = (gpa: number) => {
        if (gpa >= 3.5) return "text-primary";
        if (gpa >= 3.0) return "text-primary/80";
        if (gpa >= 2.0) return "text-primary/60";
        return "text-destructive";
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-24 pt-10">
                <div className="absolute top-0 right-0 p-10 opacity-10" aria-hidden="true">
                    <GraduationCap size={300} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-2xl border border-primary-foreground/20 shadow-xl" aria-hidden="true">
                                <GraduationCap size={48} className="text-primary-foreground" />
                            </div>
                            <div className="text-center md:text-right">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">لوحة تحكم الطالب</h1>
                                <p className="text-primary-foreground/80 text-lg max-w-xl">مرحباً، {user?.name} | {user?.department}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleRefresh}
                                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm transition-all hover:scale-105"
                                aria-label="تحديث البيانات"
                            >
                                <RefreshCw className={`h-4 w-4 ${coursesLoading || gradesLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                                <span className="hidden sm:inline ml-2">تحديث</span>
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={handleLogout} 
                                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm transition-all hover:scale-105"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8" role="region" aria-label="إحصائيات سريعة">
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10 flex items-center gap-4 transition-all hover:bg-primary-foreground/15 shadow-lg">
                            <div className="p-3 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80 font-bold uppercase tracking-wider mb-0.5">المعدل التراكمي</p>
                                <p className="text-2xl font-black">{statistics?.cumulative_gpa?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10 flex items-center gap-4 transition-all hover:bg-primary-foreground/15 shadow-lg">
                            <div className="p-3 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80 font-bold uppercase tracking-wider mb-0.5">المقررات المسجلة</p>
                                <p className="text-2xl font-black">{enrolledCourses.length}</p>
                            </div>
                        </div>
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10 flex items-center gap-4 transition-all hover:bg-primary-foreground/15 shadow-lg">
                            <div className="p-3 bg-primary-foreground/20 rounded-xl" aria-hidden="true">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80 font-bold uppercase tracking-wider mb-0.5">الساعات المكتسبة</p>
                                <p className="text-2xl font-black">{statistics?.earned_credits || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-16 relative z-20 space-y-8">
                {/* Academic Status Card */}
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="الملخص الأكاديمي">
                    <CardHeader className="bg-card border-b border-muted">
                        <CardTitle className="text-xl font-black text-foreground">الملخص الأكاديمي</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl border border-transparent hover:border-muted transition-all">
                                    <span className="text-muted-foreground font-medium">الرقم الجامعي</span>
                                    <span className="font-bold font-mono text-foreground">{user?.university_id}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl border border-transparent hover:border-muted transition-all">
                                    <span className="text-muted-foreground font-medium">القسم</span>
                                    <span className="font-bold text-foreground">{user?.department}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl border border-transparent hover:border-muted transition-all">
                                    <span className="text-muted-foreground font-medium">حالة الطالب</span>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1 rounded-xl">
                                        منتظم
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-3xl border-2 border-dashed border-muted relative group" aria-label={`المعدل التراكمي: ${statistics?.cumulative_gpa?.toFixed(2) || '0.00'}`}>
                                <div className="text-center">
                                    <div className={`text-6xl font-black mb-2 transition-transform group-hover:scale-110 ${getGPAColor(statistics?.cumulative_gpa || 0)}`} aria-hidden="true">
                                        {statistics?.cumulative_gpa?.toFixed(2) || '0.00'}
                                    </div>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">المعدل التراكمي العام</p>
                                    <div className="flex gap-2 justify-center">
                                        <Badge variant="secondary" className="px-6 py-1 rounded-full font-black text-xs">
                                            {statistics?.cumulative_gpa >= 3.5 ? 'ممتاز' : 
                                             statistics?.cumulative_gpa >= 3.0 ? 'جيد جداً' : 
                                             statistics?.cumulative_gpa >= 2.0 ? 'جيد' : 'مقبول'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Courses */}
                <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="المقررات الحالية">
                    <CardHeader className="bg-card border-b border-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-black text-foreground">المقررات الحالية</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <Input
                                placeholder="بحث في المقررات..."
                                className="pr-10 bg-muted/50 border-none focus-visible:ring-primary rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="البحث في المقررات الحالية"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course: Course) => (
                                    <div key={course.id} className="p-6 rounded-3xl border border-muted hover:shadow-xl hover:bg-muted/5 transition-all group relative overflow-hidden" role="listitem">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-primary/10" aria-hidden="true"></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold font-mono">{course.code}</Badge>
                                            <Badge variant="secondary" className="font-bold">{course.credits} ساعات</Badge>
                                        </div>
                                        <h3 className="font-black text-lg mb-1 group-hover:text-primary transition-colors">{course.name}</h3>
                                        <p className="text-sm text-muted-foreground font-medium mb-6">{course.teacher_name}</p>
                                        
                                        <div className="space-y-2" aria-label="نسبة الإنجاز في المقرر">
                                            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <span>الإنجاز</span>
                                                <span className="text-primary">60%</span>
                                            </div>
                                            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden shadow-inner" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                                                <div className="bg-primary h-full w-[60%] rounded-full transition-all duration-1000 group-hover:bg-primary/80"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                                <div className="bg-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm" aria-hidden="true">
                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-bold">لا توجد مقررات مسجلة حالياً</p>
                                <p className="text-muted-foreground/60 text-xs mt-1">يمكنك التسجيل في المقررات من خلال قسم التسجيل</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
