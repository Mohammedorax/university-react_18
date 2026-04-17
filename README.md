# University Management System

نظام إدارة جامعي — **React 18 + TypeScript + Vite**.  
في التطوير يعتمد الواجهة على **`mockApi`** داخل المتصفح؛ يوجد هيكل **باكند** اختياري في `server/` (Fastify + Prisma + PostgreSQL).

## التشغيل السريع (الواجهة)

```bash
npm install --legacy-peer-deps
npm run dev
```

يفتح المتصفح عادةً على `http://localhost:3000` (حسب `vite.config.ts`).

## البنية (مستوى عالٍ)

```
├── src/                 # تطبيق React (ميزات، مكونات، خدمات)
├── public/              # أصول ثابتة (شعارات، manifest، PWA)
├── server/              # (اختياري) API + Prisma + Postgres
├── docs/                # توثيق منظم — ابدأ من docs/README.md
├── deploy/              # إعدادات Docker (nginx للـ SPA)
├── Dockerfile           # بناء صورة واجهة ثابتة + nginx
├── netlify.toml / vercel.json  # نشر استضافة سحابية
└── DEPLOY.md            # خطوات Netlify / بدائل
```

## حسابات التجربة (Mock)

انظر [`docs/TEST_ACCOUNTS.md`](docs/TEST_ACCOUNTS.md).

## الباكند (اختياري)

```bash
cd server
cp .env.example .env
# شغّل Postgres محلياً (مثلاً docker compose up -d)
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

- صحة الخدمة: `GET http://localhost:4000/health`
- قاعدة البيانات: `GET http://localhost:4000/health/db`

تفاصيل إضافية: [`server/README.md`](server/README.md).

## الاختبارات

```bash
npm test
```

## البناء للإنتاج

```bash
npm run build
```

معاينة محلية: `npx vite preview` (أو إعدادات `preview` في Vite).

## Docker (واجهة فقط)

```bash
docker build -t university-ui .
docker run -p 8080:80 university-ui
```

ثم افتح `http://localhost:8080`.

## التوثيق

- [docs/README.md](docs/README.md) — فهرس الوثائق
- [docs/STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) — إدارة الحالة

---

**آخر تحديث للبنية:** أبريل 2026
