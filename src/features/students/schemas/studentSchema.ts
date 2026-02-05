import { z } from "zod";
import { commonSchemas, baseEntitySchema } from "@/lib/schemas/common";

/**
 * @schema studentSchema
 * @description مخطط التحقق من صحة بيانات الطالب باستخدام Zod.
 * يضمن هذا المخطط أن جميع البيانات المدخلة للطالب تتبع القواعد المحددة.
 */
export const studentSchema = baseEntitySchema.extend({
  university_id: commonSchemas.id.describe("الرقم الجامعي"),
  department: commonSchemas.department,
  year: z
    .number({
      required_error: "يجب اختيار السنة الدراسية",
      invalid_type_error: "السنة الدراسية يجب أن تكون رقماً",
    })
    .min(1, "السنة الدراسية تبدأ من 1")
    .max(7, "السنة الدراسية لا تتجاوز 7"),
  gpa: z
    .number({
      required_error: "يجب إدخال المعدل التراكمي",
      invalid_type_error: "المعدل يجب أن يكون رقماً",
    })
    .min(0, "المعدل لا يمكن أن يكون أقل من 0")
    .max(4, "المعدل لا يمكن أن يتجاوز 4"),
  avatar: z.string().optional(),
});

/**
 * @type StudentFormValues
 * @description النوع المستخرج من مخطط Zod لاستخدامه في React Hook Form.
 */
export type StudentFormValues = z.infer<typeof studentSchema>;
