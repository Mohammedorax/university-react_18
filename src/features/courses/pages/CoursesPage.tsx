import { useDebounce } from '@/hooks/use-debounce'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { AddCourseDialog } from '@/features/courses/components/AddCourseDialog';
import { EditCourseDialog } from '@/features/courses/components/EditCourseDialog';
import { CourseDetailsDialog } from '@/features/courses/components/CourseDetailsDialog';
import {
    Loader2,
    Trash2,
    UserPlus,
    UserMinus,
    BookOpen,
    Users,
    GraduationCap,
    Info,
    LayoutGrid,
    List,
    Pencil,
    RefreshCcw,
    Clock,
    Search,
    FileSpreadsheet,
    FileText,
    Download
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCourses, useDeleteCourse, useEnrollStudentInCourse, useUnenrollStudentFromCourse } from '@/features/courses/hooks/useCourses'
import { useStudent } from '@/features/students/hooks/useStudents'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/data-table'
import { CoursesFilters } from '../components/CoursesFilters';
import { StatCard } from '@/components/StatCard'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Course } from '../types'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

/**
 * @page CoursesPage
 * @description صفحة إدارة المقررات الدراسية التي تتيح عرض، إضافة، تعديل، وحذف المقررات.
 * تدعم الصفحة البحث المتقدم، التصفية حسب القسم، والتبديل بين وضع الجدول والشبكة.
 * توفر واجهة مخصصة لكل من المسؤول، المدرس، والطالب (للتسجيل في المقررات).
 */
const CoursesPage = () => {
    const { user } = useAuthState()

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [page, setPage] = useState(1)
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
    const limit = 8

    // React Query Hooks
    const { data, isLoading, isRefetching, error, refetch } = useCourses({
        query: debouncedSearch,
        department: selectedDepartment,
        page,
        limit
    })

    // Reset page when search or department changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, selectedDepartment])

    const courses = useMemo(() => data?.items || [], [data?.items])
    const totalItems = data?.total || 0
    const totalPages = Math.ceil(totalItems / limit)

    const { data: currentStudent } = useStudent(user?.role === 'student' ? user?.id || '' : '')

    const enrollMutation = useEnrollStudentInCourse()
    const unenrollMutation = useUnenrollStudentFromCourse()
    const deleteMutation = useDeleteCourse()

    /**
     * معالج تحديث البيانات يدوياً
     */
    const handleRefresh = useCallback(async () => {
        try {
            await refetch()
            toast.success('تم تحديث قائمة المقررات')
        } catch (err) {
            toast.error('فشل تحديث البيانات')
        }
    }, [refetch])

    /**
     * معالج إعادة ضبط جميع الفلاتر
     */
    const handleResetFilters = useCallback(() => {
        setSearchTerm('')
        setSelectedDepartment('all')
        setPage(1)
        toast.success('تم إعادة ضبط جميع الفلاتر بنجاح')
    }, [])

    /**
     * معالج تصدير بيانات المقررات
     */
    const [isExporting, setIsExporting] = useState(false)
    const handleExport = useCallback(async (type: 'Excel' | 'PDF') => {
        setIsExporting(true)
        try {
            if (type === 'Excel') {
                const { saveAs } = await import('file-saver');
                const XLSX = await import('xlsx');

                const exportData = courses.map(course => ({
                    'اسم المقرر': course.name,
                    'رمز المقرر': course.code,
                    'القسم': course.department,
                    'الساعات المعتمدة': course.credits,
                    'المدرس': course.teacher_name,
                    'الطلاب المسجلين': course.enrolled_students,
                    'السعة القصوى': course.max_students
                }));

                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "المقررات");

                // إضافة دعم RTL لملف Excel
                worksheet['!dir'] = 'rtl';

                if (!workbook.Workbook) workbook.Workbook = {};
                if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
                if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
                workbook.Workbook.Views[0].RTL = true;

                // تطبيق محاذاة RTL لجميع الخلايا
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cell_address]) continue;
                        if (!worksheet[cell_address].s) worksheet[cell_address].s = {};

                        worksheet[cell_address].s.alignment = {
                            horizontal: 'right',
                            readingOrder: 2 // RTL
                        };
                    }
                }

                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                saveAs(data, `المقررات_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
            } else {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');

                const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

                // إضافة خط يدعم العربية (بافتراض وجوده أو استخدام الخط الافتراضي مع تحسينات)
                // ملاحظة: jspdf يحتاج لخط خارجي لدعم العربية بشكل كامل، هنا نستخدم الإعدادات الأساسية

                const tableData = courses.map(course => [
                    course.max_students,
                    course.enrolled_students,
                    course.teacher_name,
                    course.credits,
                    course.department,
                    course.code,
                    course.name
                ]);

                autoTable(doc, {
                    head: [['السعة', 'المسجلين', 'المدرس', 'الساعات', 'القسم', 'الرمز', 'المقرر']],
                    body: tableData,
                    styles: { font: 'helvetica', halign: 'right' },
                    headStyles: { fillColor: [79, 70, 229], halign: 'right' },
                    theme: 'grid',
                    margin: { top: 20 }
                });

                doc.save(`المقررات_${new Date().toLocaleDateString('ar-EG')}.pdf`);
            }
            toast.success(`تم تصدير البيانات بصيغة ${type} بنجاح`)
        } catch (err) {
            logger.error('Export error:', err);
            toast.error('فشل تصدير البيانات')
        } finally {
            setIsExporting(false)
        }
    }, [courses])

    // Common departments memoized
    const departments = useMemo(() => [
        'علوم الحاسب',
        'هندسة البرمجيات',
        'نظم المعلومات',
        'الذكاء الاصطناعي',
        'الأمن السيبراني'
    ], [])

    const handleEnroll = useCallback(async (courseId: string) => {
        if (!user) return
        try {
            await enrollMutation.mutateAsync({ studentId: user.id, courseId })
            toast.success('تم التسجيل في المقرر بنجاح')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'فشل التسجيل في المقرر';
            toast.error(errorMessage)
        }
    }, [user, enrollMutation])

    const handleUnenroll = useCallback(async (courseId: string) => {
        if (!user) return
        try {
            await unenrollMutation.mutateAsync({ studentId: user.id, courseId })
            toast.success('تم إلغاء التسجيل بنجاح')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'فشل إلغاء التسجيل';
            toast.error(errorMessage)
        }
    }, [user, unenrollMutation])

    const handleDelete = useCallback(async (courseId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقرر؟')) {
            try {
                await deleteMutation.mutateAsync(courseId)
                toast.success('تم حذف المقرر بنجاح')
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'فشل حذف المقرر';
                toast.error(errorMessage)
            }
        }
    }, [deleteMutation])

    /**
     * معالج حذف مجموعة من المقررات مع التأكيد
     */
    const handleBulkDelete = useCallback(async (selectedCourses: Course[]) => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedCourses.length} مقررات؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            try {
                await Promise.all(selectedCourses.map(c => deleteMutation.mutateAsync(c.id)))
                toast.success('تم حذف المقررات المحددة بنجاح')
            } catch (err) {
                toast.error('حدث خطأ أثناء حذف بعض المقررات')
            }
        }
    }, [deleteMutation])

    const isEnrolled = useCallback((courseId: string) => {
        if (user?.role !== 'student') return false
        return currentStudent?.enrolled_courses.includes(courseId) || false
    }, [user?.role, currentStudent?.enrolled_courses])


    /**
     * تعريف أعمدة الجدول الموحد للمقررات
     */
    const columns = useMemo(() => [
        {
            key: 'name',
            title: 'المقرر',
            sortable: true,
            render: (_: string, course: Course) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-sm">
                        {course.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-foreground">{course.name}</div>
                        <div className="text-xs text-muted-foreground font-medium">{course.code}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'department',
            title: 'القسم',
            sortable: true,
            render: (value: string) => (
                <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">
                    {value}
                </Badge>
            )
        },
        {
            key: 'credits',
            title: 'الساعات',
            sortable: true,
            render: (value: number) => (
                <div className="flex items-center gap-2 font-bold text-foreground/80">
                    <Clock className="h-3 w-3" />
                    {value} ساعة
                </div>
            )
        },
        {
            key: 'instructor',
            title: 'المدرس',
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {value?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium">{value}</span>
                </div>
            )
        },
        {
            key: 'code',
            title: 'رمز المقرر',
            sortable: true,
            hidden: true
        },
        {
            key: 'enrolled_students',
            title: 'الطلاب',
            sortable: true,
            render: (value: number, course: Course) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{course.enrolled_students}/{course.max_students}</span>
                </div>
            )
        }
    ], []);

    const rowActions = useMemo(() => [
        {
            label: 'تفاصيل',
            icon: <Info className="h-4 w-4" />,
            onClick: (course: Course) => {
                // Details action - could open a details dialog
            }
        },
        {
            label: 'تعديل',
            icon: <Pencil className="h-4 w-4" />,
            show: user?.role === 'admin' || user?.role === 'teacher',
            onClick: (course: Course) => {
                // Edit action - could open edit dialog
            }
        },
        {
            label: isEnrolled('') ? 'إلغاء التسجيل' : 'تسجيل',
            icon: isEnrolled('') ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />,
            show: user?.role === 'student',
            onClick: (course: Course) => {
                if (isEnrolled(course.id)) {
                    handleUnenroll(course.id);
                } else {
                    handleEnroll(course.id);
                }
            }
        },
        {
            label: 'حذف',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const,
            show: user?.role === 'admin' || user?.role === 'teacher',
            onClick: (course: Course) => handleDelete(course.id)
        }
    ], [user, handleDelete, handleEnroll, handleUnenroll, isEnrolled]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-10" role="alert" aria-busy="true" aria-label="جاري تحميل المقررات الدراسية">
                <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <Skeleton className="h-20 w-20 rounded-2xl bg-primary-foreground/20" aria-hidden="true" />
                                <div className="space-y-3">
                                    <Skeleton className="h-10 w-64 bg-primary-foreground/20" aria-hidden="true" />
                                    <Skeleton className="h-6 w-96 bg-primary-foreground/20" aria-hidden="true" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-40 bg-primary-foreground/20" aria-hidden="true" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl bg-primary-foreground/20" aria-hidden="true" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 -mt-10 sm:-mt-16 relative z-20">
                    <Card className="shadow-xl border-none">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <Skeleton className="h-10 w-full md:max-w-md" aria-hidden="true" />
                                <Skeleton className="h-10 w-full lg:w-[400px]" aria-hidden="true" />
                                <Skeleton className="h-10 w-20" aria-hidden="true" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <Skeleton key={i} className="h-[350px] w-full rounded-xl" aria-hidden="true" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 flex items-center justify-center text-destructive">
                    <Info size={40} />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h2>
                    <p className="text-muted-foreground mb-6">{String(error || 'يرجى المحاولة مرة أخرى لاحقاً')}</p>

                </div>
                <Button onClick={() => refetch()} className="gap-2">
                    <RefreshCcw size={16} />
                    إعادة المحاولة
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10 shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10" aria-hidden="true">
                    <BookOpen size={300} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                            <div className="bg-background/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in duration-500" aria-hidden="true">
                                <BookOpen size={48} className="text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">المقررات الدراسية</h1>
                                <p className="text-primary-foreground/80 text-xl font-medium max-w-2xl">تصفح وإدارة المقررات الدراسية المتاحة في الجامعة</p>
                            </div>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <AddCourseDialog />
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700" role="region" aria-label="إحصائيات سريعة">
                        <StatCard
                            icon={BookOpen}
                            title="إجمالي المقررات"
                            value={totalItems.toString()}
                            description="عدد المقررات المسجلة في النظام"
                        />
                        <StatCard
                            icon={GraduationCap}
                            title="الأقسام"
                            value={departments.length.toString()}
                            description="عدد الأقسام الأكاديمية"
                        />
                        <StatCard
                            icon={Users}
                            title="إجمالي الطلاب المسجلين"
                            value="850+"
                            description="الطلاب المسجلين في كافة المقررات"
                        />
                    </div>
                </div>
            </div>

            <div className="page-container -mt-10 sm:-mt-16 relative z-20">
                <Card className="card-unified shadow-2xl overflow-hidden mb-8">
                    <CardHeader className="pb-6 border-b border-muted">
                        <CoursesFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedDepartment={selectedDepartment}
                            setSelectedDepartment={setSelectedDepartment}
                            departments={departments}
                            handleRefresh={handleRefresh}
                            handleResetFilters={handleResetFilters}
                            handleExport={handleExport}
                            isExporting={isExporting}
                            isRefetching={isRefetching}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            setPage={setPage}
                        />

                        {/* ARIA Live Region for Search Results */}
                        <div
                            className="sr-only"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {courses.length > 0
                                ? `تم العثور على ${totalItems} مقرر`
                                : 'لم يتم العثور على نتائج'}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {viewMode === 'grid' ? (
                            <div className="p-6" role="region" aria-label="عرض شبكي للمقررات">
                                {courses.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {courses.map((course) => (
                                                <article key={course.id} className="group hover:shadow-2xl transition-all duration-300 border-muted/50 overflow-hidden rounded-2xl bg-card border flex flex-col h-full" aria-label={`مقرر: ${course.name}`}>
                                                    <div className="p-0 relative h-32 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center overflow-hidden">
                                                        <BookOpen className="h-16 w-16 text-white/20 absolute -right-4 -bottom-4 rotate-12 transition-transform group-hover:scale-125" aria-hidden="true" />
                                                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl shadow-xl border border-white/30 z-10" aria-hidden="true">
                                                            {course.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="p-5 space-y-4 flex-1">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="secondary" className="font-bold text-[10px] tracking-wider uppercase">
                                                                    {course.code}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-[10px] font-bold opacity-70">
                                                                    {course.department}
                                                                </Badge>
                                                            </div>
                                                            <h3 className="font-black text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                                {course.name}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground line-clamp-2 font-medium min-h-[32px]">
                                                                {course.description}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-muted/30 p-2 rounded-xl border border-muted/50">
                                                                <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">الساعات</p>
                                                                <div className="flex items-center gap-1.5 font-black text-sm">
                                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                                    {course.credits}
                                                                </div>
                                                            </div>
                                                            <div className="bg-muted/30 p-2 rounded-xl border border-muted/50">
                                                                <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">الطلاب</p>
                                                                <div className="flex items-center gap-1.5 font-black text-sm">
                                                                    <Users className="h-3.5 w-3.5 text-primary" />
                                                                    {course.enrolled_students}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 pt-2 border-t border-muted/50">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                {course.teacher_name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-0.5">المدرس</p>
                                                                <p className="text-xs font-black line-clamp-1">{course.teacher_name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-5 pb-5 pt-0 flex gap-2 mt-auto">
                                                        <CourseDetailsDialog course={course} trigger={
                                                            <Button variant="secondary" className="flex-1 h-10 rounded-xl font-bold gap-2 text-xs" aria-label="عرض تفاصيل المقرر">
                                                                <Info size={14} />
                                                                تفاصيل
                                                            </Button>
                                                        } />

                                                        {user?.role === 'student' && (
                                                            <Button
                                                                variant={isEnrolled(course.id) ? "destructive" : "default"}
                                                                className="flex-1 h-10 rounded-xl font-bold gap-2 text-xs"
                                                                onClick={() => isEnrolled(course.id) ? handleUnenroll(course.id) : handleEnroll(course.id)}
                                                                disabled={enrollMutation.isPending || unenrollMutation.isPending}
                                                            >
                                                                {isEnrolled(course.id) ? (
                                                                    <>
                                                                        <UserMinus size={14} />
                                                                        إلغاء
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserPlus size={14} />
                                                                        تسجيل
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}

                                                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                                                            <div className="flex gap-2 w-full">
                                                                <EditCourseDialog course={course} trigger={
                                                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                                                                        <Pencil size={14} />
                                                                    </Button>
                                                                } />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-10 w-10 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 transition-all"
                                                                    onClick={() => handleDelete(course.id)}
                                                                    disabled={deleteMutation.isPending}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>

                                        {/* Pagination for Grid View */}
                                        {totalPages > 1 && (
                                            <div className="mt-10 border-t pt-6 flex justify-center">
                                                <Pagination>
                                                    <PaginationContent className="bg-muted/30 p-1 rounded-2xl border border-muted/50 backdrop-blur-sm">
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                                className={cn(
                                                                    "rounded-xl cursor-pointer hover:bg-background transition-all",
                                                                    page === 1 && "pointer-events-none opacity-50"
                                                                )}
                                                                aria-label="الصفحة السابقة"
                                                            />
                                                        </PaginationItem>

                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                            <PaginationItem key={pageNum}>
                                                                <PaginationLink
                                                                    onClick={() => setPage(pageNum)}
                                                                    isActive={page === pageNum}
                                                                    className={cn(
                                                                        "rounded-xl cursor-pointer transition-all w-10 h-10",
                                                                        page === pageNum ? "bg-primary text-primary-foreground shadow-lg scale-110" : "hover:bg-background"
                                                                    )}
                                                                >
                                                                    {pageNum}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        ))}

                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                                className={cn(
                                                                    "rounded-xl cursor-pointer hover:bg-background transition-all",
                                                                    page === totalPages && "pointer-events-none opacity-50"
                                                                )}
                                                                aria-label="الصفحة التالية"
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="bg-muted/50 p-6 rounded-full mb-4">
                                            <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-black mb-2">لم يتم العثور على مقررات</h3>
                                        <p className="text-muted-foreground max-w-sm">لم يتم العثور على أي مقررات تطابق معايير البحث الحالية.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <DataTable
                                data={courses}
                                columns={columns}
                                searchPlaceholder="بحث في المقررات الحالية..."
                                emptyMessage="لا توجد مقررات دراسية تطابق بحثك"
                                onRowSelection={setSelectedCourses} // تمكين التحديد المتعدد
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                totalItems={totalItems}
                                pageSize={limit}
                                bulkActions={(selectedItems) => (user?.role === 'admin' || user?.role === 'teacher') && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2 rounded-xl font-bold"
                                        onClick={() => {
                                            handleBulkDelete(selectedItems);
                                            setSelectedCourses([]); // مسح التحديد بعد الحذف
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        حذف المحدد ({selectedItems.length})
                                    </Button>
                                )}
                                customRowActions={(course) => (
                                    <>
                                        <CourseDetailsDialog course={course} trigger={
                                            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-bold h-9 rounded-lg">
                                                <Info className="h-4 w-4" />
                                                التفاصيل
                                            </Button>
                                        } />
                                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                                            <EditCourseDialog course={course} trigger={
                                                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-bold h-9 rounded-lg">
                                                    <Pencil className="h-4 w-4" />
                                                    تعديل
                                                </Button>
                                            } />
                                        )}
                                        {user?.role === 'student' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("w-full justify-start gap-2 font-bold h-9 rounded-lg", isEnrolled(course.id) && "text-destructive hover:text-destructive hover:bg-destructive/5")}
                                                onClick={() => isEnrolled(course.id) ? handleUnenroll(course.id) : handleEnroll(course.id)}
                                            >
                                                {isEnrolled(course.id) ? (
                                                    <>
                                                        <UserMinus className="h-4 w-4" />
                                                        إلغاء التسجيل
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4" />
                                                        تسجيل في المقرر
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CoursesPage
