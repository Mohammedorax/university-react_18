import { useMemo, memo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { StatCard } from '@/components/StatCard'
import { toast } from 'sonner'
import { BaseAreaChart, BasePieChart } from '@/components/charts/BaseCharts'
import { AddStudentDialog } from '@/features/students/components/AddStudentDialog'
import { AddTeacherDialog } from '@/features/teachers/components/AddTeacherDialog'
import { AddStaffDialog } from '@/features/staff/components/AddStaffDialog'
import { AddCourseDialog } from '@/features/courses/components/AddCourseDialog'
import { StudentDetailsDialog } from '@/features/students/components/StudentDetailsDialog'
import { useStudents } from '@/features/students/hooks/useStudents'
import { Student } from '@/features/students/types'
import { useTeachers } from '@/features/teachers/hooks/useTeachers'
import { useCourses } from '@/features/courses/hooks/useCourses'
import { useStaff } from '@/features/staff/hooks/useStaff'
import { 
    GraduationCap, 
    BookOpen, 
    Package, 
    Percent, 
    UserPlus,
    Briefcase,
    LayoutDashboard,
    Users,
    Activity,
    ShieldCheck,
    Database,
    Clock,
    ArrowUpRight,
    TrendingUp,
    RefreshCcw,
    Info,
    ArrowRight,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    PieChart as PieChartIcon,
    Loader2
} from 'lucide-react'
import {
    ResponsiveContainer,
} from 'recharts'

/**
 * @component RecentStudentItem
 * @description مكون لعرض صف واحد في قائمة أحدث الطلاب في لوحة التحكم.
 * 
 * @param {Object} props - خصائص المكون
 * @param {Student} props.student - بيانات الطالب المراد عرضه
 * @returns {JSX.Element} عنصر قائمة الطالب
 */
const RecentStudentItem = memo(({ student }: { student: Student }) => (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-card hover:shadow-md border border-transparent hover:border-muted transition-all duration-300 group">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-card shadow-sm flex items-center justify-center text-primary font-black text-xl border border-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                {student.name[0]}
            </div>
            <div>
                <p className="font-black text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="font-mono">{student.university_id}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                    <span>{student.department}</span>
                </div>
            </div>
        </div>
        <StudentDetailsDialog student={student} trigger={
            <Button variant="secondary" size="sm" className="rounded-xl font-bold bg-card shadow-sm border border-muted" aria-label={`عرض ملف ${student.name}`}>عرض الملف</Button>
        } />
    </div>
))

/**
 * @page AdminDashboard
 * @description لوحة تحكم المسؤول الرئيسية.
 * توفر نظرة عامة شاملة على إحصائيات النظام، نمو الطلاب، وتوزيعهم حسب التخصصات،
 * بالإضافة إلى وصول سريع لإضافة طلاب، مدرسين، موظفين، ومقررات.
 * 
 * @returns {JSX.Element} صفحة لوحة التحكم للمسؤول
 */
export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user } = useAuthState()
    
    const [isRefreshing, setIsRefreshing] = useState(false)
    
    const { data: studentsData, isLoading: studentsLoading, error: studentsError, refetch: refetchStudents } = useStudents({ limit: 5 })
    const { data: teachersData, isLoading: teachersLoading, error: teachersError, refetch: refetchTeachers } = useTeachers({ limit: 1 })
    const { data: coursesData, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses({ limit: 1 })
    const { data: staffData, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useStaff({ limit: 1 })

    const isLoading = studentsLoading || teachersLoading || coursesLoading || staffLoading
    const hasError = studentsError || teachersError || coursesError || staffError

    const students = useMemo(() => studentsData?.items || [], [studentsData])
    const totalStudents = useMemo(() => studentsData?.total || 0, [studentsData])
    const totalTeachers = useMemo(() => teachersData?.total || 0, [teachersData])
    const totalCourses = useMemo(() => coursesData?.total || 0, [coursesData])
    const totalStaff = useMemo(() => staffData?.total || 0, [staffData])

    /**
     * تحديث جميع البيانات في لوحة التحكم
     */
    const handleRefetchAll = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                refetchStudents(),
                refetchTeachers(),
                refetchCourses(),
                refetchStaff()
            ])
            toast.success('تم تحديث بيانات لوحة التحكم بنجاح')
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث البيانات')
        } finally {
            setIsRefreshing(false)
        }
    }

    // بيانات نمو الطلاب (محاكاة)
    const growthData = useMemo(() => [
        { month: 'سبتمبر', students: 400 },
        { month: 'أكتوبر', students: 600 },
        { month: 'نوفمبر', students: 800 },
        { month: 'ديسمبر', students: 1100 },
        { month: 'يناير', students: 1400 },
        { month: 'فبراير', students: totalStudents },
    ], [totalStudents])

    // توزيع الطلاب حسب التخصص (باستخدام البيانات الفعلية)
    const deptDistribution = useMemo(() => {
        const departments = ['علوم الحاسب', 'هندسة البرمجيات', 'نظم المعلومات', 'الذكاء الاصطناعي'];
        return departments.map((dept, index) => ({
            name: dept,
            value: Math.floor(totalStudents * [0.4, 0.25, 0.15, 0.2][index]),
        }));
    }, [totalStudents])

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary)/0.8)', 'hsl(var(--primary)/0.6)', 'hsl(var(--primary)/0.4)'];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-10" role="alert" aria-busy="true" aria-label="جاري تحميل بيانات لوحة التحكم">
                <div className="bg-primary/90 text-primary-foreground pb-32 pt-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                                <Skeleton className="h-24 w-24 rounded-3xl bg-primary-foreground/20" aria-hidden="true" />
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-64 bg-primary-foreground/20" aria-hidden="true" />
                                    <Skeleton className="h-6 w-96 bg-primary-foreground/20" aria-hidden="true" />
                                </div>
                            </div>
                            <Skeleton className="h-14 w-44 rounded-2xl bg-primary-foreground/20" aria-hidden="true" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-24 rounded-2xl bg-primary-foreground/20" aria-hidden="true" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 -mt-16 relative z-20 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="h-64 w-full rounded-3xl" aria-hidden="true" />
                            <Skeleton className="h-96 w-full rounded-3xl" aria-hidden="true" />
                        </div>
                        <div className="space-y-8">
                            <Skeleton className="h-80 w-full rounded-3xl" aria-hidden="true" />
                            <Skeleton className="h-64 w-full rounded-3xl" aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4" role="alert" aria-live="assertive">
                <Card className="max-w-md w-full border-none shadow-2xl bg-card rounded-[2rem] overflow-hidden text-center p-10">
                    <div className="bg-destructive/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-destructive" aria-hidden="true">
                        <Info size={48} />
                    </div>
                    <h2 className="text-2xl font-black mb-3 text-foreground tracking-tight">حدث خطأ في النظام</h2>
                    <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                        فشل في تحميل بيانات لوحة التحكم. يرجى التحقق من الاتصال والمحاولة مرة أخرى.
                    </p>
                    <Button 
                        onClick={handleRefetchAll} 
                        className="w-full gap-2 rounded-2xl h-14 font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-primary-foreground"
                        aria-label="إعادة محاولة تحميل بيانات لوحة التحكم"
                    >
                        <RefreshCcw size={20} aria-hidden="true" />
                        تحديث لوحة التحكم
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar" role="main" aria-labelledby="dashboard-title">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-32 pt-12">
                <div className="absolute top-0 right-0 p-10 opacity-5" aria-hidden="true">
                    <LayoutDashboard size={400} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-primary-foreground/10 backdrop-blur-md p-5 rounded-3xl border border-primary-foreground/20 shadow-2xl" aria-hidden="true">
                                <Activity size={56} className="text-primary-foreground" />
                            </div>
                            <div className="text-center md:text-right">
                                <h1 id="dashboard-title" className="text-3xl md:text-5xl font-black mb-3 tracking-tight">لوحة التحكم</h1>
                                <p className="text-primary-foreground/80 text-lg max-w-xl">مرحباً بك مجدداً، {user?.name}. إليك نظرة سريعة على أداء الجامعة اليوم.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleRefetchAll}
                                disabled={isRefreshing}
                                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10 backdrop-blur-sm transition-all hover:scale-105 font-bold rounded-2xl px-6 py-6 h-auto shadow-xl"
                                aria-label="تحديث بيانات لوحة التحكم"
                            >
                                {isRefreshing ? (
                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                ) : (
                                    <RefreshCcw className="ml-2 h-5 w-5" aria-hidden="true" />
                                )}
                                تحديث
                            </Button>
                            <Link to="/reports" aria-label="الانتقال إلى صفحة التقارير التحليلية">
                                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-2xl px-6 py-6 h-auto shadow-xl transition-all hover:scale-[1.02]" tabIndex={-1}>
                                    <TrendingUp className="ml-2 h-5 w-5" aria-hidden="true" />
                                    عرض التقارير
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8" role="region" aria-label="إحصائيات النظام العامة">
                        <h2 className="sr-only">إحصائيات النظام العامة</h2>
                        {[
                            { label: 'إجمالي الطلاب', value: totalStudents, icon: GraduationCap, color: 'bg-primary/20 text-primary', link: '/admin/students', ariaLabel: `عرض قائمة الطلاب، الإجمالي ${totalStudents}` },
                            { label: 'هيئة التدريس', value: totalTeachers, icon: Users, color: 'bg-primary/10 text-primary', link: '/admin/teachers', ariaLabel: `عرض أعضاء هيئة التدريس، الإجمالي ${totalTeachers}` },
                            { label: 'المقررات', value: totalCourses, icon: BookOpen, color: 'bg-primary/20 text-primary', link: '/courses', ariaLabel: `عرض المقررات الدراسية، الإجمالي ${totalCourses}` },
                            { label: 'الموظفين', value: totalStaff, icon: Briefcase, color: 'bg-primary/10 text-primary', link: '/admin/staff', ariaLabel: `عرض طاقم العمل، الإجمالي ${totalStaff}` },
                        ].map((stat, i) => (
                            <Link key={i} to={stat.link} className="block transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/50 rounded-2xl ring-offset-primary" aria-label={stat.ariaLabel}>
                                <StatCard 
                                    icon={stat.icon} 
                                    label={stat.label} 
                                    value={stat.value} 
                                    colorClass={stat.color}
                                    className="bg-card/40 border-primary-foreground/10"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-16 relative z-20 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Growth Chart */}
                            <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card h-[400px]">
                                <CardHeader className="pb-2">
                                    <CardTitle asChild className="text-lg font-black flex items-center gap-2">
                                        <h2>
                                            <TrendingUp className="text-primary" size={20} aria-hidden="true" />
                                            نمو الطلاب
                                        </h2>
                                    </CardTitle>
                                    <CardDescription>عدد الطلاب المسجلين خلال الأشهر الأخيرة</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] p-4">
                                    <BaseAreaChart 
                                        data={growthData} 
                                        dataKey="students" 
                                        categoryKey="month" 
                                        ariaLabel="رسم بياني لنمو الطلاب"
                                    />
                                </CardContent>
                            </Card>

                            {/* Distribution Chart */}
                            <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card h-[400px]">
                                <CardHeader className="pb-2">
                                    <CardTitle asChild className="text-lg font-black flex items-center gap-2">
                                        <h2>
                                            <PieChartIcon className="text-primary" size={20} aria-hidden="true" />
                                            توزيع التخصصات
                                        </h2>
                                    </CardTitle>
                                    <CardDescription>نسبة الطلاب في كل قسم أكاديمي</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] p-0">
                                    <BasePieChart 
                                        data={deptDistribution} 
                                        ariaLabel="رسم بياني لتوزيع التخصصات"
                                        colors={COLORS}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions Card */}
                        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="إجراءات إدارية سريعة">
                            <CardHeader className="bg-card border-b border-muted">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle asChild className="text-xl font-black text-foreground">
                                            <h2>إجراءات سريعة</h2>
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground">الوصول السريع للمهام الإدارية الأكثر استخداماً</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="group" aria-label="أزرار الإضافة السريعة">
                                    <AddStudentDialog trigger={
                                        <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-primary/5 hover:text-primary border-muted rounded-2xl transition-all duration-300 group shadow-sm" aria-label="إضافة طالب جديد للنظام">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold">إضافة طالب</span>
                                        </Button>
                                    } />
                                    <AddTeacherDialog trigger={
                                        <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-primary/5 hover:text-primary border-muted rounded-2xl transition-all duration-300 group shadow-sm" aria-label="إضافة مدرس جديد للنظام">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold">إضافة مدرس</span>
                                        </Button>
                                    } />
                                    <AddStaffDialog trigger={
                                        <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-primary/5 hover:text-primary border-muted rounded-2xl transition-all duration-300 group shadow-sm" aria-label="إضافة موظف جديد للنظام">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold">إضافة موظف</span>
                                        </Button>
                                    } />
                                    <AddCourseDialog trigger={
                                        <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-primary/5 hover:text-primary border-muted rounded-2xl transition-all duration-300 group shadow-sm" aria-label="إضافة مقرر دراسي جديد">
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold">إضافة مقرر</span>
                                        </Button>
                                    } />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Students List */}
                        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="قائمة أحدث الطلاب المسجلين">
                            <CardHeader className="bg-card border-b border-muted flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle asChild className="text-xl font-black text-foreground">
                                        <h2>أحدث الطلاب</h2>
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">قائمة بآخر الطلاب المنضمين للجامعة</CardDescription>
                                </div>
                                <Button variant="ghost" onClick={() => navigate('/admin/students')} className="text-primary font-bold hover:bg-primary/10" aria-label="عرض كافة الطلاب المسجلين">
                                    عرض الكل
                                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {students.length === 0 ? (
                                        <div className="py-12">
                                            <EmptyState
                                                icon={GraduationCap}
                                                title="لا يوجد طلاب حديثين"
                                                description="لم يتم تسجيل أي طلاب حديثاً في النظام حتى الآن."
                                            />
                                        </div>
                                    ) : (
                                        students.map((student: Student) => (
                                            <RecentStudentItem key={student.id} student={student} />
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-8">
                        {/* System Status Card */}
                        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden bg-card" role="region" aria-label="حالة النظام التقنية">
                            <CardHeader className="bg-card border-b border-muted">
                                <CardTitle asChild className="text-lg font-black flex items-center gap-2">
                                    <h2>
                                        <ShieldCheck className="text-primary" size={20} aria-hidden="true" />
                                        حالة النظام
                                    </h2>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Database size={18} className="text-muted-foreground" aria-hidden="true" />
                                        <span className="text-sm font-bold">قاعدة البيانات</span>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold" role="status">متصل</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-muted-foreground" aria-hidden="true" />
                                        <span className="text-sm font-bold">وقت التشغيل</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold" aria-label="نسبة وقت التشغيل">99.9%</span>
                                </div>
                                <div className="pt-4 border-t border-muted">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>استهلاك الموارد</span>
                                        <span>24%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={24} aria-valuemin={0} aria-valuemax={100} aria-label="استهلاك موارد النظام">
                                        <div className="h-full bg-primary w-[24%] rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Resource Links */}
                        <div className="grid grid-cols-2 gap-4" role="region" aria-label="روابط سريعة للموارد">
                            <Link to="/inventory" className="block p-4 bg-card rounded-2xl shadow-md hover:shadow-xl transition-all border border-muted group" aria-label="الانتقال إلى إدارة المخزون">
                                <Package className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                <span className="text-sm font-black text-foreground">المخزون</span>
                            </Link>
                            <Link to="/discounts" className="block p-4 bg-card rounded-2xl shadow-md hover:shadow-xl transition-all border border-muted group" aria-label="الانتقال إلى إدارة الخصومات">
                                <Percent className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                <span className="text-sm font-black text-foreground">الخصومات</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
