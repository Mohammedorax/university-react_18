# 🚀 دليل نشر الإصدار التجريبي على Netlify

النشر على **Netlify مجانًا** عبر الواجهة (بدون CLI).

الإصدار التجريبي يعمل **بالكامل داخل المتصفح** عبر `mockApi` — لا يحتاج قاعدة بيانات أو سيرفر.

> 💡 إذا احتجت لاحقًا بدائل أخرى (Cloudflare Pages / Surge / GitHub Pages / Render)، راجع القسم الأخير.

---

## ✅ ما تم تجهيزه داخل المشروع

| الملف | الغرض |
|---|---|
| `netlify.toml` | إعدادات Netlify (build + SPA + رؤوس أمان + كاش) |
| `public/_redirects` | نسخة احتياطية لقاعدة SPA fallback |
| `.vercelignore` | (لا يؤثر، خاص بـVercel فقط) |
| `package.json` (محدث) | أمر `build` متوافق مع Linux (cross-platform) |

تم اختبار البناء محليًا ونجح: `dist/` جاهز وفيه PWA + code-splitting + `_redirects`.

---

## 🧭 الطريقة 1: النشر عبر GitHub (الموصى بها)

### 1) ادفع التغييرات إلى GitHub

```bash
git add netlify.toml public/_redirects package.json
git add docs/STATE_MANAGEMENT.md server/ DEPLOY.md vercel.json .vercelignore
git commit -m "chore: Netlify deployment config + hybrid state policy + backend skeleton"
git push origin main
```

### 2) سجّل/ادخل على Netlify
- افتح: **https://app.netlify.com**
- **Sign up** → اختر **GitHub** (الأسرع) أو **Email**.
- فعّل الحساب من البريد.

### 3) Import Project
1. من لوحة Netlify اضغط **"Add new site"** → **"Import an existing project"**.
2. اختر **"Deploy with GitHub"** → وافق على الصلاحيات.
3. اختر مستودعك `university-react_18`.

### 4) إعدادات البناء
Netlify ستقرأ `netlify.toml` تلقائيًا. تحقق فقط من:

| الحقل | القيمة |
|---|---|
| Branch to deploy | `main` |
| Build command | `npm run build` (تلقائي) |
| Publish directory | `dist` (تلقائي) |
| Node version | `20` (تلقائي من `netlify.toml`) |

> إذا لم تظهر من الواجهة، فلا تقلق — الملف `netlify.toml` يحددها.

### 5) Environment Variables (اختياري الآن)
لا تحتاج أي متغيرات للإصدار التجريبي الحالي.

لاحقًا لربط الباكند:
```
VITE_API_BASE_URL = https://your-api.example.com/api
```

### 6) اضغط **Deploy site**
- البناء يستغرق ~3-5 دقائق أول مرة.
- ستحصل على رابط مثل: `https://random-name-12345.netlify.app`
- يمكنك تغيير الاسم من **Site settings → Change site name**.

### 7) جرّب التطبيق
من شاشة اللوغين استخدم حسابات `mockApi` (راجع `src/services/mockApi/auth.ts` للحسابات الافتراضية).

---

## 🧭 الطريقة 2: الرفع المباشر (بدون GitHub)

إذا لم ترد ربط GitHub:

1. شغّل محليًا:
   ```bash
   npm run build
   ```
2. افتح https://app.netlify.com/drop
3. **اسحب مجلد `dist/`** إلى الصفحة.
4. النشر فوري (~30 ثانية).

> ⚠️ كل تحديث يتطلب سحب `dist/` يدويًا مجددًا. الطريقة 1 أفضل.

---

## 🔁 التحديثات اللاحقة

- **مع GitHub**: أي `git push origin main` يبني وينشر تلقائيًا.
- أي Pull Request يحصل على **Deploy Preview** منفصل للمراجعة.

---

## 🛠️ استكشاف الأخطاء الشائعة

### ❌ Build fails: "npm ERR! peer dependency"
→ `NPM_FLAGS = "--legacy-peer-deps"` موجود في `netlify.toml`. تأكد أن الملف مرفوع.

### ❌ 404 عند refresh على صفحة داخلية
→ `public/_redirects` + قاعدة `netlify.toml` تعالجان هذا. تأكد من وجودهما في المستودع.

### ❌ Build timeout
→ حد Netlify المجاني 15 دقيقة؛ بناؤنا ~3 دقائق. لن يحدث.

### ❌ Out of memory
→ أضف في `netlify.toml` داخل `[build.environment]`:
```toml
NODE_OPTIONS = "--max-old-space-size=4096"
```

### ⚠️ Service Worker (PWA) يعرض نسخة قديمة
→ طبيعي عند التحديثات. الـ`netlify.toml` يضع `sw.js` بدون cache فيتحدث تلقائيًا عند زيارة جديدة.

---

## 📊 الحدود المجانية في Netlify (Starter Plan)

| المورد | الحد |
|---|---|
| Bandwidth | 100 GB/شهر |
| Build minutes | 300 دقيقة/شهر |
| Concurrent builds | 1 |
| Deployments | غير محدود |
| Custom Domain | ✅ مع HTTPS تلقائي |
| Deploy Previews | ✅ لكل PR |

---

## 🌐 بدائل أخرى جاهزة الإعداد

### Cloudflare Pages
1. https://pages.cloudflare.com
2. Connect to Git → اختر المستودع.
3. Build command: `npm run build`
4. Output: `dist`
5. Node version env var: `NODE_VERSION=20`
6. (لا يحتاج `netlify.toml`، الإعدادات من لوحة التحكم)

### Surge.sh (الأبسط على الإطلاق)
```bash
npm run build
npx surge dist your-name.surge.sh
```
أول مرة يطلب إيميل + كلمة مرور فقط.

### GitHub Pages
يحتاج workflow إضافي — اطلب مني إعداده إذا رغبت.

### Render
1. https://render.com → New → Static Site
2. اربط المستودع.
3. Build: `npm run build` | Publish: `dist`

---

## 🔜 الخطوة التالية (عند الجاهزية)

لنشر **الباكند + Postgres** مجانًا:
1. **Neon** (Postgres مجاني): https://neon.tech — 500MB + compute
2. **Render** أو **Railway** (Backend Fastify)
3. نحدّث `VITE_API_BASE_URL` في Netlify Environment → تشير للباكند.
4. نستبدل `api.dev.ts` بـ HTTP client حقيقي.

قل لي متى تريد البدء بهذه الخطوة.
