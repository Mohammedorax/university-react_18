import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Student } from "@/features/students/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useStudents, useUpdateStudent } from "@/features/students/hooks/useStudents";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { studentSchema, StudentFormValues } from "../schemas/studentSchema";
import { Pencil, Loader2 } from "lucide-react";

interface EditStudentDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

/**
 * @component EditStudentDialog
 * @description نافذة منبثقة لتعديل بيانات طالب موجود.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر واجهة مستخدم متناسقة مع نموذج الإضافة.
 */
export function EditStudentDialog({ student, trigger }: EditStudentDialogProps) {
  const { data: studentsResponse } = useStudents();
  const students = studentsResponse?.items || [];
  const updateStudentMutation = useUpdateStudent();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
      university_id: student.university_id,
      department: student.department,
      year: student.year,
      gpa: student.gpa,
    },
  });

  // تحديث قيم النموذج عند تغيير الطالب المختار
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: student.name,
        email: student.email,
        university_id: student.university_id,
        department: student.department,
        year: student.year,
        gpa: student.gpa,
      });
    }
  }, [student, isOpen, form]);

  const onSubmit = async (values: StudentFormValues) => {
    // التحقق من التكرار (باستثناء الطالب الحالي)
    if (students.some(s => s.email === values.email && s.id !== student.id)) {
      toast.error("البريد الإلكتروني مسجل بالفعل لطالب آخر");
      return;
    }

    if (students.some(s => s.university_id === values.university_id && s.id !== student.id)) {
      toast.error("الرقم الجامعي مسجل بالفعل لطالب آخر");
      return;
    }

    try {
      await updateStudentMutation.mutateAsync({
        id: student.id,
        data: values
      });
      toast.success("تم تحديث بيانات الطالب بنجاح");
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل في تحديث بيانات الطالب"
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 font-bold rounded-xl">
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
            <Pencil className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black">تعديل بيانات الطالب</DialogTitle>
            <DialogDescription className="font-medium">
              تحديث معلومات الطالب {student.name} في النظام.
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أحمد محمد علي" {...field} className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="student@university.edu" {...field} className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="university_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">الرقم الجامعي</FormLabel>
                    <FormControl>
                      <Input placeholder="2024001" {...field} className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">القسم الأكاديمي</FormLabel>
                    <FormControl>
                      <Input placeholder="علوم الحاسب" {...field} className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">السنة الدراسية</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="7" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value, 10))}
                        className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">المعدل (GPA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="4" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        className="rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold h-12 px-6">
                إلغاء
              </Button>
              <Button type="submit" disabled={updateStudentMutation.isPending} className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20 gap-2">
                {updateStudentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
