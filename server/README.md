# University Backend API

Backend حقيقي مبني على **Fastify + Prisma + PostgreSQL + TypeScript**.

هذا الهيكل الأوّلي جاهز للتشغيل محليًا، ويشكّل نقطة انطلاق لاستبدال `mockApi` في الفرونت تدريجيًا.

## المتطلبات
- Node.js 20+
- pnpm أو npm
- Docker (لتشغيل Postgres محليًا بسرعة) — أو Postgres محلي مثبت

## التشغيل السريع

```bash
cd server
cp .env.example .env

# 1) تشغيل Postgres محليًا عبر Docker
docker compose up -d postgres

# 2) تثبيت الحزم
pnpm install    # أو: npm install

# 3) توليد عميل Prisma + إنشاء الجداول
pnpm prisma:generate
pnpm prisma:migrate -- --name init

# 4) بذر بيانات أولية (أدمن افتراضي)
pnpm db:seed

# 5) تشغيل السيرفر بوضع dev
pnpm dev
```

السيرفر يعمل افتراضيًا على: `http://localhost:4000`
- `GET /health` → فحص الحياة
- `GET /health/db` → فحص الاتصال بقاعدة البيانات
- `POST /api/auth/login` → `{ email, password }`
- `GET /api/auth/me` → Header: `Authorization: Bearer <token>`
- `GET /api/courses`, `POST /api/courses`, ...
- `GET /api/students`, ...

## حساب الأدمن الافتراضي (بعد seed)
- Email: `admin@uni.local`
- Password: `admin123`
- **غيّره فورًا قبل أي نشر.**

## ربط الفرونت لاحقًا
- أضف متغيرًا في `.env` للفرونت: `VITE_API_BASE_URL=http://localhost:4000/api`
- استبدل `api.dev.ts` تدريجيًا بطبقة HTTP حقيقية (`fetch`/`axios`) تستهدف هذا السيرفر.

## هيكل المجلدات
```
server/
  prisma/
    schema.prisma    ← نموذج البيانات
    seed.ts          ← بذر البيانات
  src/
    env.ts           ← تحقق من متغيرات البيئة (Zod)
    prisma.ts        ← Prisma Client
    index.ts         ← تشغيل Fastify وتسجيل الـplugins والـroutes
    middleware/
      auth.ts        ← requireAuth / requireRole
    routes/
      auth.ts
      courses.ts
      students.ts
      health.ts
    types/fastify.d.ts
  docker-compose.yml
  .env.example
  tsconfig.json
```

## الأمان المضمن
- `@fastify/helmet` — رؤوس أمان.
- `@fastify/rate-limit` — 200 طلبًا/دقيقة افتراضيًا.
- `@fastify/cors` — مقيّد على `CORS_ORIGIN`.
- `@fastify/jwt` — تحقق من التوكن.
- `bcryptjs` — تجزئة كلمات المرور.
- تحقق من البيئة إلزامي قبل الإقلاع (Zod).

## الخطوة التالية (Phase 2 - ترحيل كامل)
- إضافة بقية الـRoutes: teachers, grades, enrollments, finance, inventory, attendance, reports.
- استبدال `mockApi` في الفرونت بـ HTTP client حقيقي.
- ترحيل بيانات `mockApi` إلى Prisma seed موسّع.
- توحيد آلية الأخطاء (problem+json).
- إضافة اختبارات API (Vitest/Supertest).
