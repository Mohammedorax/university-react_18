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
import { useUpdateTeacher } from "@/features/teachers/hooks/useTeachers";
import { Teacher } from "@/features/teachers/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherSchema, TeacherFormValues } from "../schemas/teacherSchema";

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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">تعديل بيانات المدرس</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            قم بتعديل بيانات المدرس {teacher.name} هنا. تأكد من صحة التعديلات قبل الحفظ.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Input 
                id="edit-department" 
                {...form.register("department")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.department ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.department && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialization" className="text-sm font-bold text-foreground/70 mr-1">التخصص</Label>
              <Input 
                id="edit-specialization" 
                {...form.register("specialization")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.specialization ? 'border-destructive' : ''}`}
              />
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
