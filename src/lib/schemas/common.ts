import { z } from "zod";

/**
 * @file common.ts
 * @description مخططات التحقق المشتركة لإعادة الاستخدام عبر النظام.
 */

export const commonSchemas = {
  /** الاسم الثلاثي أو الرباعي */
  name: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(100, "الاسم طويل جداً"),

  /** البريد الإلكتروني الأكاديمي أو الشخصي */
  email: z
    .string()
    .email("البريد الإلكتروني غير صالح")
    .min(5, "البريد الإلكتروني قصير جداً"),

  /** المعرفات الفريدة (الرقم الجامعي، رقم الموظف) */
  id: z
    .string()
    .min(5, "المعرف يجب أن يكون 5 أحرف على الأقل")
    .max(20, "المعرف طويل جداً"),

  /** القسم أو الكلية */
  department: z
    .string()
    .min(1, "يجب اختيار القسم"),

  /** كلمة المرور */
  password: z
    .string()
    .min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
    .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير واحد على الأقل")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل"),

  /** الوصف أو الملاحظات */
  description: z
    .string()
    .max(500, "الوصف طويل جداً (الحد الأقصى 500 حرف)")
    .optional()
    .or(z.literal("")),

  /** القيمة المالية أو الأرقام الموجبة */
  positiveNumber: (label: string = "القيمة") => z
    .number({
      required_error: `${label} مطلوبة`,
      invalid_type_error: `${label} يجب أن تكون رقماً`,
    })
    .min(0, `${label} لا يمكن أن تكون أقل من 0`),
};

/**
 * @schema baseEntitySchema
 * @description المخطط الأساسي الذي تشترك فيه معظم الكيانات (اسم، بريد).
 */
export const baseEntitySchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
});
