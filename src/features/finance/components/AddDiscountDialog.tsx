import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from 'lucide-react'
import { useAddDiscount, Discount } from '@/features/finance/hooks/useDiscounts'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * مخطط التحقق من صحة بيانات الخصم باستخدام Zod
 */
const discountSchema = z.object({
  name: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل'),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.number().min(0, 'القيمة يجب أن تكون موجبة'),
  description: z.string().min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
  active: z.boolean().default(true)
})

type DiscountFormValues = z.infer<typeof discountSchema>

/**
 * مكون حوار إضافة خصم أو منحة جديدة
 * @description يوفر واجهة لإدخال بيانات الخصم مع التحقق من صحتها باستخدام Zod و React Hook Form
 * 
 * @returns {JSX.Element} مكون حوار الإضافة
 */
export function AddDiscountDialog() {
  const [open, setOpen] = useState(false)
  const addDiscountMutation = useAddDiscount()

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: '',
      type: 'percentage',
      value: 0,
      description: '',
      active: true
    }
  })

  /**
   * معالجة إرسال النموذج
   * @param {DiscountFormValues} data - بيانات النموذج المرسلة
   */
  const onSubmit = async (data: DiscountFormValues) => {
    try {
      await addDiscountMutation.mutateAsync(data as Omit<Discount, 'id'>)
      toast.success('تم إضافة الخصم بنجاح')
      setOpen(false)
      form.reset()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الخصم';
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Plus size={20} />
          <span className="hidden sm:inline">إضافة خصم/منحة</span>
          <span className="inline sm:hidden">إضافة</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl font-bold">إضافة خصم أو منحة جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">اسم الخصم/المنحة</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="مثال: منحة التفوق"
                      className="text-right rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">نوع الخصم</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                        <SelectItem value="fixed_amount">مبلغ ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      {form.watch('type') === 'percentage' ? 'القيمة (%)' : 'القيمة (ر.س)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="text-right rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">الوصف</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="وصف مختصر للخصم وشروط استحقاقه"
                      className="text-right rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl px-6"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={addDiscountMutation.isPending}
                className="rounded-xl px-8"
              >
                {addDiscountMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
