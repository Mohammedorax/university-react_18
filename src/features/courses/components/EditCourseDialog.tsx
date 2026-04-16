import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Course } from "@/features/courses/types";
import { useUpdateCourse } from "@/features/courses/hooks/useCourses";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormValues } from "../schemas/courseSchema";

interface EditCourseDialogProps {
  course: Course;
  trigger?: React.ReactNode;
}

/**
 * @component EditCourseDialog
 * @description نافذة منبثقة لتعديل بيانات مقرر دراسي موجود.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر واجهة مستخدم متناسقة مع نموذج الإضافة.
 */
export function EditCourseDialog({ course, trigger }: EditCourseDialogProps) {
  const updateCourseMutation = useUpdateCourse();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course.name,
      description: course.description,
      code: course.code,
      credits: course.credits,
      department: course.department,
      max_students: course.max_students,
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    try {
      await updateCourseMutation.mutateAsync({
        courseId: course.id,
        courseData: values,
      });
      toast.success("تم تحديث المقرر بنجاح");
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "فشل في تحديث المقرر";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            className="h-9 px-4 rounded-lg font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            aria-label={`تعديل مقرر ${course.name}`}
          >
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">تعديل المقرر: {course.name}</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            عدل تفاصيل المقرر الدراسي هنا. تأكد من صحة التعديلات قبل الحفظ.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-bold text-foreground/70 mr-1">اسم المقرر</Label>
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
              <Label htmlFor="edit-code" className="text-sm font-bold text-foreground/70 mr-1">رمز المقرر</Label>
              <Input 
                id="edit-code" 
                {...form.register("code")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.code ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.code && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.code.message}</p>
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
              <Label htmlFor="edit-credits" className="text-sm font-bold text-foreground/70 mr-1">عدد الساعات</Label>
              <Input 
                id="edit-credits" 
                type="number"
                {...form.register("credits")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.credits ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.credits && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.credits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-max_students" className="text-sm font-bold text-foreground/70 mr-1">الحد الأقصى للطلاب</Label>
              <Input 
                id="edit-max_students" 
                type="number"
                {...form.register("max_students")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.max_students ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.max_students && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.max_students.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description" className="text-sm font-bold text-foreground/70 mr-1">وصف المقرر</Label>
              <Textarea 
                id="edit-description" 
                {...form.register("description")}
                className={`min-h-[100px] rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all resize-none ${form.formState.errors.description ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.description && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.description.message}</p>
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
              disabled={updateCourseMutation.isPending}
              className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {updateCourseMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}