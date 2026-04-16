import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddStaff } from "@/features/staff/hooks/useStaff";
import type { Staff } from "@/features/staff/types";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, StaffFormValues } from "../schemas/staffSchema";

interface AddStaffDialogProps {
  trigger?: React.ReactNode;
}

/**
 * @component AddStaffDialog
 * @description نافذة منبثقة لإضافة موظف جديد إلى النظام.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر تجربة مستخدم متناسقة.
 */
export function AddStaffDialog({ trigger }: AddStaffDialogProps) {
  const addStaffMutation = useAddStaff();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      job_title: "",
      phone: "",
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    try {
      await addStaffMutation.mutateAsync(values as Omit<Staff, 'id'>);
      toast.success("تمت إضافة الموظف بنجاح");
      form.reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل في إضافة الموظف"
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) form.reset();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="gap-2 font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            aria-label="إضافة موظف جديد"
          >
            إضافة موظف جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">إضافة موظف جديد</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            أدخل تفاصيل الموظف الجديد. تأكد من دقة البيانات المدخلة خاصة البريد الإلكتروني.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-foreground/70 mr-1">الاسم الكامل</Label>
              <Input
                id="name"
                {...form.register("name")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.name ? 'border-destructive' : ''}`}
                placeholder="مثال: أحمد محمد"
              />
              {form.formState.errors.name && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-foreground/70 mr-1">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.email ? 'border-destructive' : ''}`}
                placeholder="example@univ.edu"
              />
              {form.formState.errors.email && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-bold text-foreground/70 mr-1">القسم</Label>
              <Input
                id="department"
                {...form.register("department")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.department ? 'border-destructive' : ''}`}
                placeholder="مثال: شؤون الطلاب"
              />
              {form.formState.errors.department && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title" className="text-sm font-bold text-foreground/70 mr-1">المسمى الوظيفي</Label>
              <Input
                id="job_title"
                {...form.register("job_title")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.job_title ? 'border-destructive' : ''}`}
                placeholder="مثال: مدير إداري"
              />
              {form.formState.errors.job_title && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.job_title.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="text-sm font-bold text-foreground/70 mr-1">رقم الهاتف</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.phone ? 'border-destructive' : ''}`}
                placeholder="05XXXXXXXX"
              />
              {form.formState.errors.phone && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-muted">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="h-11 px-6 rounded-xl font-bold hover:bg-muted transition-colors">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={addStaffMutation.isPending}
              className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {addStaffMutation.isPending ? "جاري الحفظ..." : "حفظ الموظف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
