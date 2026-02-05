import { z } from "zod";
import { commonSchemas, baseEntitySchema } from "@/lib/schemas/common";

/**
 * @schema staffSchema
 * @description مخطط التحقق من صحة بيانات الموظف باستخدام Zod.
 */
export const staffSchema = baseEntitySchema.extend({
  department: commonSchemas.department,
  job_title: z.string().min(2, "يجب إدخال المسمى الوظيفي"),
  phone: z.string().min(8, "يجب أن يكون رقم الهاتف 8 أرقام على الأقل"),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
