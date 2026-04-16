import { useState, useMemo, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
  LayoutGrid,
  List,
  Pencil,
  RefreshCcw,
  Info,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useInventory, useCategories, useDeleteInventoryItem } from '@/features/inventory/hooks/useInventory'
import { AddInventoryDialog } from '@/features/inventory/components/AddInventoryDialog'
import { EditInventoryDialog } from '@/features/inventory/components/EditInventoryDialog'
import { CategoryManagerDialog } from '@/features/inventory/components/CategoryManagerDialog'
import { InventoryItem } from '@/features/inventory/types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { DataTable, DataTableColumn } from '@/components/DataTable'
import { StatCard } from '@/components/StatCard'
import { ViewModeButton } from '@/components/ViewModeButton'
import { Input } from '@/components/ui/input'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LazyImage } from '@/components/LazyImage'

/**
 * صفحة إدارة المخزون والمستودعات - تتيح للمسؤولين متابعة الأصول والعهدة
 * 
 * @component
 * @returns {JSX.Element} صفحة المخزون مع عرض جدولي وشبكي وإحصائيات
 */
export default function InventoryPage() {
  const { data: items = [], isLoading, error, refetch } = useInventory();
  const { data: categories = [] } = useCategories();
  const deleteInventoryItemMutation = useDeleteInventoryItem();

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; itemId?: string; bulk?: InventoryItem[]; description?: string
  }>({ open: false })

  /**
   * معالج حذف عنصر من المخزون مع التأكيد
   */
  const handleDelete = useCallback((id: string) => {
    setConfirmDialog({ open: true, itemId: id, description: 'هل أنت متأكد من حذف هذا العنصر؟' })
  }, [])

  /**
   * معالج حذف مجموعة من العناصر مع التأكيد
   */
  const handleBulkDelete = useCallback((selected: InventoryItem[]) => {
    setConfirmDialog({ open: true, bulk: selected, description: `هل أنت متأكد من حذف ${selected.length} عناصر؟ لا يمكن التراجع عن هذا الإجراء.` })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (confirmDialog.bulk) {
        const results = await Promise.allSettled(
          confirmDialog.bulk.map(item => deleteInventoryItemMutation.mutateAsync(item.id))
        )
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.length - successful

        if (successful > 0) {
          toast.success(`تم حذف ${successful} عنصر بنجاح`)
        }
        if (failed > 0) {
          toast.error(`فشل حذف ${failed} عنصر. يرجى المحاولة مرة أخرى.`)
        }
        if (failed === 0) {
          setSelectedItems([])
        }
      } else if (confirmDialog.itemId) {
        await deleteInventoryItemMutation.mutateAsync(confirmDialog.itemId)
        toast.success('تم حذف العنصر بنجاح')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء عملية الحذف')
    } finally {
      setConfirmDialog({ open: false })
    }
  }, [confirmDialog, deleteInventoryItemMutation])

  /**
   * معالج إعادة ضبط جميع الفلاتر
   */
  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('all')
    toast.success('تم إعادة ضبط جميع الفلاتر بنجاح')
  }, [])

  /**
   * معالج تحديث البيانات يدوياً
   */
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success('تم تحديث بيانات المخزون بنجاح')
    } catch (err) {
      toast.error('فشل تحديث البيانات')
    }
  }, [refetch])

  /**
   * استرجاع شارة الحالة المناسبة بناءً على حالة المخزون
   * 
   * @function getStatusBadge
   * @param {string} status - حالة العنصر (available, low_stock, out_of_stock)
   * @returns {JSX.Element | null} شارة الحالة بتنسيق Tailwind
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-none">متوفر</Badge>
      case 'low_stock':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">كمية قليلة</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600 border-none">نفذت الكمية</Badge>
      default:
        return null
    }
  }

  // تصفية العناصر بناءً على التصنيف المختار والبحث
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchTerm])

  // تعريف أعمدة الجدول الموحد
  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: 'name',
      title: 'العنصر',
      sortable: true,
      render: (name: unknown, item: InventoryItem) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{name as string}</span>
          <span className="text-xs text-muted-foreground font-mono" aria-label={`رمز المنتج: ${item.sku}`}>{item.sku}</span>
        </div>
      )
    },
    {
      key: 'category',
      title: 'التصنيف',
      sortable: true,
      render: (cat: unknown) => <Badge variant="outline" className="font-medium">{cat as string}</Badge>
    },
    {
      key: 'quantity',
      title: 'الكمية',
      sortable: true,
      render: (qty: unknown, item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-lg",
            (qty as number) < item.min_quantity ? "text-rose-500" : "text-foreground"
          )} aria-label={(qty as number) < item.min_quantity ? `كمية منخفضة: ${qty}` : `الكمية: ${qty}`}>
            {qty as number}
          </span>
          <span className="text-xs text-muted-foreground">{item.unit}</span>
        </div>
      )
    },
    {
      key: 'price',
      title: 'السعر',
      sortable: true,
      render: (price: unknown) => <span className="font-medium">{(price as number).toLocaleString()} ر.س</span>
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (status: unknown) => getStatusBadge(status as string)
    }
  ]

  // حساب الإحصائيات السريعة
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockCount = items.filter(item => item.quantity < item.min_quantity).length

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8" dir="rtl" lang="ar">
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4" dir="rtl" lang="ar">
        <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 flex items-center justify-center text-destructive">
          <Info size={40} aria-hidden="true" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h2>
          <p className="text-muted-foreground mb-6">{String(error || 'يرجى المحاولة مرة أخرى لاحقاً')}</p>

        </div>
        <Button onClick={() => window.location.reload()} className="gap-2" aria-label="إعادة محاولة تحميل البيانات">
          <RefreshCcw size={16} aria-hidden="true" />
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-10" dir="rtl" lang="ar">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary/95 text-primary-foreground pb-24 pt-10">
          <div className="absolute top-0 right-0 p-10 opacity-5" aria-hidden="true">
            <Package size={300} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl" aria-hidden="true">
                  <Package size={48} className="text-white" />
                </div>
                <div className="text-center md:text-right">
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">إدارة المخزون والمستودعات</h1>
                  <p className="text-primary-foreground/80 text-lg font-medium">متابعة الأصول والعهدة والمستلزمات المركزية للجامعة</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="إجراءات المخزون">
                <CategoryManagerDialog />
                <AddInventoryDialog />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8" role="region" aria-label="إحصائيات سريعة للمخزون">
              <StatCard icon={Package} label="إجمالي العناصر" value={items.length} />
              <StatCard icon={DollarSign} label="قيمة المخزون" value={`${totalValue.toLocaleString()} ر.س`} />
              <StatCard icon={AlertTriangle} label="تنبيهات المخزون" value={lowStockCount} isWarning={lowStockCount > 0} />
            </div>
          </div>
        </div>

        <div className="page-container -mt-10 relative z-20">
          <Card className="card-unified shadow-2xl overflow-hidden">
            <CardHeader className="pb-6 border-b border-muted">
              <div className="filter-container items-center">
                <div className="relative group lg:col-span-2">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
                  <Input
                    placeholder="بحث في المخزون (الاسم، الرمز...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-unified pr-11 font-medium"
                    aria-label="البحث في المخزون"
                  />
                </div>

                <div className="bg-muted/50 p-1.5 rounded-xl border flex items-center w-full h-12 overflow-x-auto scrollbar-hide">
                  <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="bg-transparent h-9 gap-1">
                      <TabsTrigger value="all" className="rounded-lg px-4 text-sm font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary border-none">
                        الكل
                      </TabsTrigger>
                      {categories.map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="rounded-lg px-4 text-sm font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary border-none">
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-xl shadow-md transition-all active:scale-95"
                    onClick={handleRefresh}
                    aria-label="تحديث البيانات"
                  >
                    <RefreshCcw size={20} aria-hidden="true" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all active:scale-95"
                    onClick={handleResetFilters}
                    aria-label="إعادة ضبط الفلاتر"
                    title="إعادة ضبط الفلاتر"
                  >
                    <RefreshCcw size={18} className="-rotate-90" />
                  </Button>

                  <div className="flex items-center bg-muted/50 rounded-xl p-1 h-12 border border-muted" role="group" aria-label="عرض العناصر">
                    <ViewModeButton active={viewMode === 'table'} onClick={() => setViewMode('table')} icon={List} label="جدول" />
                    <ViewModeButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} label="شبكة" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {viewMode === 'table' ? (
                <DataTable
                  data={filteredItems}
                  columns={columns}
                  virtualized={filteredItems.length > 50}
                  virtualHeight={600}
                  searchPlaceholder="بحث في المخزون (الاسم، الرمز...)"
                  emptyMessage="لم يتم العثور على أي عناصر في المخزون"
                  onRowSelection={setSelectedItems}
                  bulkActions={(selected) => (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 rounded-xl font-bold"
                      onClick={() => handleBulkDelete(selected)}
                      aria-label={`حذف ${selected.length} عناصر مختارة`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      حذف المحدد ({selected.length})
                    </Button>
                  )}
                  rowActions={(item) => (
                    <>
                      <EditInventoryDialog
                        item={item}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer font-bold">
                            <Pencil size={14} />
                            تعديل العنصر
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 font-bold"
                      >
                        <Trash2 size={14} />
                        حذف العنصر
                      </DropdownMenuItem>
                    </>
                  )}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map(item => (
                    <InventoryCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
                  ))}
                </div>
              )}

              {filteredItems.length === 0 && (
                <EmptyState
                  icon={Package}
                  title="لا توجد نتائج"
                  description="جرب تغيير معايير البحث أو التصنيف المختار"
                  actionLabel="إعادة تعيين البحث"
                  onAction={() => setSelectedCategory('all')}
                />
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

// --- المكونات الفرعية المساعدة ---

const InventoryCard = ({ item, onDelete }: { item: InventoryItem; onDelete: (id: string) => void }) => (
  <Card className="group overflow-hidden border-muted/60 hover:border-primary/30 transition-all hover:shadow-xl hover:-translate-y-1" role="article" aria-labelledby={`item-title-${item.id}`}>
    <CardContent className="p-0">
      <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
        {item.image ? (
          <LazyImage
            src={item.image}
            alt={item.name}
            height={192} // h-48 = 12rem = 192px
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
            <Package size={64} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-bold shadow-sm" aria-label={`التصنيف: ${item.category}`}>{item.category}</Badge>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 id={`item-title-${item.id}`} className="font-black text-lg group-hover:text-primary transition-colors line-clamp-1" title={item.name}>{item.name}</h3>
            <p className="text-xs font-mono text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-md" aria-label={`رمز المنتج: ${item.sku}`}>SKU: {item.sku}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed">
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">الكمية</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-black", item.quantity < item.min_quantity ? "text-rose-500" : "")} aria-label={item.quantity < item.min_quantity ? `كمية منخفضة: ${item.quantity}` : `الكمية: ${item.quantity}`}>
                {item.quantity}
              </span>
              <span className="text-xs font-bold text-muted-foreground" aria-hidden="true">{item.unit}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">السعر</p>
            <p className="text-2xl font-black" aria-label={`السعر: ${item.price.toLocaleString()} ريال سعودي`}>{item.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge
            variant="secondary"
            className={cn(
              "font-bold",
              item.status === 'available' && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
              item.status === 'low_stock' && "bg-amber-500/10 text-amber-600 border-amber-200",
              item.status === 'out_of_stock' && "bg-rose-500/10 text-rose-600 border-rose-200"
            )}
            role="status"
          >
            {item.status === 'available' ? 'متوفر' : item.status === 'low_stock' ? 'كمية قليلة' : 'نفذت'}
          </Badge>

          <div className="flex gap-2" role="group" aria-label={`إجراءات لـ ${item.name}`}>
            <EditInventoryDialog
              item={item}
              trigger={
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white transition-all" aria-label={`تعديل ${item.name}`}>
                  <Pencil size={16} aria-hidden="true" />
                </Button>
              }
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
              onClick={() => onDelete(item.id)}
              aria-label={`حذف ${item.name}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)
