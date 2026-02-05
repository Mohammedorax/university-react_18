import { z } from "zod";
import { commonSchemas } from "@/lib/schemas/common";

/**
 * @schema inventorySchema
 * @description مخطط التحقق من صحة بيانات عناصر المخزون باستخدام Zod.
 */
export const inventorySchema = z.object({
  name: commonSchemas.name.min(2, "اسم العنصر يجب أن يكون حرفين على الأقل"),
  category: z.string().min(1, "يجب اختيار التصنيف"),
  quantity: commonSchemas.positiveNumber("الكمية"),
  min_quantity: commonSchemas.positiveNumber("الحد الأدنى"),
  unit: z.string().min(1, "يجب تحديد الوحدة (مثال: قطعة، صندوق)"),
  location: z.string().optional(),
  status: z.enum(["available", "low_stock", "out_of_stock"], {
    errorMap: () => ({ message: "يجب اختيار حالة صحيحة" }),
  }),
  price: commonSchemas.positiveNumber("السعر"),
  sku: z.string().min(3, "الرمز (SKU) يجب أن يكون 3 أحرف على الأقل"),
});

/**
 * @type InventoryFormData
 * @description نوع البيانات المستخرج من مخطط التحقق (Zod Schema) لاستخدامه في النماذج.
 */
export type InventoryFormData = z.infer<typeof inventorySchema>;
