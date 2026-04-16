# 🚀 دليل نشر الإصدار التجريبي على Vercel

هذا الدليل يرشدك خطوة بخطوة لنشر المنصة على **Vercel مجانًا** عبر الواجهة (بدون CLI).

الإصدار التجريبي يعمل **بالكامل داخل المتصفح** عبر `mockApi` — لا يحتاج قاعدة بيانات أو سيرفر.

---

## ✅ ما تم تجهيزه داخل المشروع

| الملف | الغرض |
|---|---|
| `vercel.json` | إعدادات Vercel (SPA fallback + رؤوس أمان + كاش للأصول) |
| `.vercelignore` | استثناء `server/`, tests, storybook من الرفع |
| `package.json` (محدث) | أمر `build` متوافق مع Linux (cross-platform) |

تم اختبار البناء محليًا ونجح: `dist/` جاهز وفيه PWA + code-splitting.

---

## 🧭 الطريقة 1: النشر عبر GitHub (الأسهل والموصى بها)

### 1) ارفع التغييرات إلى GitHub

```bash
git add vercel.json .vercelignore package.json
git add docs/STATE_MANAGEMENT.md server/ DEPLOY.md
git commit -m "chore: prepare Vercel deployment + hybrid state policy + backend skeleton"
git push origin main
```

### 2) سجّل/ادخل على Vercel
- افتح: https://vercel.com
- Sign up / Log in باستخدام **GitHub** (أسرع خيار).

### 3) Import Project
1. من لوحة Vercel اضغط **"Add New... → Project"**.
2. اختر مستودعك `university-react_18`.
3. Vercel سيكتشف تلقائيًا أنه **Vite** project.

### 4) إعدادات البناء (تحقق فقط، كلها افتراضية صحيحة)
| الحقل | القيمة |
|---|---|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install --legacy-peer-deps` |
| Node.js Version | **20.x** (مهم — غيّره إذا كان افتراضيًا 18) |

> `--legacy-peer-deps` ضرورية بسبب بعض تعارضات peer بين Storybook + React 18.

### 5) Environment Variables (اختياري الآن)
لا تحتاج أي متغيرات للإصدار التجريبي الحالي (mockApi يعمل في المتصفح).

إذا أردت لاحقًا ربط الباكند:
```
VITE_API_BASE_URL=https://your-api.example.com/api
```

### 6) اضغط **Deploy**
- البناء يستغرق ~2-3 دقائق.
- ستحصل على رابط مثل: `https://university-react-18.vercel.app`

### 7) جرّب التطبيق
من شاشة اللوغين استخدم حسابات `mockApi` (إن كانت لديك، أو تذكر كلمات المرور الافتراضية من كود `src/services/mockApi/auth.ts`).

---

## 🧭 الطريقة 2: الرفع المباشر (بدون GitHub)

إذا لم ترد استخدام GitHub:

1. شغّل محليًا:
   ```bash
   npm run build
   ```
2. افتح https://vercel.com → **Add New → Project → "Deploy"**.
3. اسحب مجلد المشروع كاملاً (أو ملف zip) إلى الصفحة.
4. نفس إعدادات الخطوة (4) أعلاه.

---

## 🔁 التحديثات اللاحقة

- **مع GitHub**: أي `git push` إلى `main` يبني وينشر تلقائيًا.
- أي branch آخر يحصل على **Preview URL** منفصل للمراجعة قبل الدمج.

---

## 🛠️ استكشاف الأخطاء الشائعة

### ❌ Build fails: "tsc: command not found"
→ هذا لن يحدث الآن لأننا أزلنا `tsc -b` من سكريبت البناء. تأكد أنك تستخدم آخر `package.json`.

### ❌ 404 عند الـrefresh داخل الصفحات الداخلية
→ `vercel.json` يحتوي `rewrites` تعالج هذا. تأكد أن الملف مرفوع.

### ❌ Build timeout
→ Vercel المجاني يحدد 45 دقيقة للبناء، ومشروعنا يستغرق ~3 دقائق. لن تحدث.

### ❌ Out of memory أثناء البناء
→ أضف متغير البيئة: `NODE_OPTIONS=--max-old-space-size=4096` من Vercel dashboard.

### ⚠️ تحذيرات حجم الـchunks
→ طبيعية، غير مؤثرة على التشغيل. يمكن تحسينها لاحقًا بـ dynamic imports إضافية.

---

## 📊 الحدود المجانية في Vercel (Hobby Plan)

| المورد | الحد |
|---|---|
| Bandwidth | 100 GB/شهر |
| Build Time | 6,000 دقيقة/شهر |
| Deployments | غير محدود |
| Custom Domain | ✅ مدعوم (مع HTTPS تلقائي) |
| Team | فردي فقط |

---

## 🔜 الخطوة التالية (عند الجاهزية)

لنشر **الباكند + Postgres** على مجاني:
1. **Neon** (Postgres مجاني): https://neon.tech — 500MB + compute
2. **Railway** / **Render** (Backend): $5 credit شهري مجاني
3. نحدّث `VITE_API_BASE_URL` في Vercel لتشير إلى الباكند.
4. نستبدل `api.dev.ts` بـ HTTP client حقيقي.

قل لي متى تريد البدء بهذه الخطوة.
