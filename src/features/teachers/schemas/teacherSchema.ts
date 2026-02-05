import { z } from "zod";
import { commonSchemas, baseEntitySchema } from "@/lib/schemas/common";

/**
 * مخطط التحقق من صحة بيانات المدرس باستخدام Zod.
 * يشمل التحقق من الاسم، البريد الإلكتروني، القسم، والتخصص.
 */
export const teacherSchema = baseEntitySchema.extend({
  department: commonSchemas.department,
  specialization: z.string().min(2, {
    message: "يرجى إدخال التخصص",
  }),
  taught_courses: z.array(z.string()).default([]),
});

/**
 * نوع البيانات المستخرجة من مخطط التحقق لبيانات المدرس.
 */
export type TeacherFormValues = z.infer<typeof teacherSchema>;
