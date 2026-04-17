# Deployment Guide

## جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [المتطلبات](#المتطلبات)
- [الإعداد المحلي](#الإعداد-المحلي)
- [الإعداد للإنتاج](#الإعداد-للإنتاج)
- [نشر على Vercel](#نشر-على-vercel)
- [نشر على Netlify](#نشر-على-netlify)
- [نشر على AWS](#نشر-على-aws)
- [نشر على Docker](#نشر-على-docker)
- [تحقق بعد النشر](#تحقق-بعد-النشر)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## نظرة عامة

هذا الدليل يغطي عملية نشر نظام إدارة الجامعة على بيئات مختلفة.

### المتطلبات الأساسية
- Node.js 18+ 
- npm أو pnpm
- Git
- حساب على منصة النشر (Vercel/Netlify/AWS)

---

## المتطلبات

### المتطلبات المحلية
```bash
node --version  # Node.js 18+ 
npm --version    # npm 9+
git --version   # Git 2.30+
```

### المتطلبات للإنتاج
- خادم Node.js أو خادم ثابت
- نطاق (Domain) مدفوع أو مجاني
- شهادة SSL (مطلوبة للإنتاج)
- قاعدة بيانات (PostgreSQL/MySQL/MongoDB)
- خدمة Redis (للتخزين المؤقت)

---

## الإعداد المحلي

### تثبيت الاعتماديات
```bash
# استخدم npm
npm install

# أو استخدم pnpm (أسرع)
pnpm install
```

### متغيرات البيئة
قم بنسخ `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم قم بتعبئة القيم:
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:8080
VITE_JWT_SECRET=your-secret-key-here
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENABLED=false
```

### تشغيل خادم التطوير
```bash
# تشغيل خادم التطوير
npm run dev

# أو باستخدام pnpm
pnpm dev
```

الخادم سيعمل على `http://localhost:5173`

---

## الإعداد للإنتاج

### 1. إنشاء نسخة الإنتاج
```bash
# بناء للإنتاج
npm run build:prod

# أو باستخدام pnpm
pnpm build:prod
```

الملفات ستكون في مجلد `dist/`

### 2. اختبار نسخة الإنتاج
```bash
# معاينة نسخة الإنتاج محليًا
npm run preview
```

### 3. متغيرات بيئة الإنتاج
قم بتحديث `.env.production`:

```env
VITE_API_URL=https://api.university.edu
VITE_WS_URL=wss://api.university.edu
VITE_JWT_SECRET=your-very-secure-random-secret-here
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/123
VITE_BUILD_MODE=production
VITE_CSP_ENABLED=true
```

### 4. الأمان
- ✅ استخدم JWT secret قوي (64 حرف عشوائي)
- ✅ تفعيل CSP Headers
- ✅ تفعيل HTTPS فقط
- ✅ تفعيل Sentry لتتبع الأخطاء
- ✅ Rate limiting في الخادم

---

## نشر على Vercel

### المميزات
- ✅ سهل الاستخدام
- ✅ CD/CI تلقائي
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ تحديثات تلقائية عند git push

### خطوات النشر

#### 1. إنشاء حساب
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل باستخدام GitHub/GitLab/Bitbucket

#### 2. نشر المشروع
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel --prod
```

#### 3. متغيرات البيئة
أضف المتغيرات في لوحة Vercel Dashboard:

```
VITE_API_URL=https://api.university.edu
VITE_WS_URL=wss://api.university.edu
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENABLED=true
```

#### 4. vercel.json
إنشاء ملف `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "pnpm run build:prod",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.university.edu/api/:path*"
    }
  ]
}
```

---

## نشر على Netlify

### المميزات
- ✅ مجاني للمشاريع الصغيرة
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ Form submissions مجانية
- ✅ Deploy previews

### خطوات النشر

#### 1. إنشاء حساب
1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل باستخدام GitHub/GitLab/Bitbucket

#### 2. نشر المشروع
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# تسجيل الدخول
netlify login

# بناء ونشر المشروع
netlify deploy --prod --dir=dist
```

#### 3. netlify.toml
إنشاء ملف `netlify.toml`:

```toml
[build]
  command = "pnpm run build:prod"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/api/*"
  to = "https://api.university.edu/api/:splat"
  status = 200
```

---

## نشر على AWS

### المميزات
- ✅ قوي وموثوق
- ✅ قابل للتخصيص بالكامل
- ✅ تكلفة مرنة
- ✅ إقليمية عديدة

### خطوات النشر

#### 1. إنشاء S3 Bucket
```bash
# تثبيت AWS CLI
npm i -g aws-cli

# إنشاء bucket
aws s3 mb s3://university-react-prod

# تفعيل استضافة موقع ثابت
aws s3 website s3://university-react-prod --index-document index.html --error-document index.html
```

#### 2. تكوين CloudFront
```bash
# إنشاء توزيع
aws cloudfront create-distribution \
  --origins "s3://university-react-prod.s3-website-us-east-1.amazonaws.com" \
  --default-root-object index.html \
  --default-cache-behavior "max-age" \
  --price-class "PriceClass_All"
```

#### 3. Route53
أضف سجل DNS:
```
A Record: app.university.edu → CloudFront Domain URL
```

---

## نشر على Docker

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build:prod

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://api.university.edu;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### بناء وتشغيل Docker
```bash
# بناء Docker image
docker build -t university-react .

# تشغيل الحاوية
docker run -p 80:80 university-react
```

### Docker Compose
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.university.edu
    restart: unless-stopped
```

---

## تحقق بعد النشر

### 1. التحقق من الوظائف الأساسية
```bash
# فحص الروابط
curl -I https://app.university.edu

# فحص API
curl -X GET https://app.university.edu/api/students

# فحص WebSocket
wscat -c wss://app.university.edu
```

### 2. Lighthouse
```bash
# تثبيت Lighthouse CLI
npm i -g lighthouse

# فحص الموقع
lighthouse https://app.university.edu --view
```

### 3. اختبار السرعة
```bash
# PageSpeed Insights
npm i -g psi
psi https://app.university.edu

# أو استخدم Google PageSpeed
https://pagespeed.web.dev/
```

### 4. اختبار الأمان
```bash
# SSL Test
https://www.ssllabs.com/ssltest/

# HTTP Headers
https://securityheaders.com/

# Content Security Policy
https://csp-evaluator.withgoogle.com/
```

---

## استكشاف الأخطاء

### المشاكل الشائعة

#### 1. ERR_CONNECTION_REFUSED
**السبب:** الخادم لا يعمل
**الحل:**
```bash
# تأكد من تشغيل الخادم
npm run dev

# أو في الإنتاج، تأكد من تشغيل الخادم
pm2 start
```

#### 2. ERR_SSL_PROTOCOL_ERROR
**السبب:** مشاكل SSL
**الحل:**
- تأكد من صحة الشهادة
- تأكد من تكوين Nginx/Apache
- تأكد من Cloudflare SSL

#### 3. 404 Not Found
**السبب:** مسارات غير صحيحة
**الحل:**
- تحقق من `router.tsx`
- تأكد من `vite.config.ts`
- تحقق من `nginx.conf`

#### 4. CORS Error
**السبب:** CORS غير مفعّل
**الحل:**
```javascript
// في خادم API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

#### 5. WebSocket Connection Failed
**السبب:** WS URL خاطئ أو Firewall
**الحل:**
```env
# تحقق من WS URL
VITE_WS_URL=wss://api.university.edu
```

### سجلات الأخطاء

#### Sentry Dashboard
1. اذهب إلى [sentry.io](https://sentry.io)
2. تحقق من الأخطاء الحديثة
3. راجع Stack Traces

#### Logs من الخادم
```bash
# إذا استخدم PM2
pm2 logs

# أو Docker logs
docker logs <container-id>
```

---

## الصيانة

### التحديثات
```bash
# سحب آخر التحديثات
git pull origin main

# تثبيت الاعتماديات الجديدة
pnpm install

# بناء ونشر
pnpm build:prod && vercel --prod
```

### النسخ الاحتياطي
```bash
# احتياطي قاعدة البيانات
pg_dump university_db > backup.sql

# أو MongoDB
mongodump --db university_db > backup.json

# احتياطي الملفات
tar -czf backup.tar.gz dist/
```

---

## الموارد

### الوثائق
- [دليل التطوير](./DEVELOPMENT_GUIDE.md)
- [توثيق API](./API_DOCUMENTATION.md)
- [مكتبة المكونات](./COMPONENT_LIBRARY.md)

### الأدوات
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [AWS](https://aws.amazon.com)
- [Docker](https://docker.com)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### الموارد التعليمية
- [React Deployment](https://react.dev/learn/start-a-new-react-project/deploy)
- [Vite Deployment](https://vitejs.dev/guide/build.html#production-build)
- [Security Best Practices](https://owasp.org/www-project-secure-coding-practices)

---

## الدعم

للمساعدة، تواصل مع الفريق أو راجع:
- [أرشيف الأخطاء](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/your-repo/issues)
