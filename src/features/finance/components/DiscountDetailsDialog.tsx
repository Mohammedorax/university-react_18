import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, CheckCircle, XCircle, Percent, Coins, Calendar, FileText } from 'lucide-react'
import { Discount } from '@/services/mockApi'
import { cn } from '@/lib/utils'

interface DiscountDetailsDialogProps {
  discount: Discount
  trigger?: React.ReactNode
}

export function DiscountDetailsDialog({ discount, trigger }: DiscountDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="rounded-xl font-bold">
            التفاصيل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl" dir="rtl">
        <div className={cn(
          "h-32 w-full relative overflow-hidden",
          discount.active ? "bg-primary/90" : "bg-muted"
        )}>
          <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 translate-x-1/4 -translate-y-1/4">
            {discount.type === 'percentage' ? <Percent size={160} /> : <Coins size={160} />}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl">
              {discount.type === 'percentage' ? <Percent size={40} /> : <Coins size={40} />}
            </div>
          </div>
        </div>

        <div className="p-8 pt-6">
          <DialogHeader className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <Badge className={cn(
                "rounded-lg px-3 py-1 font-bold",
                discount.active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
              )}>
                {discount.active ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    خصم نشط
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <XCircle size={14} />
                    غير مفعل حالياً
                  </div>
                )}
              </Badge>
              <Badge variant="outline" className="rounded-lg px-3 py-1 font-bold border-primary/20 text-primary">
                {discount.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
              </Badge>
            </div>
            <DialogTitle className="text-right text-3xl font-black text-foreground">{discount.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-3xl border border-muted flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-1">قيمة الخصم المعتمدة</p>
                <p className="text-3xl font-black text-primary tracking-tight">
                  {discount.value}
                  <span className="text-lg mr-1 opacity-70">
                    {discount.type === 'percentage' ? '%' : 'ر.س'}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {discount.type === 'percentage' ? <Percent size={24} /> : <Coins size={24} />}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">وصف الخصم وشروطه</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {discount.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-0.5">معرف النظام</h4>
                  <p className="text-mono text-xs text-muted-foreground font-bold">{discount.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <Button className="w-full h-12 rounded-2xl font-bold text-lg shadow-xl" asChild>
              <DialogTrigger>إغلاق التفاصيل</DialogTrigger>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
