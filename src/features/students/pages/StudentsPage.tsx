import { useState, useMemo, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AddStudentDialog } from '@/features/students/components/AddStudentDialog'
import { EditStudentDialog } from '@/features/students/components/EditStudentDialog'
import { StudentDetailsDialog } from '@/features/students/components/StudentDetailsDialog'
import {
  Trash2,
  Users,
  LayoutGrid,
  List,
  GraduationCap,
  UserPlus,
  Pencil,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  MoreHorizontal,
  Info
} from 'lucide-react'
import { StudentFilters } from '../components/StudentFilters'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { useStudents, useDeleteStudent } from '@/features/students/hooks/useStudents'
import { useDebounce } from '@/hooks/use-debounce'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { EmptyState } from '@/components/EmptyState'
import { DataTable } from '@/components/DataTable'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Student } from '../types'

const DEPARTMENTS = [
  'علوم الحاسب',
  'هندسة البرمجيات',
  'نظم المعلومات',
  'الذكاء الاصطناعي',
  'الأمن السيبراني'
]

const YEARS = ['1', '2', '3', '4']

/**
 * صفحة إدارة الطلاب - تتيح للمسؤولين عرض، إضافة، تعديل، وحذف بيانات الطلاب
 * 
 * @component
 * @returns {JSX.Element} صفحة الطلاب مع البحث المتقدم والتصفية ووضعيات العرض المختلفة
 */
export default function StudentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; studentId?: string; bulk?: Student[]; description?: string
  }>({ open: false })

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: studentsResponse, isLoading, error, refetch, isRefetching } = useStudents({
    query: debouncedSearch,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    page,
    limit: 30 // Reasonable default; virtualization handles rendering performance
  })

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.info('تم تحديث بيانات الطلاب بنجاح')
    } catch (err) {
      toast.error('فشل تحديث البيانات')
    }
  }

  const handleResetFilters = () => {
    setSelectedDepartment('all')
    setSelectedYear('all')
    setSearchTerm('')
    setPage(1)
    toast.info('تمت إعادة تعيين فلاتر البحث')
  }

  const deleteStudentMutation = useDeleteStudent()

  const totalItems = studentsResponse?.total || 0
  const limit = 10

  // تصفية محلية للسنة الدراسية لأن API قد لا يدعمها حالياً بشكل مباشر
  const students = useMemo(() => {
    let items = studentsResponse?.items || []
    if (selectedYear !== 'all') {
      items = items.filter(s => s.year.toString() === selectedYear)
    }
    return items
  }, [studentsResponse?.items, selectedYear])

  /**
   * معالج حذف بيانات طالب مع التأكيد
   * 
   * @async
   * @function handleDelete
   * @param {string} id - المعرف الفريد للطالب المراد حذفه
   * @returns {Promise<void>}
   */
  const handleDelete = useCallback((id: string) => {
    setConfirmDialog({ open: true, studentId: id, description: 'هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع البيانات المرتبطة به.' })
  }, [])

  const handleBulkDelete = useCallback((students: Student[]) => {
    setConfirmDialog({ open: true, bulk: students, description: `هل أنت متأكد من حذف ${students.length} طلاب؟ لا يمكن التراجع عن هذا الإجراء.` })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (confirmDialog.bulk) {
        const results = await Promise.allSettled(
          confirmDialog.bulk.map(s => deleteStudentMutation.mutateAsync(s.id))
        )
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.length - successful

        if (successful > 0) {
          toast.success(`تم حذف ${successful} طالب بنجاح`)
        }
        if (failed > 0) {
          toast.error(`فشل حذف ${failed} طالب. يرجى المحاولة مرة أخرى.`)
        }
      } else if (confirmDialog.studentId) {
        await deleteStudentMutation.mutateAsync(confirmDialog.studentId)
        toast.success('تم حذف الطالب بنجاح')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    } finally {
      setConfirmDialog({ open: false })
    }
  }, [confirmDialog, deleteStudentMutation])

  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'الطالب',
      sortable: true,
      render: (_: string, student: Student) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-sm">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-foreground">{student.name}</div>
            <div className="text-xs text-muted-foreground font-medium">{student.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'university_id',
      title: 'الرقم الجامعي',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-bold text-muted-foreground">{value}</span>
      )
    },
    {
      key: 'department',
      title: 'القسم',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary" className="font-bold bg-primary/5 text-primary border-none px-3 py-1 rounded-lg">
          {value}
        </Badge>
      )
    },
    {
      key: 'year',
      title: 'السنة الدراسية',
      sortable: true,
      hidden: true
    },
    {
      key: 'email',
      title: 'البريد الإلكتروني',
      sortable: true,
      hidden: true
    },
    {
      key: 'phone',
      title: 'رقم الهاتف',
      sortable: true,
      hidden: true
    },
    {
      key: 'gpa',
      title: 'المعدل (GPA)',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                value >= 3.5 ? "bg-primary" :
                  value >= 3.0 ? "bg-primary/80" :
                    value >= 2.5 ? "bg-primary/60" : "bg-destructive"
              )}
              style={{ width: `${(value / 4) * 100}%` }}
            />
          </div>
          <span className="font-black text-foreground">{value.toFixed(2)}</span>
        </div>
      )
    }
  ], [])

  const rowActions = useCallback((student: Student) => (
    <div className="flex items-center justify-center gap-2">
      <StudentDetailsDialog
        student={student}
        trigger={
          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary font-bold">
            التفاصيل
          </Button>
        }
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase px-3 py-2">الإجراءات</DropdownMenuLabel>
          <EditStudentDialog student={student} trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer">
              <Pencil className="h-4 w-4" />
              تعديل البيانات
            </DropdownMenuItem>
          } />
          <DropdownMenuSeparator className="my-1 bg-muted" />
          <DropdownMenuItem
            className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            onClick={() => handleDelete(student.id)}
          >
            <Trash2 className="h-4 w-4" />
            حذف الطالب
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ), [handleDelete])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-10" dir="rtl" role="status" aria-busy="true" aria-label="جاري تحميل بيانات الطلاب">
        <div className="bg-primary/90 text-primary-foreground pb-24 pt-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl bg-primary-foreground/20" aria-hidden="true" />
                <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
              </div>
              <Skeleton className="h-5 w-80 bg-primary-foreground/20" />
            </div>
            <Skeleton className="h-12 w-40 rounded-2xl bg-primary-foreground/20" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
          <Card className="border-none shadow-xl bg-card rounded-3xl mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" aria-hidden="true" />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4" dir="rtl" role="alert">
        <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 flex items-center justify-center text-destructive">
          <Info size={40} aria-hidden="true" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h2>
          <p className="text-muted-foreground mb-6">{String(error || 'يرجى المحاولة مرة أخرى لاحقاً')}</p>

        </div>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCcw size={16} aria-hidden="true" />
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar" role="main">
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {students.length > 0
            ? `تم العثور على ${totalItems} طالب`
            : 'لم يتم العثور على نتائج'}
        </div>
        <div className="bg-primary/90 text-primary-foreground pb-24 pt-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/10 p-2.5 rounded-2xl backdrop-blur-md border border-primary-foreground/20 shadow-xl" aria-hidden="true">
                  <GraduationCap className="text-primary-foreground h-6 w-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">إدارة الطلاب</h1>
              </div>
              <p className="text-primary-foreground/80 font-medium flex items-center gap-2">
                <Users size={16} className="text-primary-foreground" aria-hidden="true" />
                متابعة وإدارة كافة شؤون الطلاب المسجلين في النظام
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "rounded-2xl h-12 w-12 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                  isRefetching && "animate-spin"
                )}
                onClick={handleRefresh}
                aria-label="تحديث البيانات"
                disabled={isRefetching}
              >
                <RefreshCcw size={20} aria-hidden="true" />
              </Button>
              <AddStudentDialog
                trigger={
                  <Button variant="secondary" className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" aria-label="إضافة طالب جديد">
                    <UserPlus size={20} aria-hidden="true" />
                    إضافة طالب جديد
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        <div className="page-container -mt-16 relative z-20">
          <Card className="card-unified shadow-2xl overflow-hidden mb-8">
            <CardHeader className="p-6 border-b">
              <StudentFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onReset={handleResetFilters}
                departments={DEPARTMENTS}
                years={YEARS}
              />
            </CardHeader>
          </Card>

          {/* Content Section */}
          {viewMode === 'table' ? (
            <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden" role="region" aria-label="جدول بيانات الطلاب">
              <CardContent className="p-0">
                <DataTable
                  data={students}
                  columns={columns}
                  rowActions={rowActions}
                  isLoading={isLoading}
                  onRowSelection={setSelectedStudents}
                  virtualized={students.length > 50}
                  virtualHeight={600}
                  bulkActions={(selectedItems) => (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 rounded-xl font-bold"
                      onClick={() => handleBulkDelete(selectedItems)}
                      aria-label={`حذف ${selectedItems.length} طلاب محددين`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      حذف المحدد ({selectedItems.length})
                    </Button>
                  )}
                  searchPlaceholder="بحث في النتائج الحالية..."
                  emptyMessage="لم يتم العثور على طلاب يطابقون معايير البحث"
                  currentPage={page}
                  totalPages={Math.ceil(totalItems / limit)}
                  onPageChange={setPage}
                  totalItems={totalItems}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="region" aria-label="عرض شبكي للطلاب">
                {students.length === 0 ? (
                  <div className="col-span-full py-24">
                    <EmptyState
                      icon={Users}
                      title="لا يوجد طلاب"
                      description="لم يتم العثور على نتائج تطابق معايير البحث الحالية."
                      actionLabel="إعادة تعيين الفلاتر"
                      onAction={handleResetFilters}
                    />
                  </div>
                ) : (
                  students.map((student) => (
                    <article key={student.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-card rounded-3xl" aria-label={`بطاقة الطالب: ${student.name}`}>
                      <div
                        className={cn(
                          "h-2 w-full",
                          student.gpa >= 3.5 ? "bg-primary" :
                            student.gpa >= 3.0 ? "bg-primary/80" :
                              student.gpa >= 2.5 ? "bg-primary/60" : "bg-destructive"
                        )}
                        role="progressbar"
                        aria-valuenow={student.gpa}
                        aria-valuemin={0}
                        aria-valuemax={4}
                        aria-label="مؤشر المعدل التراكمي"
                      />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                            {student.name.charAt(0)}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-foreground">{student.gpa.toFixed(2)}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">GPA SCORE</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="font-black text-xl text-foreground leading-tight group-hover:text-primary transition-colors">{student.name}</h3>
                          <p className="text-sm font-mono font-bold text-muted-foreground mt-1" aria-label={`الرقم الجامعي: ${student.university_id}`}>{student.university_id}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="rounded-lg font-bold border-primary/20 text-primary bg-primary/5" aria-label={`القسم: ${student.department}`}>
                              {student.department}
                            </Badge>
                            <Badge variant="outline" className="rounded-lg font-bold border-muted-foreground/20 text-muted-foreground" aria-label={`السنة الدراسية: ${student.year}`}>
                              السنة {student.year}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-muted/50">
                          <StudentDetailsDialog
                            student={student}
                            trigger={
                              <Button className="flex-1 rounded-xl font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none transition-all" aria-label={`عرض ملف الطالب ${student.name}`}>
                                عرض الملف
                              </Button>
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" aria-label="خيارات إضافية">
                                <MoreHorizontal size={20} aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl">
                              <EditStudentDialog student={student} trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold cursor-pointer">
                                  <Pencil className="h-4 w-4" aria-hidden="true" />
                                  تعديل
                                </DropdownMenuItem>
                              } />
                              <DropdownMenuItem
                                className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 cursor-pointer"
                                onClick={() => handleDelete(student.id)}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </article>
                  ))
                )}
              </div>

              {/* Pagination for Grid View */}
              {viewMode === 'grid' && totalItems > limit && (
                <div className="mt-10 flex justify-center border-t border-muted pt-8 pb-10">
                  <div className="flex items-center gap-2" role="navigation" aria-label="التنقل بين الصفحات">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-10 w-10 rounded-xl"
                      aria-label="الصفحة السابقة"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </Button>

                    <div className="flex items-center gap-2 px-4" aria-live="polite">
                      <span className="text-sm font-bold text-muted-foreground">صفحة</span>
                      <span className="text-sm font-black text-foreground">{page}</span>
                      <span className="text-sm font-bold text-muted-foreground">من</span>
                      <span className="text-sm font-black text-foreground">{Math.ceil(totalItems / limit)}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.min(Math.ceil(totalItems / limit), p + 1))}
                      disabled={page >= Math.ceil(totalItems / limit)}
                      className="h-10 w-10 rounded-xl"
                      aria-label="الصفحة التالية"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title="تأكيد الحذف"
        description={confirmDialog.description || 'هل أنت متأكد من تنفيذ هذه العملية؟'}
        confirmLabel="نعم، احذف"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
