# هيكل النظام المعماري للمشروع

## 🏗️ نظرة عامة على البنية

هذا المشروع يتبع بنية **Frontend + Backend** مع فصل واضح بين الطبقات:

### البنية العامة

```
University Management System
├── Frontend (React/TypeScript)
│   ├── UI Layer (Components, Pages)
│   ├── Business Logic Layer (Features, Services)
│   └── Data Layer (API, Store)
└── Backend (Fastify/TypeScript)
    ├── API Layer (Routes, Controllers)
    ├── Business Logic Layer (Services, Use Cases)
    └── Data Layer (Database, Repositories)
```

## 🎯 بنية الميزات (Feature Sliced Design)

نتبع نمط **Feature Sliced Design** الذي ينظم الكود حسب الميزات بدلاً من الطبقات التقليدية.

### هيكل الميزات

```
src/features/
├── auth/           # مصادقة المستخدمين
│   ├── ui/         # مكونات واجهة المستخدم
│   ├── model/      # منطق الأعمال وأنواع البيانات
│   ├── api/        # استدعاءات API
│   └── index.ts    # نقطة الدخول
├── students/       # إدارة الطلاب
├── courses/        # إدارة المواد
├── grades/         # إدارة الدرجات
└── ...
```

### فوائد Feature Sliced Design

- **عزل الميزات**: كل ميزة مستقلة وسهلة الصيانة
- **إعادة الاستخدام**: المكونات قابلة للاستخدام في ميزات أخرى
- **اختبار أسهل**: اختبار الميزات بشكل منفصل
- **تطوير متوازي**: فرق متعددة تعمل على ميزات مختلفة

## 🔄 تدفق البيانات

### إدارة الحالة (State Management)

نستخدم مزيج من **Redux Toolkit** و **React Query**:

```
User Interaction
    ↓
UI Components (React)
    ↓
Business Logic (Redux Actions/Slices)
    ↓
API Calls (React Query)
    ↓
Backend API (Fastify)
    ↓
Database (SQLite/PostgreSQL)
```

### طبقات إدارة الحالة

1. **Redux Toolkit**: للحالة العامة (المستخدم، الإعدادات)
2. **React Query**: للبيانات من الخادم (CRUD operations)
3. **Local State**: للحالة المؤقتة (React useState)

### مثال على تدفق البيانات

```typescript
// 1. UI Component
const StudentList = () => {
  const { data: students } = useStudentsQuery();
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    deleteStudentMutation.mutate(id);
  };

  return (
    <div>
      {students?.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

// 2. API Layer (React Query)
const useStudentsQuery = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students'),
  });
};

// 3. Redux Slice
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.items = action.payload;
    },
  },
});
```

## 📁 هيكل المجلدات والملفات

### هيكل المشروع الكامل

```
university-react/
├── public/                 # الملفات الثابتة
├── src/
│   ├── components/         # مكونات مشتركة
│   │   ├── ui/            # مكونات أساسية (Radix UI)
│   │   └── shared/        # مكونات مشتركة
│   ├── features/          # ميزات المشروع
│   │   ├── auth/
│   │   ├── students/
│   │   ├── courses/
│   │   └── ...
│   ├── lib/               # مكتبات مساعدة
│   │   ├── utils.ts       # دوال مساعدة
│   │   ├── api.ts         # إعداد API
│   │   ├── schemas/       # مخططات البيانات (Zod)
│   │   └── ...
│   ├── hooks/             # React Hooks مخصصة
│   ├── store/             # Redux Store
│   ├── services/          # خدمات خارجية
│   ├── i18n/              # الترجمة
│   ├── router.tsx         # إعداد التوجيه
│   ├── App.tsx            # المكون الرئيسي
│   └── main.tsx           # نقطة دخول التطبيق
├── server/                # Backend
│   ├── src/
│   │   ├── routes/        # مسارات API
│   │   ├── services/      # منطق الأعمال
│   │   ├── utils/         # دوال مساعدة
│   │   └── ...
│   └── prisma/            # قاعدة البيانات
├── tests/                 # الاختبارات
├── docs/                  # الوثائق
└── package.json
```

### هيكل ميزة نموذجية

```
features/students/
├── ui/                    # مكونات واجهة المستخدم
│   ├── StudentCard.tsx
│   ├── StudentForm.tsx
│   └── StudentList.tsx
├── model/                 # منطق الأعمال
│   ├── types.ts           # أنواع TypeScript
│   ├── schemas.ts         # مخططات Zod
│   └── selectors.ts       # Redux selectors
├── api/                   # استدعاءات API
│   ├── studentsApi.ts
│   └── queries.ts         # React Query hooks
└── index.ts               # تصدير الميزة
```

## 🏛️ أنماط التصميم المستخدمة

### 1. Custom Hooks Pattern

```typescript
// ✅ استخدام Custom Hook لإعادة استخدام المنطق
const useStudentForm = () => {
  const methods = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = (data: StudentFormData) => {
    // منطق الحفظ
  };

  return { methods, onSubmit };
};
```

### 2. Compound Components Pattern

```typescript
// مكون مركب للنماذج
const StudentForm = ({ children, onSubmit }) => (
  <FormProvider {...methods}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {children}
    </form>
  </FormProvider>
);

StudentForm.Field = ({ name, ...props }) => (
  <Controller name={name} render={({ field }) => <Input {...field} {...props} />} />
);
```

### 3. Container/Presentational Pattern

```typescript
// مكون العرض (Presentational)
const StudentListView = ({ students, onDelete, loading }) => (
  <div>
    {students.map(student => (
      <StudentCard key={student.id} student={student} onDelete={onDelete} />
    ))}
  </div>
);

// مكون الحاوي (Container)
const StudentList = () => {
  const { data: students, isLoading } = useStudentsQuery();
  const deleteMutation = useDeleteStudent();

  return (
    <StudentListView
      students={students}
      loading={isLoading}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  );
};
```

## 📊 المخططات التوضيحية

### مخطط تدفق البيانات

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface │───▶│  Business Logic │───▶│     API Layer    │
│   (React Comp.)  │    │   (Redux/RTK)   │    │ (React Query)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local State    │    │  Global State    │    │   Server State    │
│  (useState)      │    │  (Redux Store)   │    │  (REST/GraphQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### مخطط هيكل الميزات

```
Feature
├── UI Layer          # مكونات العرض
├── Business Layer    # منطق الأعمال
├── Data Layer        # الوصول للبيانات
└── Shared Layer      # الكود المشترك
```

### مخطط التواصل بين المكونات

```
Parent Component
    ├── Child Component A
    │   ├── API Call (React Query)
    │   └── State Update (Redux)
    └── Child Component B
        ├── Custom Hook
        └── Event Handler
```

## 🔧 التقنيات المستخدمة

### Frontend Stack
- **React 18**: مكتبة واجهة المستخدم
- **TypeScript**: كتابة الأنواع الثابتة
- **Vite**: أداة البناء والتطوير
- **Tailwind CSS**: إطار العمل للتصميم
- **Radix UI**: مكونات أساسية
- **Redux Toolkit**: إدارة الحالة العامة
- **React Query**: إدارة البيانات من الخادم

### Backend Stack
- **Fastify**: إطار عمل الخادم
- **Prisma**: ORM لقاعدة البيانات
- **SQLite/PostgreSQL**: قاعدة البيانات
- **JWT**: المصادقة
- **Zod**: التحقق من البيانات

### أدوات التطوير
- **ESLint**: فحص الأخطاء
- **Prettier**: تنسيق الكود
- **Vitest**: الاختبارات
- **Playwright**: اختبارات E2E
- **Storybook**: توثيق المكونات

## 🎯 أفضل الممارسات

### 1. فصل المسؤوليات
- كل مكون له مسؤولية واحدة
- فصل منطق الأعمال عن واجهة المستخدم

### 2. إعادة الاستخدام
- استخدام مكونات مشتركة
- إنشاء hooks مخصصة للمنطق المتكرر

### 3. الأداء
- استخدام React.memo للمكونات الثقيلة
- تحسين استدعاءات API باستخدام React Query
- استخدام lazy loading للمكونات

### 4. الاختبار
- اختبار الوحدات للمنطق
- اختبارات التكامل للتدفقات
- اختبارات E2E للسيناريوهات الكاملة

هذا الهيكل يضمن قابلية الصيانة، القابلية للتوسع، وسهولة التطوير للمشروع.</content>
<parameter name="filePath">D:\myflutterapp\2_Other_projects\university-react\ARCHITECTURE.md