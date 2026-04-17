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
import { useUpdateTeacher } from "@/features/teachers/hooks/useTeachers";
import { Teacher } from "@/features/teachers/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherSchema, TeacherFormValues } from "../schemas/teacherSchema";
import { useDepartments, useSpecializations } from '@/features/admin/hooks/useReferenceData';

interface EditTeacherDialogProps {
  teacher: Teacher;
  trigger?: React.ReactNode;
}

/**
 * @component EditTeacherDialog
 * @description نافذة منبثقة لتعديل بيانات مدرس موجود.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر واجهة مستخدم متناسقة مع نموذج الإضافة.
 */
export function EditTeacherDialog({ teacher, trigger }: EditTeacherDialogProps) {
  const updateTeacherMutation = useUpdateTeacher();
  const [isOpen, setIsOpen] = useState(false);
  const { data: departments = [] } = useDepartments();
  const { data: specializations = [] } = useSpecializations();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      specialization: teacher.specialization,
    },
  });

  // تحديث قيم النموذج عند تغيير المدرس أو فتح النافذة
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        specialization: teacher.specialization,
      });
    }
  }, [isOpen, teacher, form]);

  const onSubmit = async (values: TeacherFormValues) => {
    try {
      await updateTeacherMutation.mutateAsync({
        id: teacher.id,
        data: values
      });
      toast.success("تم تحديث بيانات المدرس بنجاح");
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل في تحديث بيانات المدرس"
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 rounded-lg font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            aria-label={`تعديل بيانات المدرس ${teacher.name}`}
          >
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[88vh] p-0 border-none shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">تعديل بيانات المدرس</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            قم بتعديل بيانات المدرس {teacher.name} هنا. تأكد من صحة التعديلات قبل الحفظ.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-bold text-foreground/70 mr-1">الاسم الكامل</Label>
              <Input 
                id="edit-name" 
                {...form.register("name")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.name ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.name && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-bold text-foreground/70 mr-1">البريد الإلكتروني</Label>
              <Input 
                id="edit-email" 
                type="email"
                {...form.register("email")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.email ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.email && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department" className="text-sm font-bold text-foreground/70 mr-1">القسم</Label>
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
              <Label htmlFor="edit-specialization" className="text-sm font-bold text-foreground/70 mr-1">التخصص</Label>
              <Select value={form.watch('specialization')} onValueChange={(value) => form.setValue('specialization', value)}>
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
              disabled={updateTeacherMutation.isPending}
              className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {updateTeacherMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
