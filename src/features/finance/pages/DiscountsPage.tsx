import { Trash2, Percent, Coins, CheckCircle, XCircle, Search, Filter, Info, Plus, RefreshCcw, TicketX, LayoutGrid, List, MoreHorizontal, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { useDiscounts, useDeleteDiscount, useUpdateDiscount } from '@/features/finance/hooks/useDiscounts'
import { AddDiscountDialog } from '@/features/finance/components/AddDiscountDialog'
import { EditDiscountDialog } from '@/features/finance/components/EditDiscountDialog'
import { DiscountDetailsDialog } from '@/features/finance/components/DiscountDetailsDialog'
import { toast } from 'sonner'
import { useMemo, useState, useCallback } from 'react'
import { DataTable, DataTableColumn } from '@/components/DataTable'
import { StatCard } from '@/components/StatCard'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Discount } from '@/services/mockApi'

/**
 * @page DiscountsPage
 * @description صفحة إدارة الخصومات والمنح الدراسية.
 * تتيح هذه الصفحة للمسؤولين استعراض، إضافة، تعديل، وحذف الخصومات والمنح المتاحة للطلاب.
 * تدعم الصفحة عرض البيانات بتنسيق شبكي (Grid) أو جدول (Table)، مع إمكانية البحث والفلترة.
 * 
 * @returns {JSX.Element} صفحة إدارة الخصومات
 */
export default function DiscountsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed_amount'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(1)
  const [selectedDiscounts, setSelectedDiscounts] = useState<Discount[]>([])
  const limit = 9
  
  const { data: discounts = [], isLoading, error, refetch, isRefetching } = useDiscounts();
  const deleteDiscountMutation = useDeleteDiscount();
  const updateDiscountMutation = useUpdateDiscount();

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.info('تم تحديث بيانات الخصومات بنجاح')
    } catch (err) {
      toast.error('فشل تحديث البيانات')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setPage(1)
    toast.info('تمت إعادة تعيين فلاتر البحث')
  }

  /**
   * تصفية الخصومات بناءً على نص البحث ونوع الخصم
   */
  const filteredDiscounts = useMemo(() => {
    return discounts.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           d.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || d.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [discounts, searchTerm, typeFilter])

  const paginatedDiscounts = useMemo(() => {
    const start = (page - 1) * limit
    return filteredDiscounts.slice(start, start + limit)
  }, [filteredDiscounts, page, limit])

  /**
   * حساب الإحصائيات الحالية للخصومات
   */
  const stats = useMemo(() => {
    const active = discounts.filter(d => d.active).length
    const percentage = discounts.filter(d => d.type === 'percentage').length
    const fixedAmount = discounts.filter(d => d.type === 'fixed_amount').length
    return { active, percentage, fixedAmount, total: discounts.length }
  }, [discounts])

  /**
   * حذف خصم محدد
   * @param {string} id - معرف الخصم المراد حذفه
   */
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الخصم؟')) {
      try {
        await deleteDiscountMutation.mutateAsync(id)
        toast.success('تم حذف الخصم بنجاح')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الخصم';
        toast.error(errorMessage)
      }
    }
  }, [deleteDiscountMutation])

  /**
   * حذف مجموعة من الخصومات
   */
  const handleBulkDelete = useCallback(async (selected: Discount[]) => {
    if (window.confirm(`هل أنت متأكد من حذف ${selected.length} خصومات؟`)) {
      try {
        await Promise.all(selected.map(d => deleteDiscountMutation.mutateAsync(d.id)))
        toast.success('تم حذف الخصومات المحددة بنجاح')
        setSelectedDiscounts([])
      } catch (err) {
        toast.error('حدث خطأ أثناء حذف بعض الخصومات')
      }
    }
  }, [deleteDiscountMutation])

  /**
   * تغيير حالة تنشيط الخصم
   * @param {string} id - معرف الخصم
   * @param {boolean} currentStatus - الحالة الحالية للخصم
   */
  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await updateDiscountMutation.mutateAsync({ id, data: { active: !currentStatus } })
      toast.success(currentStatus ? 'تم تعطيل الخصم' : 'تم تفعيل الخصم')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث حالة الخصم';
      toast.error(errorMessage)
    }
  }, [updateDiscountMutation])

  /**
   * تعريف أعمدة الجدول الموحد
   */
  const columns: DataTableColumn<Discount>[] = [
    {
      key: 'name',
      title: 'الاسم',
      sortable: true,
      render: (_, row: Discount) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.name}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.description}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'النوع',
      sortable: true,
      render: (val: string) => (
        <Badge variant="outline">
          {val === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
        </Badge>
      )
    },
    {
      key: 'value',
      title: 'القيمة',
      sortable: true,
      render: (val: number, row: Discount) => (
        <span className="font-mono font-bold">
          {val}{row.type === 'percentage' ? '%' : ' ر.س'}
        </span>
      )
    },
    {
      key: 'active',
      title: 'الحالة',
      sortable: true,
      render: (val: boolean) => (
        <Badge className={val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {val ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    }
  ]

  /**
   * تعريف الإجراءات المتاحة لكل صف في الجدول
   * @param {any} row - بيانات الخصم في الصف الحالي
   * @returns {JSX.Element} مجموعة أزرار الإجراءات
   */
  const rowActions = (row: Discount) => (
    <div className="flex gap-2">
      <DiscountDetailsDialog 
        discount={row}
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
          <EditDiscountDialog discount={row} trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl px-3 py-2.5 gap-3 font-bold text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer">
              <Pencil className="h-4 w-4" />
              تعديل البيانات
            </DropdownMenuItem> 
          } />
          <DropdownMenuItem 
            className="rounded-xl px-3 py-2.5 gap-3 font-bold text-foreground focus:bg-primary/10 focus:text-primary cursor-pointer"
            onClick={() => handleToggleActive(row.id, row.active)}
          >
            {row.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {row.active ? 'تعطيل الخصم' : 'تفعيل الخصم'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-muted" />
          <DropdownMenuItem 
            className="rounded-xl px-3 py-2.5 gap-3 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
            حذف الخصم
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  /**
   * معالج تغيير نص البحث
   * @param {React.ChangeEvent<HTMLInputElement>} e - حدث التغيير في حقل الإدخال
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <div className="relative overflow-hidden bg-primary/90 pb-32 pt-12">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-3xl bg-primary-foreground/20" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-64 bg-primary-foreground/20" />
                  <Skeleton className="h-6 w-96 bg-primary-foreground/20" />
                </div>
              </div>
              <Skeleton className="h-12 w-40 rounded-xl bg-primary-foreground/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl bg-primary-foreground/20" />
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <Skeleton className="h-24 w-full rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
            ))}
          </div>
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
          <p className="text-muted-foreground mb-6">{(error as Error).message || 'يرجى المحاولة مرة أخرى لاحقاً'}</p>
        </div>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCcw size={16} />
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10" dir="rtl" role="main" aria-labelledby="discounts-title">
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {filteredDiscounts.length > 0 
          ? `تم العثور على ${filteredDiscounts.length} خصم` 
          : 'لم يتم العثور على نتائج'}
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-32 pt-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5" aria-hidden="true">
          <Percent size={400} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
              <div className="bg-primary-foreground/10 backdrop-blur-md p-5 rounded-3xl border border-primary-foreground/20 shadow-2xl" aria-hidden="true">
                <Percent size={56} className="text-primary-foreground" />
              </div>
              <div>
                <h1 id="discounts-title" className="text-3xl md:text-5xl font-black mb-3 tracking-tight">إدارة الخصومات</h1>
                <p className="text-primary-foreground/80 text-lg max-w-xl font-medium">تعريف وإدارة المنح الدراسية، الخصومات الأخوية، والمنح التفوقية للطلاب</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="secondary" 
                className={cn(
                  "h-12 w-12 rounded-2xl shadow-xl transition-all active:scale-95",
                  isRefetching && "animate-spin"
                )}
                onClick={handleRefresh}
                aria-label="تحديث البيانات"
                disabled={isRefetching}
              >
                <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              </Button>
              <ViewModeButton 
                active={viewMode === 'grid'} 
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                icon={viewMode === 'grid' ? LayoutGrid : List}
                label={viewMode === 'grid' ? 'عرض جدولي' : 'عرض شبكي'}
              />
              <AddDiscountDialog />
            </div>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="إحصائيات الخصومات">
            <StatCard
              title="إجمالي الخصومات"
              value={stats.total}
              icon={Percent}
              variant="primary"
              description="عدد كافة أنواع الخصومات المتاحة"
            />
            <StatCard
              title="الخصومات النشطة"
              value={stats.active}
              icon={CheckCircle}
              variant="primary"
              description="عدد الخصومات المفعلة حالياً"
            />
            <StatCard
              title="نسبة مئوية"
              value={stats.percentage}
              icon={Filter}
              variant="primary"
              description="الخصومات التي تعتمد النسبة المئوية"
            />
            <StatCard
              title="مبلغ ثابت"
              value={stats.fixedAmount}
              icon={Coins}
              variant="primary"
              description="الخصومات التي تعتمد مبالغ ثابتة"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        {/* Filters Bar */}
        <Card className="mb-8 shadow-xl border-none">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input 
                  placeholder="بحث عن خصم بالاسم أو الوصف..." 
                  className="pr-10 bg-background border-input focus:bg-background transition-all rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="البحث في الخصومات"
                />
              </div>
              <div className="flex gap-2" role="group" aria-label="تصفية حسب نوع الخصم">
                <Button 
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('all')}
                  className="rounded-xl px-6 font-bold"
                  aria-pressed={typeFilter === 'all'}
                >
                  الكل
                </Button>
                <Button 
                  variant={typeFilter === 'percentage' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('percentage')}
                  className="gap-2 rounded-xl px-6 font-bold"
                  aria-pressed={typeFilter === 'percentage'}
                >
                  <Percent size={16} aria-hidden="true" />
                  نسبة
                </Button>
                <Button 
                  variant={typeFilter === 'fixed_amount' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('fixed_amount')}
                  className="gap-2 rounded-xl px-6 font-bold"
                  aria-pressed={typeFilter === 'fixed_amount'}
                >
                  <Coins size={16} aria-hidden="true" />
                  مبلغ
                </Button>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                  onClick={handleResetFilters}
                  aria-label="إعادة ضبط الفلاتر"
                  title="إعادة ضبط الفلاتر"
                >
                  <RefreshCcw size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Content */}
        <div aria-live="polite">
          {viewMode === 'table' ? (
            <Card className="border-none shadow-xl overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredDiscounts}
                searchPlaceholder="البحث في الخصومات..."
                customRowActions={rowActions}
                currentPage={page}
                totalPages={Math.ceil(filteredDiscounts.length / limit)}
                onPageChange={setPage}
                totalItems={filteredDiscounts.length}
              />
            </Card>
          ) : (
            /* Discounts Grid */
            filteredDiscounts.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={TicketX}
                  title="لا توجد خصومات مطابقة"
                  description="لم يتم العثور على أي خصومات تطابق معايير البحث الحالية. جرب تغيير كلمات البحث أو الفلاتر المطبقة."
                  actionLabel="إعادة تعيين البحث"
                  onAction={handleResetFilters}
                />
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedDiscounts.map((discount) => (
                  <Card 
                    key={discount.id} 
                    className={cn(
                      "overflow-hidden hover:shadow-2xl transition-all duration-500 border-none shadow-lg group relative",
                      !discount.active && "opacity-80"
                    )}
                    role="article"
                    aria-labelledby={`discount-name-${discount.id}`}
                  >
                    <div className={cn(
                      "h-2 w-full",
                      discount.type === 'percentage' ? 'bg-primary' : 'bg-primary/60'
                    )} aria-hidden="true" />
                    
                    <CardHeader className="pb-4 pt-6 px-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={cn(
                          "px-3 py-1 rounded-full font-bold text-xs uppercase tracking-tighter",
                          discount.type === 'percentage' 
                            ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                            : 'bg-primary/5 text-primary/80 hover:bg-primary/10'
                        )}>
                          {discount.type === 'percentage' ? 'خصم مئوي' : 'مبلغ ثابت'}
                        </Badge>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleToggleActive(discount.id, discount.active)}
                            className={cn(
                              "h-9 w-9 rounded-xl shadow-sm",
                              discount.active ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-muted'
                            )}
                            aria-label={discount.active ? 'تعطيل الخصم' : 'تفعيل الخصم'}
                          >
                            {discount.active ? <CheckCircle size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleDelete(discount.id)}
                            className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 shadow-sm"
                            aria-label="حذف الخصم"
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h2 id={`discount-name-${discount.id}`} className="text-xl font-black text-card-foreground group-hover:text-primary transition-colors leading-tight">{discount.name}</h2>
                        <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed font-medium">
                          {discount.description}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-8 pt-2 px-6">
                      <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-2xl border border-border group-hover:bg-card group-hover:border-primary/20 transition-all duration-300">
                        <div className={cn(
                          "p-3 rounded-xl",
                          discount.type === 'percentage' 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-none' 
                            : 'bg-primary/80 text-primary-foreground shadow-lg shadow-primary/10 dark:shadow-none'
                        )} aria-hidden="true">
                          {discount.type === 'percentage' ? <Percent size={24} /> : <Coins size={24} />}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1" aria-label={`قيمة الخصم: ${discount.value} ${discount.type === 'percentage' ? 'بالمئة' : 'ريال سعودي'}`}>
                            <span className="text-4xl font-black text-foreground tracking-tighter">
                              {discount.value}
                            </span>
                            <span className="text-lg font-bold text-muted-foreground">
                              {discount.type === 'percentage' ? '%' : 'ر.س'}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">القيمة الإجمالية</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2 rtl:space-x-reverse" aria-label="أمثلة لطلاب مستفيدين">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground" aria-hidden="true">
                              {i}
                            </div>
                          ))}
                          <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black" aria-label="وأكثر من اثني عشر طالباً آخر">
                            +12
                          </div>
                        </div>
                        
                        {!discount.active ? (
                          <Badge variant="outline" className="text-muted-foreground border-border bg-muted font-bold">
                            غير نشط
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-full" role="status">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                            نشط حالياً
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

                {/* Pagination for Grid View */}
                {filteredDiscounts.length > limit && (
                  <div className="mt-10 flex justify-center border-t border-muted pt-8">
                    <div className="flex items-center gap-2" role="navigation" aria-label="التنقل بين الصفحات">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
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
                        <span className="text-sm font-black text-foreground">{Math.ceil(filteredDiscounts.length / limit)}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(Math.ceil(filteredDiscounts.length / limit), p + 1))}
                        disabled={page >= Math.ceil(filteredDiscounts.length / limit)}
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
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
