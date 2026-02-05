import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuthState } from '@/features/auth/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, DataTableColumn } from '@/components/DataTable'
import { StatCard } from '@/components/StatCard'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EditGradeDialog } from '@/features/grades/components/EditGradeDialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { useStudentGrades, useGradeStatistics, useCourseGrades } from '@/features/grades/hooks/useGrades'
import type { Grade } from '@/features/grades/types'
import { useCourses } from '@/features/courses/hooks/useCourses'
import { useStudents } from '@/features/students/hooks/useStudents'
import { Student } from '@/features/students/types'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { 
    Loader2, 
    Award, 
    Clock, 
    BookOpen, 
    MoreVertical, 
    Edit2, 
    Users, 
    GraduationCap, 
    Search,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    CheckCircle2,
    BarChart3,
    RefreshCcw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * صفحة سجل الدرجات الأكاديمي.
 * تعرض للطلاب درجاتهم ومعدلهم التراكمي، وللمعلمين إمكانية رصد وتعديل درجات طلابهم.
 * 
 * @page GradesPage
 * @returns {JSX.Element} صفحة الدرجات
 */
const GradesPage = () => {
    const { user } = useAuthState()
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)

    // React Query Hooks
    const { data: studentGrades = [], isLoading: isLoadingStudentGrades, error: studentError, refetch: refetchStudentGrades } = useStudentGrades(user?.role === 'student' ? user?.id || '' : '')
    const { data: statistics } = useGradeStatistics(user?.role === 'student' ? user?.id || '' : '')
    
    // Teacher specific hooks
    const { data: coursesResponse } = useCourses()
    const allCourses = useMemo(() => coursesResponse?.items || [], [coursesResponse])
    
    const { data: studentsResponse } = useStudents()
    const allStudents = useMemo(() => studentsResponse?.items || [], [studentsResponse])
    
    const { data: courseGrades = [], isLoading: isLoadingCourseGrades, error: courseError, refetch: refetchCourseGrades } = useCourseGrades(selectedCourse)

    const isLoading = user?.role === 'student' 
        ? isLoadingStudentGrades 
        : isLoadingCourseGrades
    const error = user?.role === 'student' ? studentError : (selectedCourse ? courseError : null)

    /**
     * معالج تحديث البيانات يدوياً
     */
    const handleRefresh = useCallback(async () => {
        try {
            if (user?.role === 'student') {
                await refetchStudentGrades()
            } else if (selectedCourse) {
                await refetchCourseGrades()
            }
            toast.success('تم تحديث البيانات بنجاح')
        } catch (err) {
            toast.error('فشل تحديث البيانات')
        }
    }, [user?.role, selectedCourse, refetchStudentGrades, refetchCourseGrades])

    /**
     * تغيير الصفحة الحالية في الترقيم
     * @param {number} newPage - رقم الصفحة الجديدة
     */
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    // Teacher View Calculations
    /**
     * قائمة المقررات التي يقوم المعلم بتدريسها
     */
    const teacherCourses = useMemo(() =>
        allCourses.filter((course) => course.teacher_id === user?.id || course.teacher_name === user?.name),
    [allCourses, user?.id, user?.name])

    /**
     * المقرر الدراسي المختار حالياً
     */
    const currentCourse = useMemo(() => 
        teacherCourses.find((c) => c.id === selectedCourse),
    [teacherCourses, selectedCourse])
    
    /**
     * قائمة الطلاب المسجلين في المقرر المختار مع تصفية البحث
     */
    const enrolledStudents = useMemo(() => {
        if (!selectedCourse) return []
        
        return allStudents.filter(s => {
            const matchesCourse = s.enrolled_courses.includes(selectedCourse)
            const matchesSearch = !searchTerm || 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.university_id.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesCourse && matchesSearch
        })
    }, [allStudents, selectedCourse, searchTerm])

    /**
     * خريطة درجات الطلاب للمقرر المختار (للوصول السريع بالمعرف)
     */
    const studentGradesMap = useMemo(() => {
        return courseGrades.reduce((acc: Record<string, any>, grade) => {
            acc[grade.student_id] = grade;
            return acc;
        }, {});
    }, [courseGrades]);

    /**
     * أعمدة جدول عرض درجات الطلاب (واجهة المعلم)
     */
    const teacherColumns: DataTableColumn<Student>[] = [
        {
            key: 'name',
            title: 'اسم الطالب',
            sortable: true,
            render: (value: unknown) => (
                <div className="font-medium">{value as string}</div>
            )
        },
        {
            key: 'university_id',
            title: 'الرقم الجامعي',
            sortable: true,
            render: (val: unknown) => <span className="font-mono text-xs">{val as string}</span>
        },
        {
            key: 'midterm_score',
            title: 'أعمال السنة',
            sortable: true,
            render: (value, student) => studentGradesMap[student.id]?.midterm_score || '-'
        },
        {
            key: 'final_score',
            title: 'النهائي',
            sortable: true,
            render: (value, student) => studentGradesMap[student.id]?.final_score || '-'
        },
        {
            key: 'total_score',
            title: 'المجموع',
            sortable: true,
            render: (value, student) => {
                const grade = studentGradesMap[student.id];
                return <span className="font-bold text-primary">{grade?.total_score?.toFixed(1) || '-'}</span>
            }
        },
        {
            key: 'letter_grade',
            title: 'التقدير',
            sortable: true,
            render: (value, student) => {
                const grade = studentGradesMap[student.id];
                if (!grade) return <span className="text-muted-foreground text-xs">لم يرصد</span>;
                return (
                    <Badge className={cn(
                        "font-bold",
                        grade.letter_grade === 'F' ? 'bg-destructive hover:bg-destructive/90' :
                        grade.letter_grade.startsWith('A') ? 'bg-primary hover:bg-primary/90' :
                        'bg-primary/80 hover:bg-primary/90'
                    )}>
                        {grade.letter_grade}
                    </Badge>
                )
            }
        }
    ];

    /**
     * إجراءات الصف لجدول المعلم (رصد/تعديل الدرجة)
     */
    const teacherRowActions = (student: Student) => (
        <EditGradeDialog 
            student_id={student.id}
            studentName={student.name}
            course={currentCourse}
            currentGrade={studentGradesMap[student.id]}
            trigger={
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all duration-300"
                    aria-label={`${studentGradesMap[student.id] ? 'تعديل' : 'رصد'} درجة الطالب ${student.name}`}
                >
                    <Edit2 size={14} aria-hidden="true" />
                    {studentGradesMap[student.id] ? 'تعديل الدرجة' : 'رصد الدرجة'}
                </Button>
            }
        />
    );

    /**
     * أعمدة جدول كشف الدرجات (واجهة الطالب)
     */
    const studentColumns: DataTableColumn<Grade>[] = [
        {
            key: 'course_name',
            title: 'المقرر',
            sortable: true,
            render: (_: unknown, grade: Grade) => (
                <div>
                    <div className="font-bold">{grade.course_name || '-'}</div>
                    <div className="text-xs text-muted-foreground font-mono">{grade.course_code || '-'}</div>
                </div>
            )
        },
        {
            key: 'semester',
            title: 'الفصل الدراسي',
            sortable: true,
            render: (_: unknown, grade: Grade) => `${grade.semester} ${grade.year}`
        },
        {
            key: 'credits',
            title: 'الساعات',
            sortable: true,
        },
        {
            key: 'midterm_score',
            title: 'أعمال السنة',
            sortable: true,
            render: (val: unknown) => (val as number | undefined) || '-'
        },
        {
            key: 'final_score',
            title: 'النهائي',
            sortable: true,
            render: (val: unknown) => (val as number | undefined) || '-'
        },
        {
            key: 'total_score',
            title: 'المجموع',
            sortable: true,
            render: (val: unknown) => <span className="font-bold text-primary">{(val as number).toFixed(1)}</span>
        },
        {
            key: 'letter_grade',
            title: 'التقدير',
            sortable: true,
            render: (val: unknown) => {
                const grade = val as string;
                return (
                    <Badge className={cn(
                        "font-bold",
                        grade === 'F' ? 'bg-destructive hover:bg-destructive/90' :
                        grade.startsWith('A') ? 'bg-primary hover:bg-primary/90' :
                        'bg-primary/80 hover:bg-primary/90'
                    )}>
                        {grade}
                    </Badge>
                )
            }
        }
    ]

    // Allow both students and teachers
    if (user?.role !== 'student' && user?.role !== 'teacher') {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">سجل الدرجات</h1>
                <p className="text-muted-foreground">هذه الصفحة متاحة للطلاب والمعلمين فقط.</p>
            </div>
        )
    }

    if (isLoading && !selectedCourse && user?.role === 'teacher') {
         // Should not block if just selecting course
    } else if (isLoading && user?.role === 'student') {
        return (
            <div className="min-h-screen bg-background pb-10">
                <div className="bg-primary/90 text-primary-foreground pb-32 pt-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                            <Skeleton className="h-20 w-20 rounded-2xl bg-primary-foreground/20" />
                            <div className="space-y-3 text-center md:text-right">
                                <Skeleton className="h-10 w-64 bg-primary-foreground/20" />
                                <Skeleton className="h-6 w-48 bg-primary-foreground/20" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 rounded-xl bg-primary-foreground/20" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 -mt-16 relative z-20">
                    <Card className="shadow-xl border-none">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-5 w-72" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
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
                <div className="text-destructive bg-destructive/10 p-4 rounded-lg text-center max-w-md">
                    <p className="font-bold mb-2">حدث خطأ أثناء جلب البيانات</p>
                    <p className="text-sm">{(error as any).message || 'يرجى المحاولة مرة أخرى لاحقاً'}</p>
                </div>
                <Button 
                    onClick={() => user?.role === 'student' ? refetchStudentGrades() : refetchCourseGrades()} 
                    variant="outline" 
                    className="gap-2"
                >
                    <RefreshCcw size={16} />
                    إعادة المحاولة
                </Button>
            </div>
        )
    }

    // Student View
    if (user?.role === 'student') {
        return (
            <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-24 pt-10 shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10" aria-hidden="true">
                        <Award size={300} />
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                            <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-2xl border border-primary-foreground/20 shadow-xl" aria-hidden="true">
                                <GraduationCap size={48} className="text-primary-foreground" />
                            </div>
                            <div className="text-center md:text-right">
                                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">سجل الدرجات الأكاديمي</h1>
                                <p className="text-primary-foreground/80 text-lg font-medium">متابعة الأداء الأكاديمي والمعدل التراكمي</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" role="region" aria-label="إحصائيات الأداء الأكاديمي">
                            <StatCard 
                                icon={TrendingUp} 
                                title="المعدل التراكمي (GPA)" 
                                value={statistics?.cumulative_gpa?.toFixed(2) || '0.00'} 
                                description="معدلك التراكمي في كافة الفصول"
                                variant="primary"
                            />
                            <StatCard 
                                icon={CheckCircle2} 
                                title="الساعات المكتسبة" 
                                value={(statistics?.earned_credits || 0).toString()} 
                                description="إجمالي عدد الساعات المجتازة"
                            />
                            <StatCard 
                                icon={BookOpen} 
                                title="إجمالي المقررات" 
                                value={(studentGrades?.length || 0).toString()} 
                                description="عدد المقررات المسجلة في السجل"
                            />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-16 relative z-20">
                    <Card className="shadow-2xl border-none bg-background/80 backdrop-blur-xl rounded-[2rem] overflow-hidden" role="region" aria-label="كشف الدرجات التفصيلي">
                        <CardHeader className="pb-4 border-b border-muted">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle asChild className="text-2xl font-black flex items-center gap-2">
                                        <h2>
                                            <Award className="h-6 w-6 text-primary" aria-hidden="true" />
                                            كشف الدرجات التفصيلي
                                        </h2>
                                    </CardTitle>
                                    <CardDescription className="font-medium mt-1">جميع المقررات التي تم دراستها ونتائجها</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {studentGrades && studentGrades.length > 0 ? (
                                <DataTable
                                    data={studentGrades}
                                    columns={studentColumns}
                                    pageSize={10}
                                    caption="كشف الدرجات الأكاديمي للطالب"
                                />
                            ) : (
                                <div className="py-24">
                                    <EmptyState
                                        icon={Award}
                                        title="لا توجد درجات مسجلة"
                                        description="لم يتم رصد أي درجات في سجلك الأكاديمي حتى الآن. سيتم عرض النتائج هنا بمجرد رصدها من قبل المعلمين."
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Teacher View
    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-24 pt-10 shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10" aria-hidden="true">
                    <Users size={300} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="bg-primary-foreground/10 backdrop-blur-md p-4 rounded-2xl border border-primary-foreground/20 shadow-xl" aria-hidden="true">
                            <Award size={48} className="text-primary-foreground" />
                        </div>
                        <div className="text-center md:text-right">
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">إدارة الدرجات الأكاديمية</h1>
                            <p className="text-primary-foreground/80 text-lg font-medium">رصد ومتابعة نتائج الطلاب في المقررات الدراسية</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" role="region" aria-label="إحصائيات إدارة الدرجات">
                        <StatCard
                            title="المقررات المسندة"
                            value={teacherCourses.length.toString()}
                            icon={BookOpen}
                            description="المقررات التي تقوم بتدريسها"
                        />
                        <StatCard
                            title="إجمالي الطلاب"
                            value={allStudents.length.toString()}
                            icon={Users}
                            description="إجمالي عدد الطلاب المسجلين"
                        />
                        <StatCard
                            title="متوسط الأداء العام"
                            value="85%"
                            icon={BarChart3}
                            description="مستوى أداء الطلاب الحالي"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <Card className="shadow-2xl border-none bg-background/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-6 border-b border-muted">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                                <div className="w-full lg:w-80">
                                    <Select value={selectedCourse} onValueChange={(val) => {
                                        setSelectedCourse(val)
                                        setPage(1)
                                    }}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold focus:ring-2 focus:ring-primary transition-all" aria-label="اختر المقرر لرصد الدرجات">
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                                <SelectValue placeholder="اختر المقرر الدراسي" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-muted shadow-2xl">
                                            {teacherCourses.map(course => (
                                                <SelectItem key={course.id} value={course.id} className="font-bold">
                                                    {course.name} ({course.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedCourse && (
                                    <div className="relative w-full md:w-64 group">
                                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                                        <Input
                                            placeholder="بحث عن طالب..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-12 pr-11 rounded-2xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary transition-all font-medium"
                                            aria-label="البحث عن الطلاب في هذا المقرر"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="rounded-2xl h-12 w-12 shadow-xl transition-all hover:scale-[1.05]" 
                                    onClick={handleRefresh}
                                    aria-label="تحديث البيانات"
                                    disabled={isLoading}
                                >
                                    <RefreshCcw size={20} className={cn(isLoading && "animate-spin")} aria-hidden="true" />
                                </Button>

                                {currentCourse && (
                                    <div className="flex items-center gap-4 bg-primary/5 px-6 py-2 rounded-2xl border border-primary/10">
                                        <div className="text-right">
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">المقرر الحالي</p>
                                            <p className="text-sm font-black text-foreground">{currentCourse.name}</p>
                                        </div>
                                        <div className="w-px h-8 bg-primary/20" />
                                        <div className="text-right">
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">عدد الطلاب</p>
                                            <p className="text-sm font-black text-foreground">{enrolledStudents.length}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {!selectedCourse ? (
                            <div className="py-24">
                                <EmptyState
                                    icon={BookOpen}
                                    title="اختر مقرراً دراسياً"
                                    description="يرجى اختيار مقرر دراسي من القائمة أعلاه لعرض قائمة الطلاب ورصد درجاتهم."
                                />
                            </div>
                        ) : enrolledStudents.length === 0 ? (
                            <div className="py-24">
                                <EmptyState
                                    icon={Users}
                                    title="لا يوجد طلاب مسجلون"
                                    description="لا يوجد طلاب مسجلون في هذا المقرر حالياً."
                                />
                            </div>
                        ) : (
                            <DataTable
                                data={enrolledStudents}
                                columns={teacherColumns}
                                rowActions={teacherRowActions}
                                pageSize={10}
                                caption={`قائمة درجات طلاب مقرر ${currentCourse?.name}`}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default GradesPage