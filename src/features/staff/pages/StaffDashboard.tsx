import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/StatCard'
import { DataTable } from '@/components/DataTable'
import { BaseAreaChart } from '@/components/charts/BaseCharts'
import { useStudents } from '@/features/students/hooks/useStudents'
import { Student } from '@/features/students/types'
import { useCourses } from '@/features/courses/hooks/useCourses'
import { cn } from '@/lib/utils'
import { 
    Package, 
    Percent, 
    LayoutDashboard,
    Users,
    TrendingUp,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Briefcase,
    RefreshCcw,
    Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'

export default function StaffDashboard() {
    const navigate = useNavigate()
    const { user } = useAuthState()
    const queryClient = useQueryClient()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    
    const { data: studentsData } = useStudents({ limit: 10 })
    const { data: coursesData } = useCourses({ limit: 1 })

    const totalStudents = useMemo(() => studentsData?.total || 0, [studentsData])
    const totalCourses = useMemo(() => coursesData?.total || 0, [coursesData])

    /**
     * معالجة تحديث البيانات
     */
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['students'] }),
                queryClient.invalidateQueries({ queryKey: ['courses'] })
            ])
            toast.success('تم تحديث البيانات بنجاح', {
                description: 'تمت مزامنة بيانات الطلاب والمقررات.',
            })
        } catch (error) {
            toast.error('فشل تحديث البيانات', {
                description: 'يرجى المحاولة مرة أخرى لاحقاً.',
            })
        } finally {
            setIsRefreshing(false)
        }
    }, [queryClient])

    const recentStudents = useMemo(() => {
        const students = studentsData?.items || []
        if (!debouncedSearchTerm) return students.slice(0, 5)
        
        return students.filter(student => 
            student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            student.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ).slice(0, 5)
    }, [studentsData, debouncedSearchTerm])

    const studentColumns = [
        { key: 'name', title: 'الاسم الكامل', sortable: true },
        { key: 'department', title: 'القسم', sortable: true },
        { 
            key: 'status', 
            title: 'الحالة',
            render: (value: string, item: Student) => (
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    value === 'active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                    {value === 'active' ? 'نشط' : 'قيد الانتظار'}
                </span>
            )
        }
    ]

    // بيانات تجريبية للنمو
    const growthData = [
        { name: 'يناير', value: 400 },
        { name: 'فبراير', value: 300 },
        { name: 'مارس', value: 600 },
        { name: 'أبريل', value: 800 },
        { name: 'مايو', value: 500 },
        { name: 'يونيو', value: 900 },
    ]

    return (
        <div className="space-y-8 p-1 animate-in fade-in duration-700" dir="rtl" lang="ar">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        لوحة تحكم الموظف
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">مرحباً بك مجدداً، {user?.name}. إليك ملخص العمليات اليومية.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-xl h-11 w-11 border-muted hover:bg-primary/5 hover:text-primary transition-all" 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="تحديث البيانات"
                    >
                        <RefreshCcw size={18} className={cn(isRefreshing && "animate-spin")} aria-hidden="true" />
                    </Button>
                    <div className="hidden md:flex flex-col items-end px-4 border-l">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">اليوم</span>
                        <span className="text-sm font-black" aria-label={`اليوم هو ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}`}>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <Button onClick={() => navigate('/inventory')} className="rounded-2xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20" aria-label="الذهاب إلى إدارة المخزون">
                        <Package className="h-4 w-4" aria-hidden="true" />
                        إدارة المخزون
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="إحصائيات سريعة">
                <StatCard
                    title="إجمالي الطلاب"
                    value={totalStudents.toString()}
                    icon={Users}
                    description="الطلاب المسجلين في النظام"
                    variant="primary"
                />
                <StatCard
                    title="المقررات المتاحة"
                    value={totalCourses.toString()}
                    icon={Briefcase}
                    description="المقررات الدراسية النشطة"
                />
                <StatCard
                    title="المخزون"
                    value="124"
                    icon={Package}
                    description="عناصر المخزون الحالية"
                />
                <StatCard
                    title="المنح النشطة"
                    value="45"
                    icon={Percent}
                    description="طلاب مستفيدون من المنح"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Growth Chart */}
                <Card className="lg:col-span-4 rounded-3xl shadow-sm border-muted/50 overflow-hidden bg-gradient-to-br from-card to-muted/20" role="region" aria-label="نمو الطلاب">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle asChild className="text-xl font-black flex items-center gap-2">
                                    <h2>
                                        <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                                        نشاط التسجيل
                                    </h2>
                                </CardTitle>
                                <CardDescription className="font-medium mt-1">نمو تسجيل الطلاب خلال الأشهر الأخيرة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] mt-4">
                            <BaseAreaChart 
                                data={growthData} 
                                dataKey="value"
                                categoryKey="name"
                                ariaLabel="رسم بياني لنمو الطلاب"
                                tableCaption="جدول بيانات نمو الطلاب الشهري"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="lg:col-span-3 rounded-3xl shadow-sm border-muted/50" role="region" aria-label="روابط سريعة">
                    <CardHeader>
                        <CardTitle asChild className="text-xl font-black flex items-center gap-2">
                            <h2>
                                <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                                روابط سريعة
                            </h2>
                        </CardTitle>
                        <CardDescription className="font-medium">الوصول السريع لمهام الموظف</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            variant="outline" 
                            className="w-full justify-between h-14 rounded-2xl font-bold hover:bg-primary/5 hover:border-primary/30 group"
                            onClick={() => navigate('/admin/students')}
                            aria-label="الانتقال إلى إدارة شؤون الطلاب"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                                    <Users className="h-4 w-4" />
                                </div>
                                إدارة شؤون الطلاب
                            </div>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-between h-14 rounded-2xl font-bold hover:bg-primary/5 hover:border-primary/30 group"
                            onClick={() => navigate('/inventory')}
                            aria-label="الانتقال إلى إدارة المخزون والمستلزمات"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                                    <Package className="h-4 w-4" />
                                </div>
                                إدارة المخزون والمستلزمات
                            </div>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-between h-14 rounded-2xl font-bold hover:bg-primary/5 hover:border-primary/30 group"
                            onClick={() => navigate('/discounts')}
                            aria-label="الانتقال إلى إدارة الخصومات والمنح"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                                    <Percent className="h-4 w-4" />
                                </div>
                                إدارة الخصومات والمنح
                            </div>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-between h-14 rounded-2xl font-bold hover:bg-primary/5 hover:border-primary/30 group"
                            onClick={() => navigate('/courses')}
                            aria-label="الانتقال إلى استعراض المقررات الدراسية"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" aria-hidden="true">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                استعراض المقررات الدراسية
                            </div>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Students Section */}
            <Card className="rounded-3xl shadow-sm border-muted/50 overflow-hidden" role="region" aria-label="أحدث الطلاب المسجلين">
                <CardHeader className="bg-muted/30 border-b border-muted/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                        <div>
                            <CardTitle asChild className="text-xl font-black flex items-center gap-2">
                                <h2>
                                    <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                                    أحدث الطلاب المسجلين
                                </h2>
                            </CardTitle>
                            <CardDescription className="font-medium mt-1">قائمة بآخر الطلاب المنضمين للنظام</CardDescription>
                        </div>
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="بحث في الطلاب..."
                                className="w-full pr-10 pl-4 py-2 bg-background border border-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="البحث في أحدث الطلاب"
                            />
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        className="text-primary font-bold hover:bg-primary/10 w-full md:w-auto"
                        onClick={() => navigate('/admin/students')}
                        aria-label="عرض جميع الطلاب المسجلين"
                    >
                        عرض الكل
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={recentStudents}
                        columns={studentColumns}
                        pageSize={5}
                        emptyMessage="لا يوجد طلاب مسجلين مؤخراً"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
