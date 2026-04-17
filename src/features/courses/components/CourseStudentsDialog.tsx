import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { useStudents } from "@/features/students/hooks/useStudents";
import { Loader2, Users } from "lucide-react";
import { Student } from "@/features/students/types";
import { Course } from "@/features/courses/types";

interface CourseStudentsDialogProps {
  course: Course;
}

/**
 * @component CourseStudentsDialog
 * @description نافذة تعرض قائمة الطلاب المسجلين في مقرر معين.
 * تتيح للمدرسين والمسؤولين استعراض بيانات الطلاب المسجلين في مقرر دراسي محدد.
 * تستخدم المكون الموحد DataTable لعرض البيانات مع دعم البحث والفرز.
 * 
 * @param {CourseStudentsDialogProps} props - خصائص المكون
 * @returns {JSX.Element} نافذة حوار قائمة الطلاب
 */
export function CourseStudentsDialog({ course }: CourseStudentsDialogProps) {
  const { data: studentsResponse, isLoading } = useStudents();
  const students = studentsResponse?.items || [];
  
  // الحصول على الطلاب المسجلين في هذا المقرر
  const enrolledStudents = students.filter(student => 
    student.enrolled_courses.includes(course.id)
  );

  const columns: DataTableColumn<Student>[] = [
    { 
      key: 'name', 
      title: 'الاسم',
      sortable: true,
      render: (value) => <span className="font-semibold">{value as string}</span>
    },
    { 
      key: 'university_id', 
      title: 'الرقم الجامعي',
      sortable: true
    },
    { 
      key: 'department', 
      title: 'القسم' 
    },
    { 
      key: 'year', 
      title: 'السنة',
      sortable: true,
      render: (value) => <span className="text-muted-foreground">{value as number}</span>
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full gap-2">
          <Users className="h-4 w-4" />
          الطلاب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            الطلاب المسجلين في {course.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            قائمة بجميع الطلاب المسجلين في مقرر {course.code} - {course.department}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex h-[300px] w-full flex-col items-center justify-center gap-4" role="alert" aria-busy="true">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل قائمة الطلاب...</p>
          </div>
        ) : enrolledStudents.length > 0 ? (
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">إجمالي الطلاب:</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {enrolledStudents.length} / {course.max_students}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">موعد منتصف الفصل:</span>
                <span className="text-foreground">{(course as Course & { midterm_date?: string }).midterm_date || 'غير محدد'}</span>
              </div>
            </div>
            
            <DataTable 
              data={enrolledStudents}
              columns={columns}
              searchPlaceholder="بحث في أسماء الطلاب..."
              pageSize={5}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">لا يوجد طلاب مسجلين</h3>
            <p className="text-sm text-muted-foreground/60 max-w-[250px] mt-2">
              لم يتم تسجيل أي طلاب في هذا المقرر حتى الآن.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
