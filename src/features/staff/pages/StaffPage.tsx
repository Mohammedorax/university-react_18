import { useState, useMemo, useCallback } from 'react'
import { AddStaffDialog } from '@/features/staff/components/AddStaffDialog'
import { EditStaffDialog } from '@/features/staff/components/EditStaffDialog'
import { StaffDetailsDialog } from '@/features/staff/components/StaffDetailsDialog'
import { useStaff, useDeleteStaff } from '@/features/staff/hooks/useStaff'
import { useDebounce } from '@/hooks/use-debounce'
import { 
  Trash2, 
  Users, 
  Briefcase,
  Building2,
  Pencil,
  UserPlus,
  Info,
  UserX,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DataTable } from '@/components/DataTable'
import { StatCard } from '@/components/StatCard'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Staff } from '../types'
import { EmptyState } from '@/components/EmptyState'
import { List, LayoutGrid } from 'lucide-react'

const DEPARTMENTS = [
  'شؤون الطلاب',
  'المكتبة المركزية',
  'الشؤون المالية',
  'الموارد البشرية',
  'تقنية المعلومات'
]

/**
 * @page StaffPage
 * @description صفحة إدارة الموظفين الإداريين والفنيين في الجامعة.
 * تتيح الصفحة عرض قائمة الموظفين، البحث، التصفية حسب القسم، وإدارة بياناتهم (إضافة، تعديل، حذف).
 * تدعم الصفحة عرض البيانات بنظام الجدول أو الشبكة مع تصميم متجاوب وتوثيق كامل.
 */
export default function StaffPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [page, setPage] = useState(1)
  const [selectedStaff, setSelectedStaff] = useState<Staff[]>([])
  const limit = 10

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data, isLoading, refetch, isRefetching } = useStaff({
    query: debouncedSearch,
    department: selectedDepartment === 'all' ? undefined : selectedDepartment,
    page,
    limit
  })

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.info('تم تحديث بيانات الموظفين بنجاح')
    } catch (err) {
      toast.error('فشل تحديث البيانات')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setPage(1)
    toast.info('تمت إعادة تعيين فلاتر البحث')
  }

  const deleteStaffMutation = useDeleteStaff()
  
  const staff = useMemo(() => data?.items || [], [data?.items])
  const totalItems = data?.total || 0

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await deleteStaffMutation.mutateAsync(id)
        toast.success('تم حذف الموظف بنجاح')
      } catch (err) {
        toast.error('فشل في حذف الموظف')
      }
    }
  }, [deleteStaffMutation])

  /**
   * حذف مجموعة من الموظفين
   */
  const handleBulkDelete = useCallback(async (selectedStaff: Staff[]) => {
    if (window.confirm(`هل أنت متأكد من حذف ${selectedStaff.length} موظفين؟`)) {
      try {
        await Promise.all(selectedStaff.map(s => deleteStaffMutation.mutateAsync(s.id)))
        toast.success('تم حذف الموظفين المحددين بنجاح')
        setSelectedStaff([])
      } catch (err) {
        toast.error('حدث خطأ أثناء حذف بعض الموظفين')
      }
    }
  }, [deleteStaffMutation])

  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'الموظف',
      sortable: true,
      render: (_: string, item: Staff) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shadow-sm">
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-foreground">{item.name}</div>
            <div className="text-xs text-muted-foreground font-medium">{item.job_title}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'القسم',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary" className="font-bold rounded-lg px-3 py-1 bg-secondary/50 text-secondary-foreground border-none">
          <Building2 className="h-3 w-3 ml-1.5 opacity-70" />
          {value}
        </Badge>
      )
    },
    {
      key: 'contact',
      title: 'معلومات الاتصال',
      render: (_value: unknown, item: Staff) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <Mail className="h-3 w-3 ml-1.5 opacity-70" />
            {item.email}
          </div>
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <Phone className="h-3 w-3 ml-1.5 opacity-70" />
            {item.phone}
          </div>
        </div>
      )
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
      key: 'job_title',
      title: 'المسمى الوظيفي',
      sortable: true,
      hidden: true
    }
  ], [])

  const rowActions = useCallback((item: Staff) => (
    <div className="flex items-center justify-center gap-2">
      <StaffDetailsDialog staff={item} trigger={
        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary font-bold">
          التفاصيل
        </Button>
      } />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase px-3 py-2">الإجراءات</DropdownMenuLabel>
          <EditStaffDialog staff={item} trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer">
              <Pencil className="h-4 w-4" />
              تعديل البيانات
            </DropdownMenuItem>
          } />
          <DropdownMenuSeparator className="my-1 bg-muted" />
          <DropdownMenuItem 
            className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
            حذف الموظف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ), [handleDelete])

  return (
    <div className="min-h-screen bg-background/50 pb-10" dir="rtl" lang="ar" role="main" aria-labelledby="staff-page-title">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/95 text-primary-foreground pb-24 pt-12">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 translate-x-1/4 -translate-y-1/4" aria-hidden="true">
          <Briefcase size={400} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                <div className="bg-white/15 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 shadow-2xl ring-1 ring-white/20" aria-hidden="true">
                  <Users size={56} className="text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 id="staff-page-title" className="text-4xl md:text-5xl font-black mb-3 tracking-tight">إدارة الموظفين</h1>
                  <p className="text-primary-foreground/80 text-xl font-medium max-w-xl">
                    إدارة الكادر الإداري والفني، تنظيم الأقسام، ومتابعة بيانات الاتصال والوظائف.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className={cn(
                    "h-14 w-14 rounded-2xl shadow-2xl transition-all active:scale-95",
                    isRefetching && "animate-spin"
                  )}
                  onClick={handleRefresh}
                  aria-label="تحديث البيانات"
                  disabled={isRefetching}
                >
                  <RefreshCcw className="h-6 w-6" aria-hidden="true" />
                </Button>
                <AddStaffDialog trigger={
                  <Button size="lg" variant="secondary" className="font-black px-8 h-14 rounded-2xl shadow-2xl hover:shadow-secondary/20 transition-all active:scale-95 group focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-white" aria-label="إضافة موظف جديد للنظام">
                    <UserPlus className="ml-3 h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                    إضافة موظف جديد
                  </Button>
                } />
              </div>
            </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12" role="region" aria-label="إحصائيات الموظفين">
            <StatCard 
              title="إجمالي الموظفين" 
              value={totalItems} 
              icon={<Users className="h-6 w-6" aria-hidden="true" />}
              description="إجمالي القوى العاملة المسجلة"
            />
            <StatCard 
              title="الأقسام الإدارية" 
              value={DEPARTMENTS.length} 
              icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
              description="عدد الوحدات الإدارية النشطة"
            />
            <StatCard 
              title="المسمى الوظيفي" 
              value={staff.length} 
              icon={<Briefcase className="h-6 w-6" aria-hidden="true" />}
              description="موظفون معروضون حالياً"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <Card className="shadow-2xl border-none bg-background/80 backdrop-blur-xl rounded-[2rem] overflow-hidden ring-1 ring-black/5" role="region" aria-label="قائمة الموظفين وأدوات التحكم">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-muted">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                <div className="relative group flex-1 max-w-md">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} aria-hidden="true" />
                  <Input
                    placeholder="بحث عن موظف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-12 h-12 bg-muted/50 border-none rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    aria-label="البحث عن موظف بالاسم أو الوظيفة"
                  />
                </div>

                <div className="w-full md:w-72">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none font-bold focus:ring-2 focus:ring-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="تصفية حسب القسم">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <SelectValue placeholder="اختر القسم" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-muted shadow-2xl">
                      <SelectItem value="all" className="font-bold">جميع الأقسام</SelectItem>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* ARIA Live Region for Search Results */}
                <div className="sr-only" role="status" aria-live="polite">
                  {staff.length > 0 ? `تم العثور على ${totalItems} موظف` : 'لم يتم العثور على نتائج'}
                </div>
                
                <div className="flex bg-muted p-1 rounded-xl h-12 flex-1" role="group" aria-label="تبديل وضع العرض">
                  <ViewModeButton
                    active={viewMode === 'table'}
                    onClick={() => setViewMode('table')}
                    icon={List}
                    label="جدول"
                    className="flex-1 h-full"
                  />
                  <ViewModeButton
                    active={viewMode === 'grid'}
                    onClick={() => setViewMode('grid')}
                    icon={LayoutGrid}
                    label="شبكة"
                    className="flex-1 h-full"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                  onClick={handleResetFilters}
                  aria-label="إعادة ضبط الفلاتر"
                  title="إعادة ضبط الفلاتر"
                >
                  <RefreshCcw size={18} />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse" aria-busy="true" aria-label="جاري تحميل بيانات الموظفين">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-48 bg-muted rounded-[2rem]" aria-hidden="true" />
                ))}
              </div>
            ) : staff.length === 0 ? (
              <div className="py-24 px-6">
                <EmptyState
                  icon={UserX}
                  title="لا يوجد موظفون"
                  description="لم يتم العثور على أي موظف في هذا القسم حالياً أو يطابق بحثك."
                  actionLabel="إعادة تعيين الفلاتر"
                  onAction={handleResetFilters}
                />
              </div>
            ) : viewMode === 'table' ? (
              <div role="region" aria-label="جدول الموظفين">
                <DataTable 
                  data={staff}
                  columns={columns}
                  rowActions={rowActions}
                  onRowSelection={setSelectedStaff}
                  bulkActions={(selectedItems) => (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2 rounded-xl font-bold focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      onClick={() => handleBulkDelete(selectedItems)}
                      aria-label={`حذف ${selectedItems.length} موظفين محددين`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      حذف المحدد ({selectedItems.length})
                    </Button>
                  )}
                  searchPlaceholder="بحث عن موظف (الاسم، البريد، المسمى...)"
                  emptyMessage="لا يوجد موظفون يطابقون بحثك"
                  currentPage={page}
                  totalPages={Math.ceil(totalItems / limit)}
                  onPageChange={setPage}
                  totalItems={totalItems}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="شبكة الموظفين">
                {staff.map((item) => (
                  <Card key={item.id} className="group overflow-hidden rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-background hover:-translate-y-1 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-primary" role="listitem" aria-label={`موظف: ${item.name}`}>
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500" aria-hidden="true">
                            {item.name.charAt(0)}
                          </div>
                          <div className="flex gap-2">
                            <EditStaffDialog staff={item} trigger={
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary" aria-label={`تعديل بيانات ${item.name}`}>
                                <Pencil className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            } />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
                              onClick={() => handleDelete(item.id)}
                              aria-label={`حذف الموظف ${item.name}`}
                            >
                              <Trash2 className="h-5 w-5" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div id={`staff-name-${item.id}`}>
                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                            <p className="text-sm font-bold text-muted-foreground mt-1">{item.job_title}</p>
                          </div>

                          <div className="pt-4 border-t border-muted/50 space-y-3" role="group" aria-labelledby={`staff-name-${item.id}`}>
                            <div className="flex items-center text-sm font-bold text-foreground/70" aria-label={`القسم: ${item.department}`}>
                              <Building2 className="h-4 w-4 ml-2.5 text-primary opacity-60" aria-hidden="true" />
                              {item.department}
                            </div>
                            <div className="flex items-center text-sm font-bold text-foreground/70" aria-label={`البريد الإلكتروني: ${item.email}`}>
                              <Mail className="h-4 w-4 ml-2.5 text-primary opacity-60" aria-hidden="true" />
                              {item.email}
                            </div>
                            <div className="flex items-center text-sm font-bold text-foreground/70" aria-label={`رقم الهاتف: ${item.phone}`}>
                              <Phone className="h-4 w-4 ml-2.5 text-primary opacity-60" aria-hidden="true" />
                              {item.phone}
                            </div>
                          </div>

                          <StaffDetailsDialog staff={item} trigger={
                            <Button className="w-full mt-4 h-11 rounded-xl font-bold bg-muted hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={`عرض الملف الكامل للموظف ${item.name}`}>
                              عرض الملف الكامل
                            </Button>
                          } />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination for Grid View */}
            {viewMode === 'grid' && totalItems > limit && (
              <div className="mt-10 flex justify-center border-t border-muted pt-8 pb-10">
                <div className="flex items-center gap-2" role="navigation" aria-label="التنقل بين الصفحات">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-10 w-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="الصفحة السابقة"
                  >
                    <Search className="sr-only" /> {/* Just to keep the search icon import if needed, but wait I should use ChevronRight */}
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
                    className="h-10 w-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
