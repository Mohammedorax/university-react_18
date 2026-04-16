# سياسة إدارة الحالة (State Management Policy)

> نموذج **Hybrid — Server-State أولًا**
> يسري على كل كود التطبيق داخل `src/`.

## الهدف
- مصدر واحد للحقيقة لكل نوع حالة.
- عدم مزامنة يدوية بين `Redux` و`fetch`/API.
- كود أقل، Bugs أقل، أداء أفضل (Cache تلقائي + dedup).

## المبدأ الذهبي
> **إذا كانت البيانات تأتي من السيرفر → React Query. غير ذلك فقط → Redux.**

## التقسيم الرسمي

### 1) Server-State → React Query (`@tanstack/react-query`) حصريًا
كل ما يُجلب عبر `src/services/api.ts`:

- الطلاب، المدرسين، الموظفين.
- المقررات، الجداول، الحضور.
- الدرجات، الخصومات، المدفوعات.
- المخزون، الإشعارات، سجلات التدقيق.
- التقارير والإحصائيات.

**لا يُسمح بإنشاء Redux slice جديد لأي من هذه البيانات.**

نمط الاستخدام القياسي:
```ts
export const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const,
}

export const useEntities = (params) => useQuery({
  queryKey: [...entityKeys.lists(), params],
  queryFn: () => api.getEntities(params),
  placeholderData: keepPreviousData,
})
```

### 2) Client / Global UI-State → Redux (`@reduxjs/toolkit`)
يُستخدم فقط لِـ:

- `authSlice`: المستخدم الحالي، التوكن، حالة الجلسة.
- (مستقبلًا إن لزم) تفضيلات واجهة عامة تتخطى شجرة الكومبوننتات.

**القاعدة:** لا توضع هنا بيانات يمكن إعادة جلبها من السيرفر.

### 3) Local Component State → `useState` / `useReducer`
- فتح/إغلاق مودال، قيم حقول نموذج، pagination محلي، tabs، إلخ.
- لا تنقل إلى Redux إلا إذا احتاجتها كومبوننتات متباعدة فعلًا.

### 4) URL / Route State → React Router
- فلاتر البحث القابلة للمشاركة كرابط.
- Tabs المُستمرّة عبر الانتقال.

## ممنوعات
- ممنوع `createAsyncThunk` لجلب بيانات API جديدة.
- ممنوع تخزين نتائج `useQuery` داخل Redux.
- ممنوع استدعاء `api.*` من Reducers أو Selectors.
- ممنوع ازدواج نفس البيانات في مكانين (Redux + Query).

## إبطال الـCache (Invalidation)
داخل الـMutation استخدم:
```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: entityKeys.lists() })
}
```
للبيانات المترابطة (مثلاً تسجيل طالب في مقرر)، أبطل كلا المفتاحين.

## لماذا هذا النموذج؟
- React Query يقدم Cache، Dedup، Retry، Stale-While-Revalidate خارج الصندوق.
- Redux Toolkit ممتاز لحالة UI المعقدة ولكنه مبالغة لبيانات السيرفر.
- النموذج الحالي يقلل ~70% من كود إدارة البيانات مقارنة بـ Slices + Thunks.

## هجرة الكود القديم
- ✅ `coursesSlice` أُزيل وحوّل إلى `useCourses` (React Query).
- لا توجد Slices أخرى لبيانات سيرفر.
- عند لقاء كود قديم يستخدم Thunks لِـ API → حوّله إلى Query/Mutation.

## مراجع
- `src/features/students/hooks/useStudents.ts` — نموذج مرجعي.
- `src/features/courses/hooks/useCourses.ts` — بعد الهجرة.
- `src/main.tsx` — إعدادات `QueryClient` العامة.
