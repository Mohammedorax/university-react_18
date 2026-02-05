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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSubmitGrade } from "@/features/grades/hooks/useGrades";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Calculator, Save, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/features/courses/types";
import { Grade } from "@/features/grades/types";

/**
 * @description مخطط التحقق من صحة بيانات الدرجة باستخدام Zod
 * يضمن أن الدرجات ضمن النطاق المسموح به (0-100) وأن الأوزان صحيحة.
 */
const gradeSchema = z.object({
  midterm_score: z.coerce.number().min(0, 'يجب أن تكون الدرجة 0 أو أكثر').max(100, 'الحد الأقصى للدرجة هو 100'),
  final_score: z.coerce.number().min(0, 'يجب أن تكون الدرجة 0 أو أكثر').max(100, 'الحد الأقصى للدرجة هو 100'),
  assignments: z.array(z.object({
    name: z.string().min(1, 'يرجى إدخال اسم الواجب'),
    score: z.coerce.number().min(0, 'يجب أن تكون الدرجة 0 أو أكثر'),
    max_score: z.coerce.number().min(1, 'الحد الأقصى يجب أن يكون 1 على الأقل'),
    weight: z.coerce.number().min(0).max(1, 'النسبة يجب أن تكون بين 0 و 1')
  }))
});

/**
 * @type GradeFormValues
 * @description نوع البيانات المستخرج من مخطط Zod للنموذج.
 */
type GradeFormValues = z.infer<typeof gradeSchema>;

/**
 * @interface EditGradeDialogProps
 * @description الخصائص المطلوبة لمكون EditGradeDialog.
 */
interface EditGradeDialogProps {
  /** معرف الطالب */
  student_id: string;
  /** اسم الطالب الكامل */
  studentName: string;
  /** بيانات المقرر الدراسي */
  course: Course;
  /** بيانات الدرجة الحالية (في حالة التعديل) */
  currentGrade?: Grade;
  /** عنصر الواجهة الذي سيقوم بفتح النافذة */
  trigger?: React.ReactNode;
}

/**
 * @component EditGradeDialog
 * @description نافذة رصد وتعديل درجات الطلاب مع دعم التحقق الفوري والحساب التلقائي للمعدل.
 * 
 * المميزات:
 * - التحقق من صحة البيانات باستخدام Zod.
 * - إدارة الحالة باستخدام React Hook Form.
 * - حساب تلقائي للدرجة النهائية والتقدير الحرفي.
 * - إمكانية إضافة وحذف الواجبات ديناميكياً.
 * - واجهة مستخدم متوافقة مع RTL ودعم كامل للغة العربية.
 * 
 * @param {EditGradeDialogProps} props - خصائص المكون
 * @returns {JSX.Element} مكون نافذة الحوار
 */
export function EditGradeDialog({ 
  student_id, 
  studentName, 
  course, 
  currentGrade, 
  trigger 
}: EditGradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const submitGradeMutation = useSubmitGrade();

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      midterm_score: currentGrade?.midterm_score || 0,
      final_score: currentGrade?.final_score || 0,
      assignments: currentGrade?.assignments || [
        { name: 'الواجب الأول', score: 0, max_score: 10, weight: 0.1 },
        { name: 'الواجب الثاني', score: 0, max_score: 10, weight: 0.1 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  // إعادة ضبط النموذج عند فتح النافذة ببيانات جديدة لضمان المزامنة
  useEffect(() => {
    if (isOpen) {
      form.reset({
        midterm_score: currentGrade?.midterm_score || 0,
        final_score: currentGrade?.final_score || 0,
        assignments: currentGrade?.assignments || [
          { name: 'الواجب الأول', score: 0, max_score: 10, weight: 0.1 },
          { name: 'الواجب الثاني', score: 0, max_score: 10, weight: 0.1 }
        ],
      });
    }
  }, [isOpen, currentGrade, form]);

  /**
   * @function calculateTotal
   * @description حساب الدرجة الإجمالية بناءً على الأوزان النسبية للواجبات والاختبارات.
   * @param {GradeFormValues} values - قيم النموذج الحالية
   * @returns {number} الدرجة النهائية المئوية
   */
  const calculateTotal = (values: GradeFormValues) => {
    const assignmentsWeight = values.assignments.reduce((sum, assignment) => {
      if (assignment.max_score <= 0) return sum;
      return sum + (assignment.score / assignment.max_score) * (assignment.weight || 0);
    }, 0);
    
    const midtermWeight = (values.midterm_score / 100) * 0.3; // 30% لمنتصف الفصل
    const finalWeight = (values.final_score / 100) * 0.5; // 50% للنهائي

    return Math.min(100, (assignmentsWeight + midtermWeight + finalWeight) * 100);
  };

  /**
   * @function getLetterGrade
   * @description تحويل الدرجة الرقمية إلى نظام التقدير الحرفي المعتمد.
   * @param {number} score - الدرجة المئوية
   * @returns {string} التقدير الحرفي (A, B+, C, etc.)
   */
  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  };

  /**
   * @function getGradePoints
   * @description تحويل التقدير الحرفي إلى نقاط المعدل التراكمي (GPA).
   * @param {string} letterGrade - التقدير الحرفي
   * @returns {number} نقاط المعدل (من 4.0)
   */
  const getGradePoints = (letterGrade: string) => {
    const points: Record<string, number> = {
      'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
    };
    return points[letterGrade] || 0.0;
  };

  /**
   * @function onSubmit
   * @description معالجة إرسال النموذج وحفظ البيانات عبر الـ API.
   * @param {GradeFormValues} values - قيم النموذج التي تم التحقق منها
   */
  const onSubmit = async (values: GradeFormValues) => {
    const totalScore = calculateTotal(values);
    const letterGrade = getLetterGrade(totalScore);
    const gradePoints = getGradePoints(letterGrade);

    const gradeData = {
      student_id,
      course_id: course.id,
      course_name: course.name,
      course_code: course.code,
      credits: course.credits,
      semester: currentGrade?.semester || course.semester || 'الفصل الأول',
      year: Number(currentGrade?.year || course.year || new Date().getFullYear()),
      assignments: values.assignments as { name: string; score: number; max_score: number; weight: number }[],
      midterm_score: values.midterm_score,
      final_score: values.final_score,
      total_score: totalScore,
      letter_grade: letterGrade,
      grade_points: gradePoints,
      updated_at: new Date().toISOString()
    };

    try {
      if (currentGrade?.id) {
        await submitGradeMutation.mutateAsync({ ...gradeData, id: currentGrade.id });
      } else {
        await submitGradeMutation.mutateAsync(gradeData);
      }
      
      toast.success("تم حفظ الدرجة بنجاح", {
        description: `تم رصد الدرجة النهائية (${totalScore.toFixed(1)}%) للطالب ${studentName}`,
      });
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "فشل في حفظ الدرجة";
      toast.error(errorMessage, {
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  };

  const currentValues = form.watch();
  const currentTotal = useMemo(() => calculateTotal(currentValues), [currentValues]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
            {currentGrade?.id ? 'تعديل الدرجة' : 'رصد الدرجة'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {currentGrade?.id ? 'تعديل درجة الطالب' : 'رصد درجة جديدة'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {course.name} ({course.code}) | الطالب: <span className="font-semibold text-foreground">{studentName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Save className="h-4 w-4 text-primary" />
                  أعمال الفصل (الواجبات والأنشطة)
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ name: '', score: 0, max_score: 10, weight: 0.1 })}
                  className="h-8 gap-1 rounded-lg border-primary/20 hover:bg-primary/5"
                >
                  <Plus className="h-3 w-3" />
                  إضافة واجب
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-5">اسم الواجب</div>
                  <div className="col-span-2 text-center">الدرجة</div>
                  <div className="col-span-2 text-center">الأقصى</div>
                  <div className="col-span-2 text-center">الوزن</div>
                  <div className="col-span-1"></div>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-card p-3 rounded-xl border shadow-sm transition-all hover:border-primary/30">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="اسم الواجب" className="h-9 rounded-lg border-muted-foreground/20" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" className="h-9 text-center rounded-lg border-muted-foreground/20" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.max_score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} type="number" placeholder="10" className="h-9 text-center rounded-lg border-muted-foreground/20" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" placeholder="0.1" className="h-9 text-center rounded-lg border-muted-foreground/20" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/5">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">لا توجد واجبات مضافة حالياً</p>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      onClick={() => append({ name: 'واجب جديد', score: 0, max_score: 10, weight: 0.1 })}
                    >
                      أضف واجبك الأول
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="midterm_score"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-bold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        درجة منتصف الفصل (30%)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="text-xl font-bold h-12 rounded-xl border-primary/20 focus:ring-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="final_score"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-bold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        درجة الامتحان النهائي (50%)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="text-xl font-bold h-12 rounded-xl border-primary/20 focus:ring-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-inner grid grid-cols-2 gap-8">
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">الدرجة الإجمالية</p>
                  <p className="text-4xl font-black text-primary drop-shadow-sm">{currentTotal.toFixed(1)}%</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">التقدير المتوقع</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-4xl font-black text-primary drop-shadow-sm">{getLetterGrade(currentTotal)}</p>
                    <div className="h-8 w-[1px] bg-primary/20 mx-1" />
                    <p className="text-lg font-bold text-muted-foreground">{getGradePoints(getLetterGrade(currentTotal)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t gap-3">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="flex-1 h-11 rounded-xl hover:bg-muted font-bold">
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/25 font-bold transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                disabled={submitGradeMutation.isPending}
              >
                {submitGradeMutation.isPending ? (
                  <>
                    <Plus className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ الدرجات النهائية
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

