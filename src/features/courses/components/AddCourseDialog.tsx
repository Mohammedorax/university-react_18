
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
import { useAddCourse } from "@/features/courses/hooks/useCourses";
import { useAuthState } from "@/features/auth/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormValues } from "../schemas/courseSchema";
import { sanitizeText, containsDangerousContent } from '@/lib/security';

interface AddCourseDialogProps {
  trigger?: React.ReactNode;
}

/**
 * @component AddCourseDialog
 * @description نافذة منبثقة لإضافة مقرر دراسي جديد.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر واجهة مستخدم متناسقة مع باقي أجزاء النظام.
 */
export function AddCourseDialog({ trigger }: AddCourseDialogProps) {
  const { user } = useAuthState();
  const addCourseMutation = useAddCourse();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      credits: 3,
      department: "",
      max_students: 50,
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    if (!user) {
        toast.error("يجب عليك تسجيل الدخول أولاً");
        return;
    }

    // تطهير المدخلات للحماية من XSS
    const sanitizedValues = {
      ...values,
      name: sanitizeText(values.name),
      code: sanitizeText(values.code),
      department: sanitizeText(values.department),
      description: sanitizeText(values.description),
    };

    // التحقق من وجود محتوى خطر
    if (containsDangerousContent(sanitizedValues.name) || 
        containsDangerousContent(sanitizedValues.code) ||
        containsDangerousContent(sanitizedValues.department)) {
      toast.error("تم اكتشاف محتوى غير آمن");
      return;
    }

    try {
      await addCourseMutation.mutateAsync({
        name: sanitizedValues.name,
        code: sanitizedValues.code,
        description: sanitizedValues.description,
        department: sanitizedValues.department,
        credits: values.credits,
        max_students: values.max_students,
        teacher_id: user.id,
        teacher_name: user.name,
        semester: "Fall 2024",
        year: 2024,
        schedule: [],
        created_at: new Date().toISOString(),
      });
      toast.success("تمت إضافة المقرر بنجاح");
      form.reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "فشل في إضافة المقرر";
      toast.error(errorMessage);
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
            aria-label="إضافة مقرر جديد"
          >
            <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-lg">+</span>
            </div>
            إضافة مقرر جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-black">إضافة مقرر جديد</DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-medium">
            أدخل تفاصيل المقرر الدراسي الجديد. تأكد من دقة البيانات المدخلة.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-foreground/70 mr-1">اسم المقرر</Label>
              <Input 
                id="name" 
                {...form.register("name")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.name ? 'border-destructive' : ''}`}
                placeholder="مثال: مبادئ البرمجة"
              />
              {form.formState.errors.name && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-bold text-foreground/70 mr-1">رمز المقرر</Label>
              <Input 
                id="code" 
                {...form.register("code")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.code ? 'border-destructive' : ''}`}
                placeholder="مثال: CS101"
              />
              {form.formState.errors.code && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-bold text-foreground/70 mr-1">القسم</Label>
              <Input 
                id="department" 
                {...form.register("department")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.department ? 'border-destructive' : ''}`}
                placeholder="مثال: علوم الحاسوب"
              />
              {form.formState.errors.department && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits" className="text-sm font-bold text-foreground/70 mr-1">عدد الساعات</Label>
              <Input 
                id="credits" 
                type="number"
                {...form.register("credits")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.credits ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.credits && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.credits.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_students" className="text-sm font-bold text-foreground/70 mr-1">الحد الأقصى للطلاب</Label>
              <Input 
                id="max_students" 
                type="number"
                {...form.register("max_students")}
                className={`h-11 rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all ${form.formState.errors.max_students ? 'border-destructive' : ''}`}
              />
              {form.formState.errors.max_students && (
                <p className="text-xs font-bold text-destructive mr-1">{form.formState.errors.max_students.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-bold text-foreground/70 mr-1">وصف المقرر</Label>
              <Textarea 
                id="description" 
                {...form.register("description")}
                className={`min-h-[100px] rounded-xl border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all resize-none ${form.formState.errors.description ? 'border-destructive' : ''}`}
                placeholder="اكتب وصفاً مختصراً للمقرر وأهدافه..."
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
              disabled={addCourseMutation.isPending}
              className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {addCourseMutation.isPending ? "جاري الحفظ..." : "حفظ المقرر"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
