import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Plus, Save } from 'lucide-react'
import { useAddInventoryItem, useCategories } from '@/features/inventory/hooks/useInventory'
import type { InventoryItem } from '@/features/inventory/types'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inventorySchema, type InventoryFormData } from '../schemas/inventorySchema'

/**
 * @component AddInventoryDialog
 * @description نافذة حوار لإضافة عنصر جديد إلى المخزون.
 * تستخدم React Hook Form لإدارة الحالة و Zod للتحقق من صحة البيانات.
 * 
 * @returns {JSX.Element} مكون نافذة الإضافة
 */
export function AddInventoryDialog() {
  const [open, setOpen] = useState(false)

  const { data: categories = [] } = useCategories();
  const addInventoryItemMutation = useAddInventoryItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 0,
      min_quantity: 0,
      unit: '',
      location: '',
      status: 'available',
      price: 0,
      sku: ''
    }
  })

  /**
   * @function onSubmit
   * @description معالجة إرسال النموذج وإضافة العنصر الجديد.
   * @param {InventoryFormData} data - بيانات النموذج التي تم التحقق من صحتها.
   */
  const onSubmit = async (data: InventoryFormData) => {
    try {
      await addInventoryItemMutation.mutateAsync(data as Omit<InventoryItem, 'id'>)
      toast.success('تم إضافة العنصر بنجاح')
      setOpen(false)
      reset()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة العنصر')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) reset()
    }}>
      <Dialog.Trigger asChild>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold flex items-center gap-2"
          aria-haspopup="dialog"
        >
          <Plus size={18} />
          إضافة عنصر جديد
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-50 border">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">إضافة عنصر مخزون جديد</Dialog.Title>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
              aria-label="إغلاق"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                اسم العنصر
              </label>
              <input
                id="name"
                {...register('name')}
                placeholder="أدخل اسم العنصر..."
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${errors.name ? 'border-destructive' : 'border-input'
                  }`}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1 mr-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                التصنيف
              </label>
              <select
                id="category"
                {...register('category')}
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground appearance-none ${errors.category ? 'border-destructive' : 'border-input'
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
                <label htmlFor="quantity" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الكمية
                </label>
                <input
                  id="quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${errors.quantity ? 'border-destructive' : 'border-input'
                    }`}
                />
                {errors.quantity && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.quantity.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="min_quantity" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الحد الأدنى
                </label>
                <input
                  id="min_quantity"
                  type="number"
                  {...register('min_quantity', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${errors.min_quantity ? 'border-destructive' : 'border-input'
                    }`}
                />
                {errors.min_quantity && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.min_quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  السعر
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground ${errors.price ? 'border-destructive' : 'border-input'
                    }`}
                />
                {errors.price && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الوحدة
                </label>
                <input
                  id="unit"
                  {...register('unit')}
                  placeholder="مثال: قطعة، صندوق"
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${errors.unit ? 'border-destructive' : 'border-input'
                    }`}
                />
                {errors.unit && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الموقع
                </label>
                <input
                  id="location"
                  {...register('location')}
                  placeholder="رقم الرف أو المستودع"
                  className={`w-full p-2.5 bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50`}
                />
              </div>
              <div>
                <label htmlFor="sku" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                  الرمز (SKU)
                </label>
                <input
                  id="sku"
                  {...register('sku')}
                  placeholder="الرمز التعريفي..."
                  className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50 ${errors.sku ? 'border-destructive' : 'border-input'
                    }`}
                />
                {errors.sku && (
                  <p className="text-destructive text-xs mt-1 mr-1">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-bold text-foreground mb-1.5 mr-1">
                الحالة
              </label>
              <select
                id="status"
                {...register('status')}
                className={`w-full p-2.5 bg-muted/50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground appearance-none ${errors.status ? 'border-destructive' : 'border-input'
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
                disabled={isSubmitting || addInventoryItemMutation.isPending}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting || addInventoryItemMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ العنصر
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
