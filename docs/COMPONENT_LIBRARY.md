# Component Library Documentation

## جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [مكونات واجهة المستخدم](#مكونات-واجهة-المستخدم)
- [مكونات البيانات](#مكونات-البيانات)
- [مكونات النماذج](#مكونات-النماذج)
- [مكونات التقارير](#مكونات-التقارير)
- [أفضل الممارسات](#أفضل-الممارسات)

---

## نظرة عامة

مكتبة المكونات الخاصة بنظام إدارة الجامعة مبنية على React 18 و TypeScript، مع دعم كامل للغة العربية و RTL.

### التقنيات المستخدمة
- **React:** 18.3.1
- **TypeScript:** 5.8.3
- **Tailwind CSS:** 3.4.19
- **Radix UI:** مكونات واجهة مستخدم متينة
- **Lucide React:** أيقونات

### الميزات
- ✅ دعم كامل للغة العربية
- ✅ دعم RTL (من اليمين إلى اليسار)
- ✅ نوع TypeScript قوي
- ✅ دعم الوضع الليل/النهار
- ✅ قابلة للتخصيص
- ✅ متجاوبة مع الأجهزة المختلفة

---

## مكونات واجهة المستخدم

### Button (زر)

زر متعدد الاستخدام مع متغيرات مختلفة.

#### الاستخدام
```tsx
import { Button } from '@/components/ui/button';

<Button>زر أساسي</Button>
<Button variant="secondary">زر ثانوي</Button>
<Button variant="outline">زر محدد</Button>
<Button variant="ghost">زر شفاف</Button>
<Button variant="destructive">زر الحذف</Button>
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف | الافتراضي |
|---------|--------|---------|------------|
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | شكل الزر | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` | حجم الزر | `'md'` |
| `disabled` | `boolean` | ما إذا كان الزر معطلًا | `false` |
| `loading` | `boolean` | حالة التحميل | `false` |
| `icon` | `ReactNode` | أيقونة للزر | - |
| `children` | `ReactNode` | محتوى الزر | - |

---

### Input (إدخال)

حقل إدخال نص مع دعم التحقق.

#### الاستخدام
```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="البريد الإلكتروني" />
<Input type="password" placeholder="كلمة المرور" />
<Input type="number" placeholder="رقم الهاتف" />
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف |
|---------|--------|---------|
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel'` | نوع الإدخال |
| `placeholder` | `string` | نص العنصر النائب |
| `disabled` | `boolean` | حالة التعطيل |
| `required` | `boolean` | ما إذا كان الحقل مطلوبًا |
| `error` | `string` | رسالة الخطأ |
| `label` | `string` | وصف الحقل |

---

### Card (بطاقة)

حاوية محتوى بظل وحواف مستديرة.

#### الاستخدام
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
  </CardHeader>
  <CardContent>
    <p>محتوى البطاقة هنا...</p>
  </CardContent>
  <CardFooter>
    <Button>حفظ</Button>
  </CardFooter>
</Card>
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف |
|---------|--------|---------|
| `className` | `string` | فئات CSS إضافية |
| `children` | `ReactNode` | المحتوى الداخلي |

---

### Dialog (حوار)

نافذة منبثقة متعددة الاستخدام.

#### الاستخدام
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

<Dialog>
  <DialogTrigger asChild>
    <Button>فتح الحوار</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان الحوار</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      محتوى الحوار هنا...
    </div>
    <DialogFooter>
      <Button variant="outline">إلغاء</Button>
      <Button>تأكيد</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف | الافتراضي |
|---------|--------|---------|------------|
| `open` | `boolean` | حالة الفتح/الإغلاق | `false` |
| `onOpenChange` | `(open: boolean) => void` | عند تغيير الحالة | - |

---

### Toast (إشعار)

إشعارات سريعة الزوال.

#### الاستخدام
```tsx
import { toast } from 'sonner';

// عرض إشعار نجاح
toast.success('تم الحفظ بنجاح');

// عرض إشعار خطأ
toast.error('حدث خطأ أثناء الحفظ');

// عرض إشعار تحذير
toast.warning('يرجى التحقق من البيانات');

// عرض إشعار معلومات
toast.info('تمت العملية بنجاح');

// إشعار مخصص
toast('رسالة مخصصة', {
  description: 'تفاصيل إضافية',
  action: {
    label: 'إلغاء',
    onClick: () => console.log('إلغاء')
  }
});
```

---

### Select (اختيار)

قائمة منسدلة قابلة للتخصيص.

#### الاستخدام
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="اختر القسم" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="cs">علوم الحاسب</SelectItem>
    <SelectItem value="se">هندسة البرمجيات</SelectItem>
    <SelectItem value="is">نظم المعلومات</SelectItem>
  </SelectContent>
</Select>
```

---

## مكونات البيانات

### DataTable (جدول البيانات)

جدول متقدم مع الترتيب والبحث والترحيل.

#### الاستخدام
```tsx
import { DataTable } from '@/components/data-table/DataTable';

const columns = [
  { key: 'name', title: 'الاسم', sortable: true },
  { key: 'email', title: 'البريد الإلكتروني' },
  { key: 'department', title: 'القسم', sortable: true },
];

<DataTable
  data={students}
  columns={columns}
  searchPlaceholder="بحث في البيانات..."
  onRowSelection={(selected) => console.log(selected)}
  rowActions={(item) => (
    <Button onClick={() => console.log(item)}>تعديل</Button>
  )}
/>
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف | الافتراضي |
|---------|--------|---------|------------|
| `data` | `T[]` | البيانات للعرض | - |
| `columns` | `Column[]` | تعريف الأعمدة | - |
| `searchPlaceholder` | `string` | نص بحث العنصر النائب | - |
| `pageSize` | `number` | عدد العناصر لكل صفحة | `10` |
| `isLoading` | `boolean` | حالة التحميل | `false` |
| `virtualized` | `boolean` | تمكين العرض الافتراضي | `false` |
| `onRowSelection` | `(items: T[]) => void` | عند اختيار الصفوف | - |
| `rowActions` | `(item: T) => ReactNode` | أزرار إجراءات الصف | - |
| `bulkActions` | `(items: T[]) => ReactNode` | أزرار الإجراءات الجماعية | - |

---

### StatCard (بطاقة الإحصائيات)

بطاقة تعرض إحصائية واحدة.

#### الاستخدام
```tsx
import { StatCard } from '@/components/StatCard';

<StatCard
  title="عدد الطلاب"
  value="1,250"
  change="+12%"
  trend="up"
  icon={<Users className="w-5 h-5" />}
/>

<StatCard
  title="المواد النشطة"
  value="45"
  change="-3%"
  trend="down"
  icon={<BookOpen className="w-5 h-5" />}
/>
```

#### الخصائص (Props)
| الخاصية | النوع | الوصف |
|---------|--------|---------|
| `title` | `string` | عنوان البطاقة |
| `value` | `string \| number` | القيمة |
| `change` | `string` | نسبة التغيير |
| `trend` | `'up' \| 'down' \| 'neutral'` | اتجاه التغيير |
| `icon` | `ReactNode` | أيقونة العرض |
| `loading` | `boolean` | حالة التحميل |

---

## مكونات النماذج

### Form (نموذج)

مكون نموذج مدمج مع React Hook Form.

#### الاستخدام
```tsx
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون 2 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' }
});

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>الاسم</FormLabel>
        <Input {...field} />
        <FormMessage />
      </FormItem>
    )}
  />
  <Button type="submit">حفظ</Button>
</Form>
```

---

## مكونات التقارير

### ReportFilters (فلاتر التقارير)

مكون فلاتر شامل للتقارير.

#### الاستخدام
```tsx
import { ReportFilters } from '@/features/reports/components/ReportFilters';

<ReportFilters
  searchTerm={search}
  onSearchChange={setSearch}
  selectedDepartment={department}
  onDepartmentChange={setDepartment}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  onRefresh={handleRefresh}
  onReset={handleReset}
/>
```

---

### ReportChart (مخطط التقارير)

مكون مخطط تفاعلي باستخدام Recharts.

#### الاستخدام
```tsx
import { ReportChart } from '@/features/reports/components/ReportChart';

<ReportChart
  type="bar"
  data={chartData}
  xKey="month"
  yKey="count"
  title="إحصائيات الطلاب"
  colors={['#3b82f6', '#10b981', '#f59e0b']}
/>
```

---

### ExportOptions (خيارات التصدير)

مكون خيارات تصدير البيانات.

#### الاستخدام
```tsx
import { ExportOptions } from '@/features/reports/components/ExportOptions';

<ExportOptions
  isExporting={isExporting}
  onExportExcel={handleExcelExport}
  onPrint={handlePrint}
/>
```

---

## أفضل الممارسات

### استخدام المكونات

1. **الواردات دائماً من المسار المستعار**
   ```tsx
   // ✅ صحيح
   import { Button } from '@/components/ui/button';

   // ❌ غير صحيح
   import { Button } from '../../../components/ui/button';
   ```

2. **استخدام TypeScript صارم**
   ```tsx
   // ✅ صحيح
   interface Props {
     title: string;
     value: number;
   }

   // ❌ تجنب
   const props: any = { ... };
   ```

3. **دعم RTL دائماً**
   ```tsx
   // ✅ صحيح
   <div dir="rtl" className="font-cairo">
     <Button>زر</Button>
   </div>
   ```

### التخصيص

1. **استخدام Class Variance Authority**
   ```tsx
   import { cn } from '@/lib/utils';

   const buttonClass = cn(
     'base-class',
     variant === 'primary' && 'primary-variant',
     variant === 'secondary' && 'secondary-variant'
   );
   ```

2. **تخصيص الألوان عبر Tailwind**
   ```tsx
   <div className="bg-primary text-primary-foreground">
     محتوى مخصص
   </div>
   ```

### الأداء

1. **استخدام React.memo للمكونات الباهظة**
   ```tsx
   export const ExpensiveComponent = React.memo(({ data }) => {
     // منطق معقد
   });
   ```

2. **Memoization للوظائف**
   ```tsx
   const handleClick = useCallback(() => {
     // المنطق
   }, [dependencies]);
   ```

3. **Virtualization للقوائم الطويلة**
   ```tsx
   <DataTable
     data={largeData}
     virtualized={true}
     virtualHeight={600}
   />
   ```

### سهولة الوصول (Accessibility)

1. **السمات ARIA دائماً**
   ```tsx
   <Button aria-label="حفظ التغييرات">
     حفظ
   </Button>
   ```

2. **التنقل عبر لوحة المفاتيح**
   ```tsx
   <Input
     type="text"
     aria-label="الاسم الكامل"
     autoComplete="name"
   />
   ```

3. **الألوان لها معنى**
   ```tsx
   // ✅ استخدام ألوان ذات معنى
   <Button variant="destructive">حذف</Button>
   <Button variant="default">حفظ</Button>
   ```

---

## القصص (Stories)

جميع المكونات تحتوي على قصص Storybook لسهولة التطوير.

### تشغيل Storybook
```bash
npm run storybook
```

### عرض القصص
```
http://localhost:6006
```

### أمثلة القصص
- `/src/components/ui/button.stories.tsx`
- `/src/components/data-table/DataTable.stories.tsx`
- `/src/features/reports/components/*.stories.tsx`

---

## أمثلة التخصيص

### إنشاء مكون مخصص

```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'custom';
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'transition-all',
          variant === 'custom' && 'bg-purple-600 hover:bg-purple-700',
          className
        )}
        {...props}
      />
    );
  }
);

CustomButton.displayName = 'CustomButton';
```

---

## الدعم والمساعدة

للمزيد من المعلومات:
- [توثيق Storybook](http://localhost:6006)
- [دليل واجهة برمجة التطبيقات (API)](./API_DOCUMENTATION.md)
- [دليل التطوير](./DEVELOPMENT_GUIDE.md)
