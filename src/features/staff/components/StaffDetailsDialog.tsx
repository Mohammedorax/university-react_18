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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Staff } from "@/features/staff/types";
import { useEntityDocuments } from "@/hooks/documents/useEntityDocuments";
import { User, Mail, Briefcase, Building2, Phone, FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface StaffDetailsDialogProps {
  staff: Staff;
  trigger?: React.ReactNode;
}

/**
 * مكون حوار عرض تفاصيل الموظف.
 * يعرض المعلومات الشخصية والوظيفية للموظف في واجهة منظمة.
 * 
 * @param {StaffDetailsDialogProps} props - خصائص المكون
 * @returns {JSX.Element} نافذة حوار تفاصيل الموظف
 */
export function StaffDetailsDialog({ staff, trigger }: StaffDetailsDialogProps) {
  const { documents, isLoading: isLoadingDocs, isUploading, uploadDocument, deleteDocument } = useEntityDocuments(staff.id, 'staff');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument({ file });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm" aria-label={`عرض تفاصيل الموظف ${staff.name}`}>عرض التفاصيل</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            <span>تفاصيل الموظف</span>
          </DialogTitle>
          <DialogDescription>
            المعلومات الوظيفية والشخصية والوثائق
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2" aria-label="أقسام تفاصيل الموظف">
            <TabsTrigger value="info" aria-label="المعلومات الشخصية والوظيفية">المعلومات</TabsTrigger>
            <TabsTrigger value="documents" aria-label="الوثائق والمستندات">الوثائق</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="py-4" role="region" aria-label="تفاصيل الموظف">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg md:col-span-2">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" aria-hidden="true" /> الاسم
                </span>
                <span className="font-semibold text-lg">{staff.name}</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" aria-hidden="true" /> المسمى الوظيفي
                </span>
                <span className="font-semibold">{staff.job_title}</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" aria-hidden="true" /> القسم
                </span>
                <span className="font-semibold">{staff.department}</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" aria-hidden="true" /> البريد الإلكتروني
                </span>
                <span className="font-semibold">{staff.email}</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" aria-hidden="true" /> رقم الهاتف
                </span>
                <span className="font-semibold">{staff.phone || "غير متوفر"}</span>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 py-4" role="region" aria-label="الوثائق والمستندات">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" aria-hidden="true" />
                الوثائق والمرفقات
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="staff-file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  aria-label="رفع وثيقة جديدة"
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isUploading}
                >
                  <label htmlFor="staff-file-upload" className="cursor-pointer flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                    رفع وثيقة
                  </label>
                </Button>
              </div>
            </div>

            {isLoadingDocs ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground" role="status">
                <Loader2 className="h-8 w-8 animate-spin mb-2" aria-hidden="true" />
                <span>جاري تحميل الوثائق...</span>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid gap-3" role="list" aria-label="قائمة الوثائق">
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
                          if (confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
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
                <p>لا توجد وثائق لهذا الموظف</p>
                <p className="text-sm">يمكنك رفع ملفات (ID copy, contract, etc.)</p>
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
