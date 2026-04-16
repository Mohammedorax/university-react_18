import { useEffect, useState } from 'react'

/**
 * خطاف لتأخير تحديث القيمة حتى يتوقف المستخدم عن الكتابة لفترة محددة.
 * مفيد للبحث أو الإدخال لتجنب الطلبات الزائدة.
 * @param value القيمة المراد تأخيرها
 * @param delay وقت التأخير بالمللي ثانية (افتراضي 500ms)
 * @returns القيمة المؤجلة
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
