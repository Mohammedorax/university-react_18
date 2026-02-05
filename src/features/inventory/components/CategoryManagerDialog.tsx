import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2, Plus } from 'lucide-react'
import { useCategories, useAddCategory, useDeleteCategory } from '@/features/inventory/hooks/useInventory'
import { toast } from 'sonner'

export function CategoryManagerDialog() {
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  
  const { data: categories = [] } = useCategories();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      await addCategoryMutation.mutateAsync(newCategory.trim())
      toast.success('تم إضافة التصنيف بنجاح')
      setNewCategory('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة التصنيف')
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف تصنيف "${category}"؟`)) return

    try {
      await deleteCategoryMutation.mutateAsync(category)
      toast.success('تم حذف التصنيف بنجاح')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف التصنيف')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button 
          className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 flex items-center gap-2 transition-all font-bold border"
          aria-haspopup="dialog"
        >
          إدارة التصنيفات
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-50 border">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">إدارة التصنيفات</Dialog.Title>
            <Dialog.Close 
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
              aria-label="إغلاق"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
            <input
              type="text"
              placeholder="اسم التصنيف الجديد..."
              className="flex-1 p-2.5 bg-muted/50 border-input border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={addCategoryMutation.isPending}
              aria-label="اسم التصنيف الجديد"
            />
            <button
              type="submit"
              disabled={addCategoryMutation.isPending || !newCategory.trim()}
              className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
              aria-label="إضافة تصنيف"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" aria-hidden="true" />
              التصنيفات الحالية
            </h3>
            {categories.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="text-muted-foreground">لا توجد تصنيفات حالياً</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar" role="list" aria-label="قائمة التصنيفات">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex justify-between items-center p-3.5 bg-muted/30 hover:bg-muted/50 rounded-xl border border-transparent hover:border-muted-foreground/10 transition-all group"
                    role="listitem"
                  >
                    <span className="font-medium text-foreground">{category}</span>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      disabled={deleteCategoryMutation.isPending}
                      className="text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 p-2 rounded-lg transition-all"
                      aria-label={`حذف تصنيف ${category}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all font-bold"
            >
              إغلاق النافذة
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
