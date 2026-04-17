import { useState, useMemo, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AddTeacherDialog } from '@/features/teachers/components/AddTeacherDialog'
import { EditTeacherDialog } from '@/features/teachers/components/EditTeacherDialog'
import { TeacherDetailsDialog } from '@/features/teachers/components/TeacherDetailsDialog'
import { TeacherFilters } from '@/features/teachers/components/TeacherFilters'
import { useTeachers, useDeleteTeacher } from '@/features/teachers/hooks/useTeachers'
import { Teacher } from '@/features/teachers/types'
import { useDebounce } from '@/hooks/use-debounce'
import { EmptyState } from '@/components/EmptyState'
import { DataTable, DataTableColumn } from '@/components/data-table'
import { ViewModeButton } from '@/components/ViewModeButton'
import {
  Trash2,
  Users,
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  BookOpen,
  UserPlus,
  Briefcase,
  Pencil,
  UserX,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Award,
  CheckCircle2,
  Filter,
  RefreshCcw,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleAvatar } from '@/components/RoleAvatar'

/**
 * صفحة إدارة أعضاء هيئة التدريس.
 * تتيح للمسؤولين عرض، إضافة، تعديل، وحذف المدرسين، مع خيارات بحث وتصفية متقدمة.
 * 
 * @page TeachersPage
 * @returns {JSX.Element} صفحة إدارة المدرسين
 */
export default function TeachersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [page, setPage] = useState(1)
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; teacherId?: string; bulk?: Teacher[]; description?: string
  }>({ open: false })
  const limit = 8

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data, isLoading, error, refetch } = useTeachers({
    query: debouncedSearch,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    page,
    limit
  })

  const deleteTeacherMutation = useDeleteTeacher()

  const teachers = useMemo(() => data?.items || [], [data?.items])
  const totalItems = data?.total || 0
  const totalPages = data?.totalPages || 1

  /**
   * تغيير الصفحة الحالية في الترقيم
   * @param {number} newPage - رقم الصفحة الجديدة
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const departments = useMemo(() => [
    'علوم الحاسب',
    'هندسة البرمجيات',
    'نظم المعلومات',
    'الذكاء الاصطناعي',
    'الأمن السيبراني'
  ], [])

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setPage(1)
    toast.info('تمت إعادة تعيين فلاتر البحث')
  }, [])

  /**
   * حذف مدرس من النظام
   * @param {string} id - المعرف الفريد للمدرس
   */
  const handleDelete = useCallback((id: string) => {
    setConfirmDialog({ open: true, teacherId: id, description: 'هل أنت متأكد من حذف هذا المدرس؟' })
  }, [])

  /**
   * حذف مجموعة من المدرسين
   */
  const handleBulkDelete = useCallback((selectedTeachers: Teacher[]) => {
    setConfirmDialog({ open: true, bulk: selectedTeachers, description: `هل أنت متأكد من حذف ${selectedTeachers.length} مدرسين؟` })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (confirmDialog.bulk) {
        const results = await Promise.allSettled(
          confirmDialog.bulk.map(t => deleteTeacherMutation.mutateAsync(t.id))
        )
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.length - successful

        if (successful > 0) {
          toast.success(`تم حذف ${successful} مدرس بنجاح`)
        }
        if (failed > 0) {
          toast.error(`فشل حذف ${failed} مدرس. يرجى المحاولة مرة أخرى.`)
        }
        if (failed === 0) {
          setSelectedTeachers([])
        }
      } else if (confirmDialog.teacherId) {
        await deleteTeacherMutation.mutateAsync(confirmDialog.teacherId)
        toast.success('تم حذف المدرس بنجاح')
      }
    } catch (err) {
      toast.error('فشل في عملية الحذف')
    } finally {
      setConfirmDialog({ open: false })
    }
  }, [confirmDialog, deleteTeacherMutation])

  /**
   * تعريف أعمدة الجدول الموحد
   */
  const columns: DataTableColumn<Teacher>[] = [
    {
      key: 'name',
      title: 'المدرس',
      sortable: true,
      render: (_, teacher) => (
        <div className="flex items-center gap-4">
          <RoleAvatar userRole="teacher" name={teacher.name} className="h-12 w-12 rounded-2xl shadow-sm" />
          <div>
            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{teacher.name}</div>
            <div className="text-xs text-muted-foreground font-medium">{teacher.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'القسم',
      sortable: true,
      render: (value: unknown) => (
        <Badge variant="secondary" className="font-bold bg-primary/5 text-primary border-none px-3 py-1 rounded-lg">
          {value as string}
        </Badge>
      )
    },
    {
      key: 'specialization',
      title: 'التخصص',
      sortable: true,
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
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
          <CheckCircle2 size={16} aria-hidden="true" />
          {value === 'active' ? 'نشط' : 'غير نشط'}
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <div className="bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl bg-primary-foreground/20" />
                <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
              </div>
              <Skeleton className="h-5 w-80 bg-primary-foreground/20" />
            </div>
            <Skeleton className="h-12 w-40 rounded-2xl bg-primary-foreground/20" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 sm:-mt-16 relative z-20">
          <Card className="border-none shadow-xl bg-card rounded-3xl mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl bg-card rounded-[2rem] overflow-hidden text-center p-10">
          <div className="bg-destructive/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-destructive">
            <Info size={48} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-foreground tracking-tight">حدث خطأ أثناء تحميل البيانات</h2>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            {String(error || 'فشل في تحميل بيانات المدرسين. يرجى التحقق من الاتصال والمحاولة مرة أخرى.')}

          </p>
          <Button
            onClick={() => refetch()}
            className="w-full gap-2 rounded-2xl h-14 font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-primary-foreground"
          >
            <RefreshCcw size={20} />
            إعادة المحاولة الآن
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar" role="main" aria-labelledby="teachers-page-title">
        {/* Header Section with Primary Background */}
        <div className="bg-primary/90 text-primary-foreground pb-16 pt-6 sm:pb-24 sm:pt-10 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/20 p-2.5 rounded-2xl backdrop-blur-md" aria-hidden="true">
                  <GraduationCap className="text-primary-foreground h-6 w-6" />
                </div>
                <h1 id="teachers-page-title" className="text-xl sm:text-3xl font-black tracking-tight">إدارة أعضاء هيئة التدريس</h1>
              </div>
              <p className="text-primary-foreground/80 font-medium flex items-center gap-2">
                <Users size={16} aria-hidden="true" />
                متابعة وإدارة كافة شؤون المدرسين والأكاديميين
              </p>
            </div>

            <AddTeacherDialog
              trigger={
                <Button className="rounded-2xl h-12 px-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" aria-label="إضافة مدرس جديد للنظام">
                  <UserPlus size={20} aria-hidden="true" />
                  إضافة مدرس جديد
                </Button>
              }
            />
          </div>
        </div>

        <div className="page-container -mt-10 sm:-mt-16 relative z-20">
          <Card className="card-unified shadow-2xl overflow-hidden mb-8">
            <CardHeader className="p-6 border-b">
              <TeacherFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onReset={handleResetFilters}
                departments={departments}
                resultsCountMessage={
                  teachers.length > 0
                    ? `تم العثور على ${teachers.length} مدرسين`
                    : teachers.length === 0 && searchTerm
                      ? 'لم يتم العثور على نتائج'
                      : ''
                }
              />
            </CardHeader>
          </Card>

          {/* Content Section */}
          <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden" role="region" aria-label="قائمة المدرسين">
            <CardContent className="p-0">
              {teachers.length === 0 ? (
                <div className="py-24 px-6">
                  <EmptyState
                    icon={UserX}
                    title="لا يوجد مدرسين"
                    description="لم يتم العثور على مدرسين يطابقون معايير البحث الحالية. جرب تغيير الكلمات المفتاحية أو القسم المختار."
                    actionLabel="إعادة تعيين الفلاتر"
                    onAction={handleResetFilters}
                  />
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className={cn(viewMode === 'grid' && "hidden")} role="region" aria-label="جدول المدرسين">
                    <DataTable
                      data={teachers}
                      columns={columns}
                      pageSize={limit}
                      onRowSelection={setSelectedTeachers}
                      searchPlaceholder="بحث بالاسم، القسم، أو التخصص..."
                      onPageChange={handlePageChange}
                      totalPages={totalPages}
                      currentPage={page}
                      totalItems={totalItems}
                      bulkActions={(selectedItems) => (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2 rounded-xl font-bold"
                          onClick={() => handleBulkDelete(selectedItems)}
                          aria-label={`حذف ${selectedItems.length} مدرسين محددين`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          حذف المحدد ({selectedItems.length})
                        </Button>
                      )}
                      rowActions={(teacher) => (
                        <>
                          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase px-3 py-2">الإجراءات</DropdownMenuLabel>
                          <EditTeacherDialog teacher={teacher} trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold text-foreground focus:bg-primary/10 focus:text-primary" aria-label={`تعديل بيانات ${teacher.name}`}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              تعديل البيانات
                            </DropdownMenuItem>
                          } />
                          <DropdownMenuSeparator className="my-1 bg-muted" />
                          <DropdownMenuItem
                            className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => handleDelete(teacher.id)}
                            aria-label={`حذف المدرس ${teacher.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            حذف المدرس
                          </DropdownMenuItem>
                        </>
                      )}
                      customRowActions={(teacher) => (
                        <TeacherDetailsDialog
                          teacher={teacher}
                          trigger={
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary font-bold" aria-label={`تفاصيل المدرس ${teacher.name}`}>
                              التفاصيل
                            </Button>
                          }
                        />
                      )}
                    />
                  </div>

                  {/* Mobile/Grid Card View */}
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6",
                    viewMode === 'table' && "md:hidden"
                  )} role="list" aria-label="بطاقات المدرسين">
                    {teachers.map((teacher) => (
                      <Card key={teacher.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-card rounded-3xl" role="listitem">
                        <div className="h-2 w-full bg-primary/20" aria-hidden="true" />
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <RoleAvatar userRole="teacher" name={teacher.name} className="h-14 w-14 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500" />
                            <Badge variant="secondary" className="font-bold bg-primary/5 text-primary border-none px-3 py-1 rounded-lg">
                              {teacher.department}
                            </Badge>
                          </div>

                          <div className="mb-6">
                            <h3 className="font-black text-xl text-foreground leading-tight group-hover:text-primary transition-colors">{teacher.name}</h3>
                            <p className="text-sm font-medium text-muted-foreground mt-1">{teacher.specialization}</p>
                          </div>

                          <div className="flex items-center gap-4 py-4 border-y border-muted mb-6" role="presentation">
                            <div className="flex-1">
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">البريد الإلكتروني</p>
                              <p className="text-xs font-bold text-foreground truncate" dir="ltr">{teacher.email}</p>
                            </div>
                            <div className="w-px h-8 bg-muted" aria-hidden="true" />
                            <div className="flex-1 text-left">
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">الحالة</p>
                              <p className="text-xs font-bold text-primary">نشط</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <TeacherDetailsDialog
                              teacher={teacher}
                              trigger={
                                <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-lg" aria-label={`عرض تفاصيل ${teacher.name}`}>
                                  عرض الملف
                                </Button>
                              }
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-muted hover:bg-muted/80" aria-label={`خيارات إضافية لـ ${teacher.name}`}>
                                  <MoreHorizontal size={20} aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl">
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase px-3 py-2">الإجراءات المتاحة</DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1 bg-muted" />
                                <EditTeacherDialog teacher={teacher} trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold" aria-label={`تعديل بيانات ${teacher.name}`}>
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                    تعديل البيانات
                                  </DropdownMenuItem>
                                } />
                                <DropdownMenuSeparator className="my-1 bg-muted" />
                                <DropdownMenuItem
                                  className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => handleDelete(teacher.id)}
                                  aria-label={`حذف المدرس ${teacher.name}`}
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  حذف المدرس
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Grid View Pagination */}
                  {viewMode === 'grid' && totalItems > limit && (
                    <div className="mt-10 flex justify-center border-t border-muted pt-8 pb-10">
                      <div className="flex items-center gap-2" role="navigation" aria-label="التنقل بين الصفحات">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="h-10 w-10 rounded-xl"
                          aria-label="الصفحة السابقة"
                        >
                          <span className="sr-only">السابق</span>
                          <svg className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>

                        <div className="flex items-center gap-2 px-4" aria-live="polite">
                          <span className="text-sm font-bold text-muted-foreground">صفحة</span>
                          <span className="text-sm font-black text-foreground">{page}</span>
                          <span className="text-sm font-bold text-muted-foreground">من</span>
                          <span className="text-sm font-black text-foreground">{totalPages}</span>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                          disabled={page >= totalPages}
                          className="h-10 w-10 rounded-xl"
                          aria-label="الصفحة التالية"
                        >
                          <span className="sr-only">التالي</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
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
