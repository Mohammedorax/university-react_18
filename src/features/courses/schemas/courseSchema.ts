import { z } from "zod";
import { commonSchemas } from "@/lib/schemas/common";

/**
 * @schema courseSchema
 * @description مخطط التحقق من صحة بيانات المقرر الدراسي باستخدام Zod.
 */
export const courseSchema = z.object({
  name: commonSchemas.name,
  description: commonSchemas.description.and(z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل")),
  code: z.string().min(2, "يجب أن يكون رمز المقرر حرفين على الأقل"),
  credits: commonSchemas.positiveNumber("عدد الساعات").min(1, "يجب أن يكون عدد الساعات ساعة واحدة على الأقل"),
  department: commonSchemas.department,
  max_students: commonSchemas.positiveNumber("الحد الأقصى للطلاب").min(1, "يجب أن يكون الحد الأقصى للطلاب طالب واحد على الأقل"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
