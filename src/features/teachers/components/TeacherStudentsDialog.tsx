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
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { useStudents } from "@/features/students/hooks/useStudents";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Course } from "@/features/courses/types";
import { Student } from "@/features/students/types";

interface TeacherStudentsDialogProps {
  teacherCourses: Course[];
}

/**
 * نافذة تعرض قائمة جميع الطلاب المسجلين في أي من مقررات المعلم.
 */
export function TeacherStudentsDialog({ teacherCourses }: TeacherStudentsDialogProps) {
  const { data: studentsResponse, isLoading } = useStudents();
  const students = useMemo(() => studentsResponse?.items || [], [studentsResponse?.items]);
  const [isStudentsLoaded, setIsStudentsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && students.length > 0) {
      setIsStudentsLoaded(true);
    }
  }, [isLoading, students.length]); // Use length to avoid re-running if array ref changes but length is same

  // الحصول على جميع الطلاب المسجلين في أي من مقررات المعلم
  const teacherCourseIds = useMemo(() => teacherCourses.map(c => c.id), [teacherCourses]);
  
  const myStudents = useMemo(() => students.filter(student =>
    student.enrolled_courses.some(courseId => teacherCourseIds.includes(courseId))
  ), [students, teacherCourseIds]);

  const columns: DataTableColumn<Student>[] = [
    { 
      key: 'name', 
      title: 'الاسم',
      sortable: true,
      render: (value: unknown) => <span className="font-bold">{value as string}</span>
    },
    { 
      key: 'university_id', 
      title: 'الرقم الجامعي',
      sortable: true
    },
    { 
      key: 'department', 
      title: 'القسم',
      sortable: true
    },
    { 
      key: 'id', 
      title: 'المقررات المسجلة معي',
      render: (_, student) => {
        const enrolledIn = teacherCourses.filter(c => student.enrolled_courses.includes(c.id));
        return (
          <div className="flex flex-wrap gap-1" aria-label="المقررات المسجلة">
            {enrolledIn.map(c => (
              <span key={c.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {c.code}
              </span>
            ))}
          </div>
        );
      }
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs" aria-label="عرض قائمة طلابي">
           عرض القائمة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black">طلابي</DialogTitle>
          <DialogDescription className="text-base font-medium">
            قائمة بجميع الطلاب المسجلين في مقرراتك الدراسية ({myStudents.length} طالب)
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isLoading && !isStudentsLoaded ? (
            <div className="flex h-[300px] w-full items-center justify-center" role="status" aria-busy="true" aria-label="جاري تحميل قائمة الطلاب">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
                <p className="text-muted-foreground font-bold">جاري تحميل بيانات الطلاب...</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={myStudents}
              columns={columns}
              searchPlaceholder="بحث باسم الطالب أو الرقم الجامعي..."
              emptyMessage="لا يوجد طلاب مسجلين في مقرراتك بعد"
            />
          )}
        </div>
        
        <DialogFooter className="p-6 pt-0 bg-muted/20">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="font-bold px-8" aria-label="إغلاق نافذة الطلاب">إغلاق</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
