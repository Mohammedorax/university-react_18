import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Pencil, Save } from 'lucide-react'
import { useUpdateInventoryItem, useCategories } from '@/features/inventory/hooks/useInventory'
import { InventoryItem } from '@/features/inventory/types'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inventorySchema, type InventoryFormData } from '../schemas/inventorySchema'

/**
 * @interface EditInventoryDialogProps
 * @description خصائص مكون نافذة تعديل عنصر المخزون.
 */
interface EditInventoryDialogProps {
  /** العنصر المراد تعديله */
  item: InventoryItem
  /** المكون الذي سيقوم بفتح النافذة (اختياري) */
  trigger?: React.ReactNode
}

/**
 * @component EditInventoryDialog
 * @description نافذة حوار لتعديل بيانات عنصر موجود في المخزون.
 * تستخدم React Hook Form لإدارة الحالة و Zod للتحقق من صحة البيانات.
 * 
 * @param {EditInventoryDialogProps} props - خصائص المكون
 * @returns {JSX.Element} مكون نافذة التعديل
 */
export function EditInventoryDialog({ item, trigger }: EditInventoryDialogProps) {
  const [open, setOpen] = useState(false)
  
  const { data: categories = [] } = useCategories();
  const updateInventoryItemMutation = useUpdateInventoryItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.min_quantity || 0,
      unit: item.unit || '',
      location: item.location || '',
      status: item.status,
      price: item.price,
      sku: item.sku
    }
  })

  // تحديث قيم النموذج عند تغيير العنصر المختار
  useEffect(() => {
    if (open) {
      reset({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        min_quantity: item.min_quantity || 0,
        unit: item.unit || '',
        location: item.location || '',
        status: item.status,
        price: item.price,
        sku: item.sku
      })
    }
  }, [item, open, reset])

  /**
   * @function onSubmit
   * @description معالجة إرسال النموذج وتحديث بيانات العنصر.
   * @param {InventoryFormData} data - بيانات النموذج التي تم التحقق من صحتها.
   */
  const onSubmit = async (data: InventoryFormData) => {
    try {
      await updateInventoryItemMutation.mutateAsync({ id: item.id, data })
      toast.success('تم تحديث العنصر بنجاح')
      setOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث العنصر')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button 
            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors group"
            aria-label={`تعديل ${item.name}`}
            aria-haspopup="dialog"
          >
            <Pencil size={18} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-50 border">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">تعديل عنصر مخزون</Dialog.Title>
            <Dialog.Close 
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
              aria-label="إغلاق"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                اسم العنصر
              </label>
              <input
                id="edit-name"
                {...register('name')}
                placeholder="أدخل اسم العنصر..."
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${
                  errors.name ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1 mr-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                التصنيف
              </label>
              <select
                id="edit-category"
                {...register('category')}
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground appearance-none ${
                  errors.category ? 'border-destructive' : 'border-input'
                }`}
              >
                <option value="" className="bg-card">اختر التصنيف</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-card">
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-destructive text-xs mt-1 mr-1">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-quantity" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الكمية
                </label>
                <input
                  id="edit-quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${
                    errors.quantity ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.quantity.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-min_quantity" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الحد الأدنى
                </label>
                <input
                  id="edit-min_quantity"
                  type="number"
                  {...register('min_quantity', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${
                    errors.min_quantity ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.min_quantity && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.min_quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-price" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  السعر
                </label>
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${
                    errors.price ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.price && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-unit" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الوحدة
                </label>
                <input
                  id="edit-unit"
                  {...register('unit')}
                  placeholder="مثال: قطعة، صندوق"
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${
                    errors.unit ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.unit && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-location" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الموقع
                </label>
                <input
                  id="edit-location"
                  {...register('location')}
                  placeholder="رقم الرف أو المستودع"
                  className={`w-full p-2.5 bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50`}
                />
              </div>
              <div>
                <label htmlFor="edit-sku" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الرمز (SKU)
                </label>
                <input
                  id="edit-sku"
                  {...register('sku')}
                  placeholder="الرمز التعريفي..."
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${
                    errors.sku ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.sku && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="edit-status" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                الحالة
              </label>
              <select
                id="edit-status"
                {...register('status')}
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground appearance-none ${
                  errors.status ? 'border-destructive' : 'border-input'
                }`}
              >
                <option value="available" className="bg-card">متوفر</option>
                <option value="low_stock" className="bg-card">كمية قليلة</option>
                <option value="out_of_stock" className="bg-card">نفذت الكمية</option>
              </select>
              {errors.status && (
                <p className="text-destructive text-xs mt-1 mr-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateInventoryItemMutation.isPending}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting || updateInventoryItemMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    تحديث البيانات
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
