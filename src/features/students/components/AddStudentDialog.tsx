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
import { toast } from "sonner";
import { useState } from "react";
import { useStudents, useAddStudent } from "@/features/students/hooks/useStudents";
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
import { UserPlus, Loader2 } from "lucide-react";
import { sanitizeText, isValidEmail, isValidUniversityId, containsDangerousContent } from '@/lib/security';

interface AddStudentDialogProps {
  trigger?: React.ReactNode;
}

/**
 * @component AddStudentDialog
 * @description نافذة منبثقة لإضافة طالب جديد للنظام.
 * تستخدم React Hook Form مع Zod للتحقق من صحة البيانات وتوفر واجهة مستخدم متناسقة.
 */
export function AddStudentDialog({ trigger }: AddStudentDialogProps) {
  const { data: studentsResponse } = useStudents();
  const students = studentsResponse?.items || [];
  const addStudentMutation = useAddStudent();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      university_id: "",
      department: "",
      year: 1,
      gpa: 0,
    },
  });

  const onSubmit = async (values: StudentFormValues) => {
    // تطهير المدخلات للحماية من XSS
    const sanitizedValues = {
      ...values,
      name: sanitizeText(values.name),
      email: sanitizeText(values.email),
      university_id: sanitizeText(values.university_id),
      department: sanitizeText(values.department),
    };

    // التحقق من صحة البريد الإلكتروني
    if (!isValidEmail(sanitizedValues.email)) {
      toast.error("البريد الإلكتروني غير صالح");
      return;
    }

    // التحقق من صحة الرقم الجامعي
    if (!isValidUniversityId(sanitizedValues.university_id)) {
      toast.error("الرقم الجامعي يجب أن يتكون من 8 أرقام");
      return;
    }

    // التحقق من وجود محتوى خطر
    if (containsDangerousContent(sanitizedValues.name) || 
        containsDangerousContent(sanitizedValues.department)) {
      toast.error("تم اكتشاف محتوى غير آمن");
      return;
    }

    // التحقق من التكرار
    if (students.some(s => s.email === sanitizedValues.email)) {
      toast.error("البريد الإلكتروني مسجل بالفعل لطالب آخر");
      return;
    }

    if (students.some(s => s.university_id === sanitizedValues.university_id)) {
      toast.error("الرقم الجامعي مسجل بالفعل لطالب آخر");
      return;
    }

    try {
      await addStudentMutation.mutateAsync({
        name: sanitizedValues.name,
        email: sanitizedValues.email,
        university_id: sanitizedValues.university_id,
        department: sanitizedValues.department,
        year: values.year,
        gpa: values.gpa,
        enrolled_courses: [],
      });
      toast.success("تمت إضافة الطالب بنجاح");
      form.reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل في إضافة الطالب"
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02]">
            <UserPlus className="h-4 w-4" />
            إضافة طالب
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black">إضافة طالب جديد</DialogTitle>
            <DialogDescription className="font-medium">
              أدخل بيانات الطالب الجديد بدقة لضمان تسجيله في النظام بشكل صحيح.
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
              <Button type="submit" disabled={addStudentMutation.isPending} className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20 gap-2">
                {addStudentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : "حفظ بيانات الطالب"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
