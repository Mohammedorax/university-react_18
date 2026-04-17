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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddTeacher } from "@/features/teachers/hooks/useTeachers";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherSchema, TeacherFormValues } from "../schemas/teacherSchema";
import { Teacher } from "../types";
import { sanitizeText, isValidEmail, containsDangerousContent } from '@/lib/security';
import { useDepartments, useSpecializations } from '@/features/admin/hooks/useReferenceData';

interface AddTeacherDialogProps {
  trigger?: React.ReactNode;
}

/**
 * @component AddTeacherDialog
 * @description نافذة منبثقة لإضافة مدرس جديد إلى النظام.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر تجربة مستخدم متناسقة.
 */
export function AddTeacherDialog({ trigger }: AddTeacherDialogProps) {
  const addTeacherMutation = useAddTeacher();
  const [isOpen, setIsOpen] = useState(false);
  const { data: departments = [] } = useDepartments();
  const { data: specializations = [] } = useSpecializations();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      specialization: "",
      taught_courses: [],
    },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    // تطهير المدخلات للحماية من XSS
    const sanitizedValues = {
      ...values,
      name: sanitizeText(values.name),
      email: sanitizeText(values.email),
      department: sanitizeText(values.department),
      specialization: sanitizeText(values.specialization),
    };

    // التحقق من صحة البريد الإلكتروني
    if (!isValidEmail(sanitizedValues.email)) {
      toast.error("البريد الإلكتروني غير صالح");
      return;
    }

    // التحقق من وجود محتوى خطر
    if (containsDangerousContent(sanitizedValues.name) || 
        containsDangerousContent(sanitizedValues.department) ||
        containsDangerousContent(sanitizedValues.specialization)) {
      toast.error("تم اكتشاف محتوى غير آمن");
      return;
    }

    try {
      await addTeacherMutation.mutateAsync(sanitizedValues as Omit<Teacher, 'id'>);
      toast.success("تمت إضافة المدرس بنجاح");
      form.reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل في إضافة المدرس"
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
            aria-label="إضافة مدرس جديد"
          >
            إضافة مدرس جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[88vh] p-0 border-none shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">إضافة مدرس جديد</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            أدخل تفاصيل المدرس الجديد. تأكد من دقة البيانات المدخلة خاصة البريد الإلكتروني.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-foreground/70 mr-1">الاسم الكامل</Label>
              <Input 
                id="name" 
                {...form.register("name")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.name ? 'border-destructive' : ''}`}
                placeholder="مثال: د. أحمد محمد"
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
                placeholder="teacher@univ.edu"
              />
              {form.formState.errors.email && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-bold text-foreground/70 mr-1">القسم</Label>
              <Select
                value={form.watch('department')}
                onValueChange={(value) => {
                  form.setValue('department', value)
                  form.setValue('specialization', '')
                }}
              >
                <SelectTrigger className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.department ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-bold text-foreground/70 mr-1">التخصص</Label>
              <Select
                value={form.watch('specialization')}
                onValueChange={(value) => form.setValue('specialization', value)}
              >
                <SelectTrigger className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.specialization ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  {specializations
                    .filter((item) => !form.watch('department') || departments.find((dep) => dep.id === item.departmentId)?.name === form.watch('department'))
                    .map((specialization) => (
                      <SelectItem key={specialization.id} value={specialization.name}>{specialization.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.formState.errors.specialization && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.specialization.message}</p>
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
              disabled={addTeacherMutation.isPending}
              className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {addTeacherMutation.isPending ? "جاري الحفظ..." : "حفظ المدرس"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
