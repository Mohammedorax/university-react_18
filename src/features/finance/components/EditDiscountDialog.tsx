import { useState, useEffect } from 'react'
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
import { Pencil } from 'lucide-react'
import { useUpdateDiscount } from '@/features/finance/hooks/useDiscounts'
import { Button } from '@/components/ui/button'
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
import { Discount } from '@/services/mockApi'

const discountSchema = z.object({
  name: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل'),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.number().min(0, 'القيمة يجب أن تكون موجبة'),
  description: z.string().min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
  active: z.boolean().default(true)
})

type DiscountFormValues = z.infer<typeof discountSchema>

interface EditDiscountDialogProps {
  discount: Discount
  trigger?: React.ReactNode
}

export function EditDiscountDialog({ discount, trigger }: EditDiscountDialogProps) {
  const [open, setOpen] = useState(false)
  const updateDiscountMutation = useUpdateDiscount()

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: discount.name,
      type: discount.type,
      value: discount.value,
      description: discount.description,
      active: discount.active
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        description: discount.description,
        active: discount.active
      })
    }
  }, [open, discount, form])

  const onSubmit = async (data: DiscountFormValues) => {
    try {
      await updateDiscountMutation.mutateAsync({ id: discount.id, data })
      toast.success('تم تحديث بيانات الخصم بنجاح')
      setOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الخصم';
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10">
            <Pencil size={18} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl font-bold">تعديل بيانات الخصم</DialogTitle>
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
                disabled={updateDiscountMutation.isPending}
                className="rounded-xl px-8"
              >
                {updateDiscountMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
