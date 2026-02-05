# نظام إدارة الجامعة - دليل المكتبات والتقنيات

## 📋 نظرة عامة

هذا المشروع هو نظام إدارة جامعي متكامل (University Management System) مبني باستخدام React و TypeScript مع دعم كامل للغة العربية واتجاه RTL.

---

## 🚀 المكتبات الرئيسية

### 1. Apollo Client (@apollo/client)
**الإصدار:** ^4.1.3

**الوصف:** عميل GraphQL لإدارة البيانات والاستعلامات

**الاستخدام:**
```typescript
import { useQuery, useMutation } from '@apollo/client';
import { GET_STUDENTS } from '@/graphql/operations';

const { data, loading, error } = useQuery(GET_STUDENTS);
```

**المميزات:**
- إدارة الحالة (State Management)
- التخزين المؤقت (Caching)
- التحديثات التلقائية

---

### 2. React Query (@tanstack/react-query)
**الإصدار:** ^5.66.0

**الوصف:** إدارة البيانات من الخادم (Server State Management)

**الاستخدام:**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { useStudents, useCreateStudent } from '@/features/students/hooks/useStudents';

const { data, isLoading } = useStudents();
const mutation = useCreateStudent();
```

**المميزات:**
- التخزين المؤقت الذكي
- إعادة المحاولة التلقائية
- التحديثات المتفائلة (Optimistic Updates)

---

### 3. Redux Toolkit (@reduxjs/toolkit)
**الإصدار:** ^5.5.1

**الوصف:** إدارة الحالة العامة للتطبيق

**الاستخدام:**
```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser } from '@/store/slices/authSlice';

const user = useAppSelector(state => state.auth.user);
dispatch(setUser(userData));
```

**المميزات:**
- حالة المصادقة (Authentication)
- إعدادات النظام
- التخزين المحلي (Local Storage)

---

### 4. React Router (react-router-dom)
**الإصدار:** ^7.1.5

**الوصف:** التنقل بين صفحات التطبيق

**الاستخدام:**
```typescript
import { useNavigate, useParams } from 'react-router-dom';

const navigate = useNavigate();
const { id } = useParams();
navigate('/students');
```

---

### 5. Radix UI (@radix-ui/*)
**الإصدار:** ^1.x

**الوصف:** مكونات واجهة المستخدم القابلة للوصول (Accessible UI Components)

**المكونات المستخدمة:**
- Dialog: نوافذ منبثقة
- Dropdown Menu: القوائم المنسدلة
- Select: حقول الاختيار
- Tabs: علامات التبويب
- Toast: الإشعارات

**الاستخدام:**
```tsx
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';

<Dialog>
  <DialogTrigger>فتح</DialogTrigger>
  <DialogContent>المحتوى</DialogContent>
</Dialog>
```

---

### 6. Shadcn/ui Components
**الوصف:** مكتبة مكونات UI مبنية على Radix UI

**المكونات المستخدمة:**
- Button, Card, Input, Table
- Form, Select, Dialog
- Badge, Avatar, Skeleton

**الاستخدام:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

<Button variant="default" size="lg">زر</Button>
<Card>
  <CardContent>محتوى البطاقة</CardContent>
</Card>
```

---

### 7. Tailwind CSS (tailwindcss)
**الإصدار:** ^3.4.17

**الوصف:** إطار عمل CSS utilities

**الاستخدام:**
```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <h1 className="text-xl font-bold text-foreground">عنوان</h1>
</div>
```

**المميزات:**
- دعم RTL (باستخدام tailwindcss-rtl)
- تخصيص الألوان والأنماط
- استجابة متكاملة (Responsive)

---

### 8. React Hook Form (react-hook-form)
**الإصدار:** ^7.54.2

**الوصف:** إدارة النماذج والتحقق من الصحة

**الاستخدام:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(studentSchema),
  defaultValues: { name: '', email: '' }
});
```

---

### 9. Zod (zod)
**الإصدار:** ^3.24.2

**الوصف:** التحقق من صحة البيانات (Schema Validation)

**الاستخدام:**
```typescript
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد غير صالح'),
  gpa: z.number().min(0).max(4)
});
```

---

### 10. Recharts (recharts)
**الإصدار:** ^2.15.1

**الوصف:** مكتبة الرسوم البيانية

**الاستخدام:**
```tsx
import { BaseAreaChart, BasePieChart, BaseBarChart } from '@/components/charts/BaseCharts';

<BaseAreaChart data={growthData} height={300} />
<BasePieChart data={distributionData} />
```

---

## 🧪 اختبارات

### 1. Vitest (vitest)
**الإصدار:** ^3.2.4

**الوصف:** إطار عمل الاختبارات

**الاستخدام:**
```bash
npm test              # تشغيل الاختبارات
npm run test:storybook # اختبارات Storybook
```

### 2. Playwright (@playwright/test)
**الإصدار:** ^1.58.1

**الوصف:** اختبارات E2E (End-to-End)

**الاستخدام:**
```bash
npm run test:e2e      # تشغيل اختبارات E2E
```

### 3. Storybook (@storybook/*)
**الإصدار:** ^8.6.15

**الوصف:** توثيق المكونات والتطوير العزلي

**الاستخدام:**
```bash
npm run storybook     # تشغيل Storybook
npm run build-storybook # بناء Storybook
```

---

## 📦 مكتبات إضافية

### معالجة الملفات
- **jspdf** & **jspdf-autotable**: إنشاء ملفات PDF
- **xlsx**: إنشاء ملفات Excel
- **file-saver**: حفظ الملفات

### التعريب والنصوص
- **arabic-persian-reshaper**: إعادة تشكيل النص العربي
- **bidi-js**: دعم اتجاه RTL/LTR

### الأدوات المساعدة
- **date-fns**: معالجة التواريخ
- **lodash**: أدوات برمجية
- **clsx** & **tailwind-merge**: دمج classes CSS
- **lucide-react**: الأيقونات

### PWA
- **Service Workers**: للعمل offline
- **Web App Manifest**: لتثبيت التطبيق

---

## 🎯 بنية المشروع

```
src/
├── components/          # المكونات العامة
│   ├── ui/             # مكونات Shadcn
│   └── data-table/     # جدول البيانات المتقدم
├── features/           # الميزات (Students, Teachers, etc.)
├── hooks/              # الـ Hooks المخصصة
├── lib/                # المكتبات والأدوات
├── store/              # Redux Store
├── graphql/            # GraphQL Operations
├── i18n/               # التعريب
├── services/           # الخدمات (Mock API)
└── workers/            # Web Workers
```

---

## 📚 الميزات الرئيسية

1. **✅ نظام مصادقة كامل** (تسجيل الدخول/الخروج، صلاحيات)
2. **✅ إدارة الطلاب** (إضافة، تعديل، حذف، بحث)
3. **✅ إدارة المدرسين** (الهيئة التدريسية)
4. **✅ إدارة المقررات** (المواد الدراسية)
5. **✅ نظام الدرجات** (تسجيل وعرض الدرجات)
6. **✅ التقارير** (تصدير PDF, Excel)
7. **✅ التعريب الكامل** (RTL, Arabic)
8. **✅ PWA** (العمل offline)
9. **✅ GraphQL** (Apollo Client)
10. **✅ اختبارات متكاملة** (Unit, Integration, E2E)

---

## 🔧 متطلبات التشغيل

- **Node.js:** >= 18.0.0
- **Package Manager:** pnpm (مفضل) أو npm
- **Browser:** Chrome, Firefox, Safari (آخر إصدارين)

---

## 📖 روابط مفيدة

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query/latest)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Radix UI](https://www.radix-ui.com)

---

## 👨‍💻 المطور

تم تطوير هذا المشروع باستخدام أحدث التقنيات وأفضل الممارسات في تطوير تطبيقات React.

**تاريخ التحديث:** يناير 2026
