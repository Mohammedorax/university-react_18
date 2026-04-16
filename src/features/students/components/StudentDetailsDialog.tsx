import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';
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
import { Student } from "@/features/students/types";
import { useAssignDiscount, useRemoveDiscount } from "@/features/students/hooks/useStudents";
import { useEntityDocuments } from "@/hooks/documents/useEntityDocuments";
import { useDiscounts } from "@/features/finance/hooks/useDiscounts";
import type { StudentDocument } from "@/services/api";
import { Trash2, Plus, User, BookOpen, Percent, FileText, Download, Upload, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface StudentDetailsDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

/**
 * مكون حوار عرض تفاصيل الطالب وإدارة بياناته.
 * يتيح عرض المعلومات الشخصية، المقررات المسجلة، وإدارة الخصومات والمنح الدراسية، والوثائق.
 */
export function StudentDetailsDialog({ student, trigger }: StudentDetailsDialogProps) {
  const { data: discounts = [] } = useDiscounts();
  const { documents, isLoading: isLoadingDocs, isUploading, uploadDocument, deleteDocument } = useEntityDocuments(student.id, 'student');
  const assignDiscountMutation = useAssignDiscount();
  const removeDiscountMutation = useRemoveDiscount();
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument({ file });
    }
  };

  const assignedDiscounts = discounts.filter(d => student.assigned_discounts?.includes(d.id));
  const availableDiscounts = discounts.filter(d => !student.assigned_discounts?.includes(d.id) && d.active);

  const handleAssignDiscount = async () => {
    if (!selectedDiscountId) return;
    setIsAssigning(true);
    try {
      await assignDiscountMutation.mutateAsync({ studentId: student.id, discountId: selectedDiscountId });
      toast.success('تم إضافة الخصم للطالب بنجاح');
      setSelectedDiscountId("");
    } catch (error) {
      logger.error('Failed to assign discount', { error: error instanceof Error ? error.message : String(error) });
      toast.error('حدث خطأ أثناء إضافة الخصم');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveDiscount = async (discountId: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا الخصم؟')) {
        try {
            await removeDiscountMutation.mutateAsync({ studentId: student.id, discountId });
            toast.success('تم إزالة الخصم بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء إزالة الخصم');
        }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm" aria-label={`عرض تفاصيل الطالب ${student.name}`}>عرض</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            <span>تفاصيل الطالب</span>
          </DialogTitle>
          <DialogDescription>
            إدارة بيانات الطالب والخصومات والمقررات
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4" aria-label="أقسام تفاصيل الطالب">
            <TabsTrigger value="profile" aria-label="البيانات الشخصية للطالب">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="courses" aria-label="المقررات الدراسية المسجلة">المقررات الدراسية</TabsTrigger>
            <TabsTrigger value="discounts" aria-label="إدارة الخصومات والمنح">الخصومات والمنح</TabsTrigger>
            <TabsTrigger value="documents" aria-label="الوثائق والمستندات">الوثائق</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 py-4" role="region" aria-label="البيانات الشخصية للطالب">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">الاسم</span>
                <span className="font-semibold text-lg">{student.name}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">البريد الإلكتروني</span>
                <span className="font-semibold">{student.email}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">الرقم الجامعي</span>
                <span className="font-semibold font-mono">{student.university_id}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">القسم</span>
                <span className="font-semibold">{student.department}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">السنة الدراسية</span>
                <span className="font-semibold">{student.year}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1">المعدل التراكمي (GPA)</span>
                <span className={cn(
                  "font-bold text-lg",
                  student.gpa && student.gpa >= 3.0 ? "text-primary" : "text-destructive"
                )}>
                  {student.gpa?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </TabsContent>
          
          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4 py-4" role="region" aria-label="المقررات الدراسية المسجلة">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                المقررات المسجلة
              </h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                {student.enrolled_courses.length} مقرر
              </span>
            </div>
            
            {student.enrolled_courses.length > 0 ? (
              <div className="grid gap-2" role="list" aria-label="قائمة المقررات المسجلة">
                {student.enrolled_courses.map((courseId, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors" role="listitem">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold ml-3" aria-hidden="true">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">رمز المقرر: {courseId}</p>
                      {/* In a real app we would fetch course details here */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                لا توجد مقررات مسجلة لهذا الطالب حالياً
              </div>
            )}
          </TabsContent>
          
          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-4 py-4" role="region" aria-label="إدارة الخصومات والمنح">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Percent className="h-4 w-4" aria-hidden="true" />
                إدارة الخصومات
              </h3>
            </div>
            
            <div className="flex gap-2 mb-6 bg-muted/30 p-4 rounded-lg border">
                <select 
                    className="flex-1 p-2 border rounded-md text-sm bg-background"
                    value={selectedDiscountId}
                    onChange={(e) => setSelectedDiscountId(e.target.value)}
                    aria-label="اختر خصم لإضافته"
                >
                    <option value="">اختر خصم لإضافته...</option>
                    {availableDiscounts.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.name} ({d.type === 'percentage' ? `${d.value}%` : `${d.value} ريال`})
                        </option>
                    ))}
                </select>
                <Button 
                    onClick={handleAssignDiscount} 
                    disabled={!selectedDiscountId || isAssigning}
                    size="sm"
                    aria-label="إضافة الخصم المختار للطالب"
                >
                    <Plus className="w-4 h-4 ml-1" aria-hidden="true" /> إضافة
                </Button>
            </div>

            <div className="space-y-3" role="list" aria-label="قائمة الخصومات المعينة">
                {assignedDiscounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                        <Percent className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                        <p>لا يوجد خصومات معينة لهذا الطالب</p>
                    </div>
                ) : (
                    assignedDiscounts.map(d => (
                        <div key={d.id} className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow" role="listitem">
                            <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-base">{d.name}</p>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    d.type === 'percentage' 
                                      ? 'bg-primary/20 text-primary' 
                                      : 'bg-primary/10 text-primary/80'
                                  )}>
                                    {d.type === 'percentage' ? `${d.value}%` : `${d.value} ريال`}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveDiscount(d.id)}
                                aria-label={`إزالة خصم ${d.name}`}
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 py-4" role="region" aria-label="الوثائق والمستندات">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                المستندات المرفوعة
              </h3>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                  disabled={isUploading}
                >
                  <label htmlFor="file-upload" className="flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    رفع مستند جديد
                  </label>
                </Button>
              </div>
            </div>

            <div className="space-y-3" role="list" aria-label="قائمة المستندات">
              {isLoadingDocs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg" role="status">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  <p>لا توجد مستندات مرفوعة لهذا الطالب</p>
                </div>
              ) : (
                documents.map((doc: StudentDocument) => (
                  <div key={doc.id} className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow" role="listitem">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString('ar-SA')} • {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        asChild
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        aria-label={`تحميل ${doc.name}`}
                      >
                        <a href={doc.url} download={doc.name}>
                          <Download className="w-4 h-4" aria-hidden="true" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        aria-label={`حذف ${doc.name}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" aria-label="إغلاق نافذة التفاصيل">إغلاق</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
