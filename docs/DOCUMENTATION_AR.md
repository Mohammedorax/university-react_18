# نظام إدارة الجامعة - التوثيق التقني الشامل

> **الإصدار:** 1.0.0  
> **تاريخ آخر تحديث:** أبريل 2026  
> **الحالة:** جاهز للإنتاج ✅

---

## فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [هيكلية المجلدات والملفات](#هيكلية-المجلدات-والملفات)
3. [إعدادات البيئة](#إعدادات-البيئة)
4. [خطوات التشغيل والبناء](#خطوات-التشغيل-والبناء)
5. [الوحدات الرئيسية](#الوحدات-الرئيسية)
6. [أفضل الممارسات](#أفضل-الممارسات)
7. [سجل التغييرات الأخيرة](#سجل-التغييرات-الأخيرة)

---

## نظرة عامة

نظام إدارة الجامعة هو تطبيق ويب تفاعلي مبني بـ **React 18** و **TypeScript** و **Vite 6**، مصمم لإدارة العمليات الأكاديمية والإدارية في المؤسسات التعليمية. يدعم النظام اللغة العربية كلغة أساسية مع دعم اللغة الإنجليزية، ويوفر واجهة مستخدم متجاوبة تعمل في الوضع الفاتح والداكن.

### التقنيات المستخدمة

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| React | 18.3.1 | مكتبة واجهة المستخدم |
| TypeScript | ~5.8.3 | كتابة أنواع آمنة |
| Vite | 6.1.0 | أداة البناء والتطوير |
| Tailwind CSS | 3.4.17 | تنسيق الواجهات |
| Radix UI | متعدد | مكونات واجهة يمكن الوصول إليها |
| React Query (TanStack) | 5.66.0 | إدارة بيانات الخادم |
| Redux Toolkit | 2.5.1 | إدارة الحالة العامة |
| React Hook Form | 7.54.2 | إدارة النماذج |
| Zod | 3.24.2 | التحقق من صحة البيانات |
| Recharts | 2.15.1 | الرسوم البيانية |
| i18next | 25.8.13 | تعدد اللغات |
| Sonner | 1.7.4 | الإشعارات |
| jsPDF + AutoTable | 4.0.0 / 5.0.7 | تصدير PDF |
| XLSX | 0.18.5 | تصدير Excel |
| DOMPurify | 3.3.1 | تطهير المدخلات |
| react-window | 2.2.5 | العرض الافتراضي للجداول |

---

## هيكلية المجلدات والملفات

```
university-react/
├── docs/                           # التوثيق (انظر docs/README.md للفهرس)
│   ├── README.md
│   ├── STATE_MANAGEMENT.md
│   ├── LIBRARIES.md
│   ├── TEST_ACCOUNTS.md
│   ├── archive/                    # تقارير قديمة (مرجع فقط)
│   └── DOCUMENTATION_AR.md         # هذا الملف
│
├── deploy/                         # إعدادات Docker (nginx للـ SPA)
├── public/                         # الأصول العامة (Vite)
│   ├── manifest.json               # إعدادات PWA
│   └── offline.html                # صفحة عدم الاتصال
│
├── src/                            # الكود المصدري
│   ├── main.tsx                    # نقطة الدخول الرئيسية
│   ├── App.tsx                     # المكون الرئيسي
│   ├── router.tsx                  # تعريف المسارات
│   ├── index.css                   # الأنماط العامة
│   │
│   ├── components/                 # المكونات المشتركة
│   │   ├── ui/                     # مكونات shadcn/ui الأساسية
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── form.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── sonner.tsx
│   │   │   └── textarea.tsx
│   │   │
│   │   ├── data-table/             # مكونات الجداول المتقدمة
│   │   │   ├── DataTable.tsx       # الجدول الرئيسي
│   │   │   ├── DataTableVirtual.tsx # الجدول الافتراضي
│   │   │   ├── DataTableHeader.tsx
│   │   │   ├── DataTableBody.tsx
│   │   │   ├── DataTableRow.tsx
│   │   │   ├── DataTablePagination.tsx
│   │   │   ├── DataTableSearch.tsx
│   │   │   ├── DataTableColumns.tsx
│   │   │   ├── DataTableExport.tsx
│   │   │   ├── DataTableBulkActions.tsx
│   │   │   ├── useDataTable.ts     # Hook رئيسي
│   │   │   ├── useDataTableExport.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── charts/                 # مكونات الرسوم البيانية
│   │   │   └── BaseCharts.tsx
│   │   │
│   │   ├── layouts/                # تخطيطات الصفحات
│   │   │   ├── DashboardLayout.tsx # لوحة التحكم
│   │   │   ├── AuthLayout.tsx      # صفحات المصادقة
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── ConfirmDialog.tsx       # مربع تأكيد الحذف
│   │   ├── EmptyState.tsx          # حالة عدم وجود بيانات
│   │   ├── ErrorBoundary.tsx       # التقاط الأخطاء
│   │   ├── LazyImage.tsx           # تحميل الصور الكسول
│   │   ├── Breadcrumbs.tsx         # مسار التنقل
│   │   ├── NotificationCenter.tsx  # مركز الإشعارات
│   │   ├── StatCard.tsx            # بطاقة الإحصائيات
│   │   ├── ThemeProvider.tsx       # موفر السمة
│   │   └── ViewModeButton.tsx      # زر تبديل العرض
│   │
│   ├── features/                   # الوحدات الوظيفية (Feature-based Architecture)
│   │   │
│   │   ├── admin/                  # وحدة الإدارة
│   │   │   └── pages/
│   │   │       ├── AdminDashboard.tsx    # لوحة تحكم المدير
│   │   │       └── AuditLogsPage.tsx     # سجل الأنشطة
│   │   │
│   │   ├── auth/                   # وحدة المصادقة
│   │   │   ├── hooks/useAuth.ts
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       └── RegisterPage.tsx
│   │   │
│   │   ├── courses/                # وحدة المقررات
│   │   │   ├── components/
│   │   │   │   ├── AddCourseDialog.tsx
│   │   │   │   ├── EditCourseDialog.tsx
│   │   │   │   ├── CourseDetailsDialog.tsx
│   │   │   │   ├── CourseStudentsDialog.tsx
│   │   │   │   └── CoursesFilters.tsx
│   │   │   ├── hooks/useCourses.ts   # React Query (بيانات الخادم)
│   │   │   ├── pages/CoursesPage.tsx
│   │   │   ├── schemas/courseSchema.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── finance/                # وحدة الخصومات المالية
│   │   │   ├── components/
│   │   │   │   ├── AddDiscountDialog.tsx
│   │   │   │   ├── EditDiscountDialog.tsx
│   │   │   │   └── DiscountDetailsDialog.tsx
│   │   │   ├── hooks/useDiscounts.ts
│   │   │   └── pages/DiscountsPage.tsx
│   │   │
│   │   ├── grades/                 # وحدة الدرجات
│   │   │   ├── components/EditGradeDialog.tsx
│   │   │   ├── hooks/useGrades.ts
│   │   │   ├── pages/GradesPage.tsx
│   │   │   └── types/index.ts
│   │   │
│   │   ├── inventory/              # وحدة المخزون
│   │   │   ├── components/
│   │   │   ├── hooks/useInventory.ts
│   │   │   ├── pages/InventoryPage.tsx
│   │   │   ├── schemas/inventorySchema.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── reports/                # وحدة التقارير
│   │   │   ├── components/
│   │   │   │   ├── CriticalAlerts.tsx
│   │   │   │   ├── ExportOptions.tsx
│   │   │   │   ├── PerformanceInsights.tsx
│   │   │   │   ├── ReportChart.tsx
│   │   │   │   ├── ReportFilters.tsx
│   │   │   │   ├── ReportList.tsx
│   │   │   │   ├── ReportPreview.tsx
│   │   │   │   ├── ReportTypeSelector.tsx
│   │   │   │   ├── ReportsHeader.tsx
│   │   │   │   └── TopStudentsList.tsx
│   │   │   └── pages/ReportsPage.tsx
│   │   │
│   │   ├── schedule/               # وحدة الجدول الدراسي
│   │   │   └── pages/SchedulePage.tsx
│   │   │
│   │   ├── settings/               # وحدة الإعدادات
│   │   │   ├── hooks/useSettings.ts
│   │   │   ├── pages/SettingsPage.tsx
│   │   │   └── types/index.ts
│   │   │
│   │   ├── staff/                  # وحدة الموظفين
│   │   │   ├── components/
│   │   │   ├── hooks/useStaff.ts
│   │   │   ├── pages/
│   │   │   │   ├── StaffPage.tsx
│   │   │   │   └── StaffDashboard.tsx
│   │   │   └── schemas/staffSchema.ts
│   │   │
│   │   ├── students/               # وحدة الطلاب
│   │   │   ├── components/
│   │   │   │   ├── AddStudentDialog.tsx
│   │   │   │   ├── EditStudentDialog.tsx
│   │   │   │   ├── StudentDetailsDialog.tsx
│   │   │   │   └── StudentFilters.tsx
│   │   │   ├── hooks/useStudents.ts
│   │   │   ├── pages/
│   │   │   │   ├── StudentsPage.tsx
│   │   │   │   └── StudentDashboard.tsx
│   │   │   ├── schemas/studentSchema.ts
│   │   │   └── types/index.ts
│   │   │
│   │   └── teachers/               # وحدة المعلمين
│   │       ├── components/
│   │       │   ├── AddTeacherDialog.tsx
│   │       │   ├── EditTeacherDialog.tsx
│   │       │   ├── TeacherDetailsDialog.tsx
│   │       │   ├── TeacherFilters.tsx
│   │       │   └── TeacherStudentsDialog.tsx
│   │       ├── hooks/useTeachers.ts
│   │       ├── pages/
│   │       │   ├── TeachersPage.tsx
│   │       │   ├── TeacherDashboard.tsx
│   │       │   └── AttendancePage.tsx    # صفحة الحضور
│   │       ├── schemas/teacherSchema.ts
│   │       └── types/index.ts
│   │
│   ├── hooks/                      # Hooks مشتركة
│   │   ├── use-debounce.ts
│   │   └── documents/useEntityDocuments.ts
│   │
│   ├── i18n/                       # نظام تعدد اللغات
│   │   ├── config.ts               # إعداد i18next
│   │   ├── ar.ts                   # قاموس العربية
│   │   ├── i18n.context.tsx
│   │   ├── i18n.hooks.ts
│   │   └── i18n.types.ts
│   │
│   ├── locales/                    # ملفات الترجمة JSON
│   │   ├── ar.json                 # الترجمة العربية
│   │   └── en.json                 # الترجمة الإنجليزية
│   │
│   ├── lib/                        # أدوات ومكتبات مساعدة
│   │   ├── utils.ts                # أدوات عامة (cn, processArabicText)
│   │   ├── security.ts             # أدوات الأمان (sanitizeHTML, isValidEmail)
│   │   ├── logger.ts               # نظام التسجيل
│   │   ├── sentry.ts               # تتبع الأخطاء (Sentry)
│   │   ├── error-handling.ts       # معالجة الأخطاء الشاملة
│   │   ├── export-utils.ts         # أدوات التصدير
│   │   ├── fonts.ts                # إدارة الخطوط
│   │   └── schemas/common.ts       # مخططات Zod مشتركة
│   │
│   ├── services/                   # خدمات البيانات
│   │   └── mockApi/                # واجهة API محاكية
│   │       ├── index.ts            # تصدير موحد
│   │       ├── auth.ts             # المصادقة
│   │       ├── students.ts         # الطلاب
│   │       ├── courses.ts          # المقررات
│   │       ├── grades.ts           # الدرجات
│   │       ├── teachers.ts         # المعلمين
│   │       ├── staff.ts            # الموظفين
│   │       ├── finance.ts          # المالية
│   │       ├── inventory.ts        # المخزون
│   │       ├── auditLog.ts         # سجل التدقيق
│   │       ├── documents.ts        # المستندات
│   │       ├── data.ts             # البيانات الأولية
│   │       ├── types.ts            # الأنواع المشتركة
│   │       └── utils.ts            # أدوات مساعدة
│   │
│   ├── store/                      # إدارة الحالة (Redux)
│   │   ├── index.ts                # إعداد المتجر
│   │   └── slices/
│   │       └── authSlice.ts        # شريحة المصادقة
│   │
│   ├── __tests__/                  # الاختبارات
│   │   ├── integration.test.ts
│   │   ├── mockApi.test.ts
│   │   └── schemas.test.ts
│   │
│   └── workers/                    # Web Workers
│
├── tests/e2e/                      # اختبارات End-to-End (Playwright)
│   ├── login.spec.ts
│   └── student-flow.spec.ts
│
├── package.json                    # التبعيات والسكربتات
├── vite.config.ts                  # إعدادات Vite
├── tailwind.config.js              # إعدادات Tailwind CSS
├── tsconfig.json                   # إعدادات TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js                # إعدادات ESLint
├── playwright.config.ts            # إعدادات Playwright
├── vitest.config.ts                # إعدادات Vitest
├── vitest.unit.config.ts
├── postcss.config.js               # إعدادات PostCSS
├── components.json                 # إعدادات shadcn/ui
├── .env.example                    # مثال متغيرات البيئة
├── .gitignore
├── .npmrc
├── index.html                      # قالب HTML
└── README.md
```

---

## إعدادات البيئة

### ملف `.env.example`

يحتوي المشروع على ملف `.env.example` يوضح جميع متغيرات البيئة المطلوبة:

```bash
# انسخ الملف إلى .env.local
cp .env.example .env.local
```

### المتغيرات الأساسية

| المتغير | الوصف | القيمة الافتراضية |
|---------|-------|-------------------|
| `VITE_API_URL` | عنوان API | `http://localhost:4000` |
| `VITE_API_TIMEOUT` | مهلة الطلب (مللي ثانية) | `30000` |
| `VITE_APP_NAME` | اسم التطبيق | `University Management System` |
| `VITE_APP_VERSION` | إصدار التطبيق | `1.0.0` |
| `VITE_SENTRY_DSN` | عنوان Sentry لتتبع الأخطاء | _(اختياري)_ |
| `VITE_SENTRY_ENVIRONMENT` | بيئة Sentry | `production` |
| `VITE_BUILD_MODE` | وضع البناء | `development` / `prod` |
| `VITE_PASSWORD_MIN_LENGTH` | الحد الأدنى لكلمة المرور | `8` |
| `VITE_MAX_FILE_SIZE` | الحد الأقصى لحجم الملف | `10485760` (10MB) |

### ملاحظات أمنية

- ⚠️ **لا ترفع ملف `.env.local` إلى Git** - تم إضافته في `.gitignore`
- 🔒 متغيرات `VITE_SENTRY_*` تعمل فقط في وضع الإنتاج (`import.meta.env.PROD`)
- 🛡️ يتم تطهير جميع المدخلات عبر `DOMPurify` في [`lib/security.ts`](src/lib/security.ts)

---

## خطوات التشغيل والبناء

### المتطلبات المسبقة

| الأداة | الإصدار الأدنى |
|--------|----------------|
| Node.js | 18+ |
| pnpm | 8+ |
| npm | 9+ (بديل) |

### 1. تثبيت التبعيات

```bash
pnpm install
```

### 2. تشغيل وضع التطوير

```bash
pnpm dev
```

يفتح الخادم على `http://localhost:5173` مع HMR (تحديث الوحدات الساخن).

### 3. بناء للإنتاج

```bash
# بناء عادي
pnpm build

# بناء للإنتاج مع التصغير وتحسين الأداء
pnpm build:prod
```

### 4. معاينة البناء

```bash
pnpm preview
```

يفتح الخادم على `http://localhost:4173`.

### 5. تشغيل الاختبارات

```bash
# اختبارات الوحدات
pnpm test

# اختبارات End-to-End
pnpm test:e2e

# فحص TypeScript
pnpm typecheck

# فحص ESLint
pnpm lint
```

### 6. Storybook

```bash
# تشغيل Storybook
pnpm storybook

# بناء Storybook
pnpm build-storybook
```

---

## الوحدات الرئيسية

### 1. نظام الخصومات المالية (`features/finance/`)

#### نظرة عامة
وحدة إدارة الخصومات والمنح الدراسية تتيح للمسؤولين إنشاء وتعديل وحذف الخصومات المتاحة للطلاب.

#### المكونات

| المكون | الوصف |
|--------|-------|
| [`DiscountsPage.tsx`](src/features/finance/pages/DiscountsPage.tsx) | الصفحة الرئيسية - عرض شبكي/جدولي مع إحصائيات |
| [`AddDiscountDialog.tsx`](src/features/finance/components/AddDiscountDialog.tsx) | مربع حوار إضافة خصم جديد |
| [`EditDiscountDialog.tsx`](src/features/finance/components/EditDiscountDialog.tsx) | مربع حوار تعديل خصم موجود |
| [`DiscountDetailsDialog.tsx`](src/features/finance/components/DiscountDetailsDialog.tsx) | مربع حوار عرض تفاصيل الخصم |

#### أنواع الخصومات

| النوع | الوصف | مثال |
|-------|-------|------|
| `percentage` | نسبة مئوية | خصم 20% للتفوق الدراسي |
| `fixed_amount` | مبلغ ثابت | خصم 5000 ر.س للضمان الاجتماعي |

#### المميزات

- ✅ عرض شبكي (Grid) وجدولي (Table) مع تبديل سلس
- ✅ إحصائيات فورية (إجمالي، نشط، نسبة مئوية، مبلغ ثابت)
- ✅ بحث وتصفية حسب النوع
- ✅ تفعيل/تعطيل الخصومات
- ✅ حذف فردي وجماعي مع تأكيد
- ✅ ألوان متدرجة متوافقة مع الوضع الداكن:
  - **الخصم المئوي:** تدرج بنفسجي `from-violet-500 to-indigo-500`
  - **المبلغ الثابت:** تدرج سماوي `from-cyan-500 to-teal-500`
- ✅ حالة النشاط بألوان واضحة:
  - **نشط:** أخضر `emerald-500`
  - **غير نشط:** وردي `rose-500`

#### Hooks

```typescript
// استخدام Hook الخصومات
const { data, isLoading, error, refetch } = useDiscounts();

// حذف خصم
const deleteMutation = useDeleteDiscount();
await deleteMutation.mutateAsync(discountId);

// تحديث خصم
const updateMutation = useUpdateDiscount();
await updateMutation.mutateAsync({ id, data: { active: true } });
```

---

### 2. نظام تعدد اللغات (i18n)

#### نظرة عامة
يستخدم المشروع `i18next` مع `react-i18next` لدعم اللغتين العربية والإنجليزية.

#### الهيكلية

```
src/i18n/
├── config.ts          # إعداد i18next الرئيسي
├── ar.ts              # قاموس العربية (TypeScript)
├── i18n.context.tsx   # سياق الترجمة
├── i18n.hooks.ts      # Hooks الترجمة
└── i18n.types.ts      # تعريفات الأنواع

src/locales/
├── ar.json            # ترجمة عربية (JSON)
└── en.json            # ترجمة إنجليزية (JSON)
```

#### الإعداد

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar',           // اللغة الافتراضية
    fallbackLng: 'ar',   // اللغة البديلة
    interpolation: {
      escapeValue: false, // React يحمي من XSS تلقائياً
    },
  });

export default i18n;
```

#### الاستخدام

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h1>{t('nav.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

#### اللغات المدعومة

| الكود | الاسم | الاتجاه |
|-------|-------|---------|
| `ar` | العربية | RTL (يمين إلى يسار) |
| `en` | English | LTR (يسار إلى يمين) |

---

### 3. إدارة الحالة

#### Redux Toolkit

يستخدم المشروع Redux Toolkit **للحالة العمومية الخفيفة** (مثل المصادقة). بيانات الخادم (مقررات، طلاب، …) تُدار عبر **React Query** — انظر `docs/STATE_MANAGEMENT.md`.

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/store/slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

#### React Query (TanStack Query)

يُستخدم لإدارة بيانات الخادم (Server State):

```typescript
// إعداد QueryClient في main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 دقائق
      refetchOnWindowFocus: true,   // إعادة عند التركيز
      retry: 1,                     // محاولة واحدة عند الفشل
    },
  },
})
```

#### متى تستخدم ماذا؟

| الحالة | الأداة | السبب |
|--------|--------|-------|
| بيانات المستخدم (جلسة، صلاحيات) | Redux | حالة عامة دائمة |
| بيانات الخادم (طلاب، مقررات) | React Query | تخزين مؤقت، إعادة جلب تلقائي |
| حالة النموذج (مدخلات، أخطاء) | React Hook Form | إدارة محلية فعالة |
| حالة الواجهة (حوارات، تصفية) | useState | حالة محلية بسيطة |

---

### 4. نظام الجداول المتقدم (`components/data-table/`)

#### نظرة عامة
نظام جداول متقدم يدعم العرض العادي والافتراضي مع تصدير البيانات.

#### المكونات

| المكون | الوصف |
|--------|-------|
| `DataTable.tsx` | الجدول الرئيسي مع كل الوظائف |
| `DataTableVirtual.tsx` | جدول افتراضي لبيانات كبيرة (react-window v2) |
| `useDataTable.ts` | Hook رئيسي للبحث، الترتيب، التصفح |
| `useDataTableExport.ts` | Hook لتصدير البيانات |

#### الاستخدام

```typescript
import { DataTable, DataTableColumn } from '@/components/DataTable'

const columns: DataTableColumn<Student>[] = [
  { key: 'name', title: 'الاسم', sortable: true },
  { key: 'email', title: 'البريد', sortable: true },
  {
    key: 'status',
    title: 'الحالة',
    render: (val) => val === 'active' ? 'نشط' : 'غير نشط'
  },
]

<DataTable
  data={students}
  columns={columns}
  searchPlaceholder="بحث..."
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

#### المميزات

- ✅ بحث فوري مع Debounce
- ✅ ترتيب تصاعدي/تنازلي مستقر
- ✅ تصفية حسب الأعمدة
- ✅ تحديد متعدد للصفوف
- ✅ تصدير CSV/Excel
- ✅ عرض افتراضي للبيانات الكبيرة
- ✅ كثافة عرض (عادي، مدمج)
- ✅ دعم RTL كامل

---

### 5. نظام الأمان (`lib/security.ts`)

#### الوظائف المتاحة

| الوظيفة | الوصف |
|---------|-------|
| `sanitizeHTML()` | تطهير HTML من وسوم خطرة |
| `sanitizeText()` | إزالة جميع وسوم HTML |
| `isValidEmail()` | التحقق من صحة البريد |
| `isValidSaudiPhone()` | التحقق من رقم الهاتف السعودي |
| `isValidUniversityId()` | التحقق من الرقم الجامعي |
| `maskEmail()` | إخفاء جزء من البريد |
| `maskPhone()` | إخفاء جزء من الهاتف |
| `checkPasswordStrength()` | فحص قوة كلمة المرور |
| `sanitizeObject()` | تطهير كائن كامل |
| `isSafeURL()` | التحقق من أمان الرابط |

#### مثال الاستخدام

```typescript
import { sanitizeHTML, isValidEmail, maskEmail } from '@/lib/security'

const safeContent = sanitizeHTML(userInput)
const isValid = isValidEmail('user@example.com')
const masked = maskEmail('ahmed@university.edu') // a*****@university.edu
```

---

### 6. معالجة النصوص العربية (`lib/utils.ts`)

#### `processArabicText()`

معالجة النصوص العربية للعرض الصحيح في ملفات PDF:

```typescript
import { processArabicText } from '@/lib/utils'

// معالجة عادية
const processed = processArabicText('مرحبا بالعالم')

// معالجة مع الترتيب البصري (لـ jsPDF)
const visual = processArabicText('مرحبا', { visualOrder: true })
```

#### `fixArabicForPDF()`

إصلاح النص العربي خصيصاً لـ jsPDF:

```typescript
import { fixArabicForPDF } from '@/lib/utils'

const pdfText = fixArabicForPDF('الجامعة العربية')
```

#### التخزين المؤقت

تستخدم الدوال تخزيناً مؤقتاً (LRU Cache) بسعة 1000 إدخال لتحسين الأداء:

```typescript
const textCache = new Map<string, string>()
const MAX_CACHE_SIZE = 1000
```

---

## أفضل الممارسات

### 1. هيكلة الملفات

```
✅ اتبع معمارية الميزات (Feature-based):
features/
  students/
    components/    # مكونات خاصة بالطلاب
    hooks/         # Hooks خاصة بالطلاب
    pages/         # صفحات الطلاب
    schemas/       # مخططات التحقق
    types/         # تعريفات الأنواع
    slice/         # Redux slices

✅ استخدم barrel exports في index.ts:
export * from './components'
export * from './hooks'
```

### 2. تسمية الملفات والمكونات

| النوع | النمط | مثال |
|-------|-------|------|
| المكونات | PascalCase | `StudentsPage.tsx` |
| Hooks | camelCase | `useStudents.ts` |
| الأنواع | PascalCase | `Student.ts` |
| الأدوات | camelCase | `utils.ts` |
| المخططات | camelCase | `studentSchema.ts` |

### 3. إدارة الحالة

```typescript
// ✅ استخدم React Query لبيانات الخادم
const { data } = useQuery({
  queryKey: ['students', { page }],
  queryFn: () => mockApi.getStudents({ page }),
})

// ✅ استخدم Redux للحالة العامة
const user = useAppSelector(state => state.auth.user)

// ✅ استخدم useState لحالة الواجهة
const [isOpen, setIsOpen] = useState(false)
```

### 4. النماذج

```typescript
// ✅ استخدم React Hook Form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema } from './schemas/studentSchema'

const form = useForm({
  resolver: zodResolver(studentSchema),
  defaultValues: { name: '', email: '' },
})
```

### 5. الأمان

```typescript
// ✅ طهّر جميع المدخلات من المستخدم
import { sanitizeHTML } from '@/lib/security'

const safeContent = sanitizeHTML(userInput)

// ✅ تحقق من أنواع البيانات بـ Zod
import { studentSchema } from './schemas/studentSchema'

const result = studentSchema.safeParse(formData)
if (!result.success) {
  // معالجة الأخطاء
}
```

### 6. الأداء

```typescript
// ✅ استخدم useMemo للحسابات الثقيلة
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active')
}, [data])

// ✅ استخدم useCallback للدوال
const handleClick = useCallback((id: string) => {
  deleteStudent(id)
}, [deleteStudent])

// ✅ استخدم العرض الافتراضي للجداول الكبيرة
import { DataTableVirtual } from '@/components/data-table/DataTableVirtual'
```

### 7. إمكانية الوصول (Accessibility)

```typescript
// ✅ استخدم aria-label و aria-describedby
<Button aria-label="حذف الطالب" aria-describedby="delete-warning">
  حذف
</Button>

// ✅ استخدم role للمناطق
<div role="status" aria-live="polite">
  جاري التحميل...
</div>

// ✅ دعم RTL
<div dir="rtl">
  المحتوى العربي
</div>
```

---

## سجل التغييرات الأخيرة

### الإصلاحات والتحسينات المنفذة

| التاريخ | التغيير | النوع |
|---------|---------|-------|
| أبريل 2026 | إصلاح `react-window` v2 API (`FixedSizeList` → `List`) | 🐛 إصلاح |
| أبريل 2026 | إصلاح `react-virtualized-auto-sizer` v2 (named export) | 🐛 إصلاح |
| أبريل 2026 | حذف Service Worker orphaned (`register-sw.ts`) | 🧹 تنظيف |
| أبريل 2026 | حذف Apollo Client و GraphQL (غير مستخدم) | 🧹 تنظيف |
| أبريل 2026 | تحديث ألوان صفحة الخصومات للوضع الداكن | 🎨 تحسين |
| أبريل 2026 | تحديث Vite `manualChunks` | ⚙️ تكوين |
| أبريل 2026 | إزالة `@apollo/client` من التبعيات | 📦 تبعيات |
| أبريل 2026 | بناء ناجح بدون تحذيرات | ✅ تحقق |

### الملفات المحذوفة

- `src/register-sw.ts` - Service Worker غير مستخدم
- `src/graphql/apollo-client.ts` - GraphQL غير مستخدم
- `src/graphql/provider.tsx` - Apollo Provider غير مستخدم
- `src/graphql/operations.ts` - عمليات GraphQL (602 سطر)
- `server/` - Backend كامل (Fastify + Prisma)
- `public/service-worker.js` - ملف Service Worker

### الإحصائيات الحالية

| المقياس | القيمة |
|---------|--------|
| إجمالي الملفات | ~200 ملف |
| أسطر الكود | ~25,000 سطر |
| حجم البناء (مضغوط) | ~1.3 MB |
| حجم البناء (غير مضغوط) | ~5.2 MB |
| عدد الحزم | ~70 حزمة |
| وقت البناء | ~18 ثانية |
| أخطاء TypeScript | 0 |
| تحذيرات البناء | 0 |

---

## معلومات الاتصال والدعم

- **المستودع:** `university-react`
- **إطار العمل:** React 18 + TypeScript + Vite 6
- **نظام البناء:** pnpm
- **محرر الكود:** VS Code (موصى به)

---

> 📝 **ملاحظة:** هذا التوثيق محدّث ويعكس الحالة الحالية للمشروع بعد جميع الإصلاحات والتحسينات المنفذة.
