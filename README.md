# University Management System 🎓

نظام إدارة جامعي متكامل | React 18 + Fastify + SQLite

## 🚀 التشغيل السريع

```bash
# Frontend
cd university-react && pnpm install && pnpm dev

# Backend
cd server && pnpm install && npx prisma db push && npx tsx src/seed-admin.ts && npm run dev
```

## 📁 البنية

```
university-react/
├── src/           # Frontend (React + TypeScript)
├── server/        # Backend API
│   ├── src/       # Routes, Server
│   ├── prisma/    # Database Schema
│   └── dev.db     # SQLite Database
└── tests/         # Tests
```

## 🔗 الروابط

| الخدمة | العنوان |
|--------|---------|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000 |
| API Health | http://localhost:4000/api/health |

## 🔐 تسجيل الدخول

| الحقل | القيمة |
|-------|--------|
| Email | admin@university.edu |
| Password | admin123 |

## 📡 API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/refresh` - تجديد Token
- `POST /api/auth/logout` - تسجيل خروج

### الموارد
- `GET/POST /api/students` - الطلاب
- `GET/POST /api/teachers` - المعلمين
- `GET/POST /api/courses` - المواد
- `GET/POST /api/grades` - الدرجات
- `GET/POST /api/enrollments` - التسجيل
- `GET/POST /api/attendance` - الحضور
- `GET/POST /api/payments` - المدفوعات

## 🧪 الاختبارات

```bash
# Unit Tests
pnpm test

# E2E Tests
pnpm test:e2e
```

## 🔧 الأوامر المفيدة

```bash
# Frontend
pnpm dev          # تشغيل التطوير
pnpm build        # بناء الإنتاج
pnpm lint         # فحص الأخطاء
pnpm storybook    # Storybook

# Backend
cd server
npm run dev       # تشغيل السيرفر
npx prisma studio # إدارة Database
npx prisma db push # إنشاء/تحديث Database
```

## 🛠️ التقنيات

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + Radix UI
- TanStack Query + Redux
- Recharts + Sonner + Zod

### Backend
- Fastify 5 + TypeScript
- Prisma ORM + SQLite
- JWT + bcrypt + Zod

## 📝 ملاحظات

- **محلي:** SQLite (مثبت مسبقاً)
- **إنتاج:** غيّر `DATABASE_URL` لـ PostgreSQL
- **أمان:** غيّر `JWT_SECRET` قبل النشر

## ✅ التحقق

```bash
# Health Check
curl http://localhost:4000/health

# API Health (Database)
curl http://localhost:4000/api/health

# Login Test
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"admin123"}'
```

---
**تحديث:** فبراير 2026
