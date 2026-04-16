# دليل المساهمة في مشروع النظام الجامعي

## 🎉 مرحباً بك في المساهمة!

نحن سعداء بمساهمتك في تطوير نظام إدارة جامعي متكامل. هذا المشروع مفتوح المصدر ونرحب بجميع المساهمات التي تحسن الجودة والوظائف.

### كيفية المساهمة

يمكنك المساهمة من خلال:
- إبلاغ عن الأخطاء (Bug reports)
- اقتراح ميزات جديدة (Feature requests)
- تحسين الوثائق
- كتابة الكود وإصلاح الأخطاء
- تحسين الاختبارات

## 📋 قواعد الكود والمعايير

### معايير الكود
- نستخدم **TypeScript** لجميع الملفات الجديدة
- نتبع نمط **Feature Sliced Design** لتنظيم الكود
- نستخدم **ESLint** و **Prettier** للتحقق من التنسيق
- نستخدم **Zod** للتحقق من صحة البيانات
- نستخدم **React Hook Form** لإدارة النماذج

### قواعد التنسيق
```javascript
// ✅ صحيح
const userName = 'John Doe';
const isActive = true;

// ❌ خاطئ
const username = 'John Doe';
const active = true;
```

### قواعد التسمية
- المكونات: `PascalCase` (مثل `StudentCard`)
- الدوال: `camelCase` (مثل `getStudentData`)
- الثوابت: `UPPER_SNAKE_CASE` (مثل `API_BASE_URL`)
- الملفات: `kebab-case` (مثل `student-list.tsx`)

## 🛠️ إعداد البيئة المحلية

### المتطلبات الأساسية
- **Node.js** 18+ و **pnpm**
- **Git**
- **VS Code** مع إضافات مفيدة

### خطوات الإعداد

1. **استنساخ المشروع**
```bash
git clone https://github.com/username/university-management-system.git
cd university-management-system
```

2. **تثبيت التبعيات**
```bash
# Frontend
pnpm install

# Backend (إذا كان موجوداً)
cd server
pnpm install
```

3. **إعداد قاعدة البيانات**
```bash
cd server
npx prisma db push
npx tsx src/seed-admin.ts
```

4. **تشغيل المشروع**
```bash
# Frontend
pnpm dev

# Backend
cd server && npm run dev
```

5. **التحقق من العمل**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API Health: http://localhost:4000/api/health

## 🚀 خطوات المساهمة

### 1. Fork المشروع
اضغط على زر "Fork" في صفحة المشروع على GitHub

### 2. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
# أو
git checkout -b fix/issue-number-description
```

### 3. تطوير التغييرات
- اكتب كوداً نظيفاً ومُختبراً
- أضف اختبارات للميزات الجديدة
- تأكد من عمل جميع الاختبارات

### 4. Commit التغييرات
```bash
git add .
git commit -m "feat: add student enrollment feature"
```

### 5. Push الفرع
```bash
git push origin feature/your-feature-name
```

### 6. إنشاء Pull Request
- اذهب إلى صفحة المشروع على GitHub
- اضغط "New Pull Request"
- اختر فرعك كـ "compare"
- اكتب وصفاً واضحاً للتغييرات

## 📝 قواعد رسائل الـ Commit

نتبع مواصفات [Conventional Commits](https://conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### أنواع الـ Commit
- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديث الوثائق
- `style`: تغييرات التنسيق
- `refactor`: إعادة هيكلة الكود
- `test`: إضافة/تحديث اختبارات
- `chore`: مهام الصيانة

### أمثلة
```
feat(auth): add login with Google OAuth
fix(ui): resolve modal overflow on mobile
docs(readme): update installation instructions
test(api): add tests for user endpoints
```

## 🧪 الاختبار والجودة

### أنواع الاختبارات
- **Unit Tests**: اختبار الوحدات باستخدام Vitest
- **Integration Tests**: اختبار التكامل
- **E2E Tests**: اختبار شامل باستخدام Playwright

### تشغيل الاختبارات
```bash
# جميع الاختبارات
pnpm test

# اختبارات E2E
pnpm test:e2e

# اختبارات Storybook
pnpm test:storybook
```

### معايير الجودة
- تغطية الاختبارات > 80%
- لا أخطاء ESLint
- نجاح جميع الاختبارات
- كود قابل للصيانة وقابل للقراءة

### أدوات الجودة
- **ESLint**: فحص الأخطاء
- **TypeScript**: فحص الأنواع
- **Storybook**: توثيق المكونات
- **Playwright**: اختبار E2E

## 📞 التواصل

- **Issues**: للأسئلة والأخطاء
- **Discussions**: للمناقشات العامة
- **Discord/Slack**: للتواصل السريع

شكراً لمساهمتك! 🎓</content>
<parameter name="filePath">D:\myflutterapp\2_Other_projects\university-react\CONTRIBUTING.md