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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/features/courses/types";
import { useEntityDocuments } from "@/hooks/documents/useEntityDocuments";
import { 
  BookOpen, 
  Clock, 
  MapPin, 
  Users, 
  Info, 
  ListChecks, 
  Calendar, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { toast } from 'sonner';

interface CourseDetailsDialogProps {
  course: Course;
  trigger?: React.ReactNode;
}

/**
 * مكون حوار عرض تفاصيل المقرر الدراسي.
 * يعرض معلومات شاملة عن المقرر بما في ذلك الجدول الدراسي، المتطلبات، والمدرس.
 * يتم تقسيم المعلومات إلى تبويبات لتسهيل التصفح.
 * 
 * @param {CourseDetailsDialogProps} props - خصائص المكون
 * @returns {JSX.Element} نافذة حوار تفاصيل المقرر
 */
export function CourseDetailsDialog({ course, trigger }: CourseDetailsDialogProps) {
  const { documents, isLoading: isLoadingDocs, isUploading, uploadDocument, deleteDocument } = useEntityDocuments(course.id, 'course');
  const youtubeResources = course.resources || []

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument({ file });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm" aria-label={`عرض تفاصيل المقرر ${course.name}`}>عرض</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span>تفاصيل المقرر</span>
          </DialogTitle>
          <DialogDescription>
            المعلومات الأكاديمية والجدول الدراسي والمصادر التعليمية
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4" aria-label="أقسام تفاصيل المقرر">
            <TabsTrigger value="info" aria-label="معلومات المقرر">المعلومات</TabsTrigger>
            <TabsTrigger value="schedule" aria-label="الجدول الدراسي">الجدول</TabsTrigger>
            <TabsTrigger value="requirements" aria-label="المتطلبات السابقة">المتطلبات</TabsTrigger>
            <TabsTrigger value="resources" aria-label="المصادر التعليمية والوثائق">المصادر</TabsTrigger>
          </TabsList>

          {/* Course Info Tab */}
          <TabsContent value="info" className="space-y-4 py-4" role="region" aria-label="معلومات المقرر">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2 bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">اسم المقرر</span>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{course.name}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono font-bold" aria-label={`رمز المقرر: ${course.code}`}>{course.code}</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">القسم</span>
                <span className="font-semibold">{course.department}</span>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">الساعات المعتمدة</span>
                <span className="font-semibold">{course.credits} ساعات</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">المدرس</span>
                <span className="font-semibold">{course.teacher_name || 'غير محدد'}</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-2">
                    <Users className="h-3 w-3" aria-hidden="true" /> الطلاب المسجلين
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{course.enrolled_students} / {course.max_students}</span>
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden ml-2" aria-hidden="true">
                        <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${Math.min((course.enrolled_students / course.max_students) * 100, 100)}%` }}
                        />
                    </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <Info className="h-3 w-3" aria-hidden="true" /> الوصف
                </span>
                <p className="text-sm leading-relaxed">{course.description}</p>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 py-4" role="region" aria-label="الجدول الدراسي">
             <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                المواعيد الأسبوعية
              </h3>
            </div>
            
            {course.schedule && course.schedule.length > 0 ? (
                <div className="grid gap-2" role="list" aria-label="قائمة المواعيد">
                    {course.schedule.map((s, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors" role="listitem">
                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold" aria-hidden="true">
                                    {i + 1}
                                </div>
                                <span className="font-medium">{s.day}</span>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                    <span>{s.start_time} - {s.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" aria-hidden="true" />
                                    <span>{s.room}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                    لا يوجد جدول دراسي محدد لهذا المقرر
                </div>
            )}
          </TabsContent>

          {/* Prerequisites Tab */}
          <TabsContent value="requirements" className="space-y-4 py-4" role="region" aria-label="المتطلبات السابقة">
             <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                المتطلبات السابقة
              </h3>
            </div>

            {course.prerequisites && course.prerequisites.length > 0 ? (
                <div className="flex flex-wrap gap-2" role="list" aria-label="قائمة المتطلبات">
                    {course.prerequisites.map((req, i) => (
                        <div key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium border" role="listitem">
                            {req}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                    لا توجد متطلبات سابقة لهذا المقرر
                </div>
            )}
          </TabsContent>

          {/* Resources Tab (New) */}
          <TabsContent value="resources" className="space-y-4 py-4" role="region" aria-label="المصادر التعليمية والوثائق">
            {youtubeResources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">مرئيات وشروحات YouTube الخاصة بالمقرر</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {youtubeResources.map((video) => (
                    <article key={video.id} className="rounded-xl border bg-card p-2.5">
                      <div className="overflow-hidden rounded-lg border bg-muted/20">
                        <iframe
                          src={video.embedUrl}
                          title={video.title}
                          className="h-44 w-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                      <div className="mt-2">
                        <p className="line-clamp-1 text-sm font-bold">{video.title}</p>
                        <p className="text-xs text-muted-foreground">القناة: {video.channel}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" />
                المصادر والمرفقات
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="course-file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  aria-label="رفع مصدر تعليمي جديد"
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isUploading}
                >
                  <label htmlFor="course-file-upload" className="cursor-pointer flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                    رفع مصدر
                  </label>
                </Button>
              </div>
            </div>

            {isLoadingDocs ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground" role="status">
                <Loader2 className="h-8 w-8 animate-spin mb-2" aria-hidden="true" />
                <span>جاري تحميل المصادر...</span>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid gap-3" role="list" aria-label="قائمة المصادر">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    role="listitem"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded bg-primary/5 flex items-center justify-center text-primary shrink-0" aria-hidden="true">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString('ar-SA')} • {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        asChild
                        aria-label={`تحميل ${doc.name}`}
                      >
                        <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المصدر؟')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        aria-label={`حذف ${doc.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
                <p>لا توجد مصادر تعليمية لهذا المقرر</p>
                <p className="text-sm">يمكنك رفع ملفات (Syllabus, slides, assignments, etc.)</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" aria-label="إغلاق نافذة التفاصيل">إغلاق</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
