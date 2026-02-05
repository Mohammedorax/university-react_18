# API Documentation

## جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [نقاط النهاية (Endpoints)](#نقاط-النهاية-endpoints)
- [الأنواع (Types)](#الأنواع-types)
- [الخطأ والتعامل معها](#الخطأ-والتعامل-معها)
- [مثال الاستخدام](#مثال-الاستخدام)

---

## نظرة عامة

نظام إدارة الجامعة يستخدم Mock API للتطوير والاختبار. في الإنتاج، سيتم استبدال Mock API بـ API حقيقي.

### الأساسيات

- **Base URL:** `http://localhost:4000` (تطوير) / `https://api.university.edu` (إنتاج)
- **نوع المحتوى:** `application/json`
- **توثيق التحقق:** JWT (JSON Web Tokens)
- **تقييد السعر:** 5 محاولات كل 15 دقيقة

---

## نقاط النهاية (Endpoints)

### المصادقة (Authentication)

#### POST /auth/login

تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور.

**طلب:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**استجابة ناجحة (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "admin",
    "name": "أحمد محمد"
  }
}
```

**الخطأ (401):**
```json
{
  "error": "بيانات الدخول غير صحيحة"
}
```

---

### الطلاب (Students)

#### GET /students

الحصول على قائمة جميع الطلاب.

**الاستعلام (Query Parameters):**
- `page` (رقم): رقم الصفحة - افتراضي: 1
- `limit` (رقم): عدد النتائج لكل صفحة - افتراضي: 10
- `search` (نص): بحث في الاسم أو البريد الإلكتروني
- `department` (نص): تصفية حسب القسم

**مثال الطلب:**
```
GET /students?page=1&limit=10&search=أحمد&department=علوم الحاسب
```

**استجابة ناجحة (200):**
```json
{
  "data": [
    {
      "id": "1",
      "name": "أحمد علي",
      "email": "ahmed@example.com",
      "phone": "05xxxxxxxx",
      "department": "علوم الحاسب",
      "gpa": 3.75,
      "status": "active",
      "enrollmentDate": "2024-01-15"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

#### POST /students

إنشاء طالب جديد.

**طلب:**
```json
{
  "name": "سارة محمود",
  "email": "sara@example.com",
  "phone": "05xxxxxxxx",
  "department": "هندسة البرمجيات",
  "gpa": 3.85
}
```

**استجابة ناجحة (201):**
```json
{
  "id": "new-student-id",
  "message": "تم إنشاء الطالب بنجاح"
}
```

**الخطأ (400):**
```json
{
  "error": "البريد الإلكتروني مستخدم بالفعل"
}
```

---

#### PUT /students/:id

تحديث بيانات طالب موجود.

**طلب:**
```json
{
  "name": "سارة محمود",
  "email": "sara.new@example.com",
  "gpa": 3.90
}
```

---

#### DELETE /students/:id

حذف طالب.

**استجابة ناجحة (200):**
```json
{
  "message": "تم حذف الطالب بنجاح"
}
```

---

### المعلمين (Teachers)

#### GET /teachers

الحصول على قائمة جميع المعلمين.

**الاستعلام (Query Parameters):**
- `page` (رقم): رقم الصفحة
- `limit` (رقم): عدد النتائج لكل صفحة
- `search` (نص): بحث في الاسم أو التخصص

---

#### POST /teachers

إنشاء معلم جديد.

**طلب:**
```json
{
  "name": "د. محمد أحمد",
  "email": "mohammed@example.com",
  "phone": "05xxxxxxxx",
  "specialization": "علوم الحاسب",
  "department": "كلية الحاسب والمعلومات"
}
```

---

### المواد (Courses)

#### GET /courses

الحصول على قائمة جميع المواد.

**الاستعلام (Query Parameters):**
- `page` (رقم): رقم الصفحة
- `limit` (رقم): عدد النتائج لكل صفحة
- `department` (نص): تصفية حسب القسم
- `level` (نص): المستوى (أولى، ثانية، ثالثة، رابعة)

**مثال الطلب:**
```
GET /courses?department=علوم الحاسب&level=ثانية
```

**استجابة ناجحة (200):**
```json
{
  "data": [
    {
      "id": "CS101",
      "name": "مقدمة في البرمجة",
      "code": "CS101",
      "credits": 3,
      "department": "علوم الحاسب",
      "level": "أولى",
      "teacher": {
        "id": "t1",
        "name": "د. محمد أحمد"
      },
      "enrolledStudents": 45,
      "maxStudents": 50
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95
  }
}
```

---

### الدرجات (Grades)

#### GET /grades

الحصول على درجات الطالب.

**الاستعلام (Query Parameters):**
- `studentId` (نص): معرف الطالب (مطلوب)
- `courseId` (نص): معرف المادة
- `semester` (نص): الفصل الدراسي

**مثال الطلب:**
```
GET /grades?studentId=123&semester=2024-1
```

**استجابة ناجحة (200):**
```json
{
  "data": [
    {
      "id": "g1",
      "courseId": "CS101",
      "studentId": "123",
      "midterm": 85,
      "final": 90,
      "total": 87.5,
      "letterGrade": "A",
      "semester": "2024-1"
    }
  ]
}
```

---

### المخزون (Inventory)

#### GET /inventory

الحصول على قائمة العناصر في المخزون.

**الاستعلام (Query Parameters):**
- `page` (رقم): رقم الصفحة
- `limit` (رقم): عدد النتائج لكل صفحة
- `category` (نص): تصفية حسب الفئة
- `status` (نص): حالة العنصر (متوفر، نفد، طلب)

**مثال الطلب:**
```
GET /inventory?category=مكتبة&status=متوفر
```

**استجابة ناجحة (200):**
```json
{
  "data": [
    {
      "id": "inv1",
      "name": "حاسوب محمول Dell",
      "category": "مكتبة",
      "quantity": 15,
      "price": 3500,
      "status": "متوفر",
      "location": "مستودع أ",
      "lastUpdated": "2024-01-20"
    }
  ]
}
```

---

### التقارير (Reports)

#### GET /reports/students

الحصول على تقرير شامل عن الطلاب.

**الاستعلام (Query Parameters):**
- `startDate` (تاريخ): تاريخ البداية
- `endDate` (تاريخ): تاريخ النهاية
- `department` (نص): تصفية حسب القسم
- `format` (نص): تنسيق التقرير (pdf, excel, json)

**مثال الطلب:**
```
GET /reports/students?startDate=2024-01-01&endDate=2024-12-31&format=pdf
```

---

#### GET /reports/attendance

الحصول على تقرير الحضور.

**الاستعلام (Query Parameters):**
- `courseId` (نص): معرف المادة
- `startDate` (تاريخ): تاريخ البداية
- `endDate` (تاريخ): تاريخ النهاية

---

### سجلات التدقيق (Audit Logs)

#### GET /audit-logs

الحصول على سجلات التدقيق.

**الاستعلام (Query Parameters):**
- `page` (رقم): رقم الصفحة
- `limit` (رقم): عدد النتائج لكل صفحة
- `action` (نص): تصفية حسب الإجراء
- `userId` (نص): تصفية حسب المستخدم
- `startDate` (تاريخ): تاريخ البداية
- `endDate` (تاريخ): تاريخ النهاية

**مثال الطلب:**
```
GET /audit-logs?action=DELETE&userId=123&startDate=2024-01-01
```

**استجابة ناجحة (200):**
```json
{
  "data": [
    {
      "id": "audit1",
      "action": "DELETE",
      "entityType": "STUDENT",
      "entityId": "123",
      "user_id": "admin1",
      "details": "تم حذف الطالب أحمد علي",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "totalItems": 100
  }
}
```

---

## الأنواع (Types)

### Student
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  gpa: number;
  status: 'active' | 'inactive' | 'pending';
  enrollmentDate: string;
}
```

### Teacher
```typescript
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  department: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  level: string;
  teacher?: {
    id: string;
    name: string;
  };
  enrolledStudents: number;
  maxStudents: number;
}
```

### Grade
```typescript
interface Grade {
  id: string;
  courseId: string;
  studentId: string;
  midterm: number;
  final: number;
  total: number;
  letterGrade: string;
  semester: string;
}
```

### InventoryItem
```typescript
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price?: number;
  status: 'متوفر' | 'نفد' | 'طالب';
  location?: string;
  lastUpdated: string;
}
```

---

## الخطأ والتعامل معها

### أكواد الخطأ (Error Codes)

| الكود | الوصف | الحل |
|-------|---------|-------|
| 400 | طلب غير صالح | تحقق من البيانات المرسلة |
| 401 | غير مصرح | تسجيل الدخول مطلوب |
| 403 | ممنوع | لا تملك الصلاحية المطلوبة |
| 404 | غير موجود | المورد غير موجود |
| 409 | تعارض | البيانات موجودة بالفعل |
| 429 | طلبات كثيرة | انتظر قليلأ ثم أعد المحاولة |
| 500 | خطأ في الخادم | اتصل بالدعم الفني |

### استجابات الخطأ القياسية

```json
{
  "error": "رسالة الخطأ بالعربية",
  "code": "ERROR_CODE",
  "details": {
    "field": "email",
    "message": "البريد الإلكتروني غير صالح"
  }
}
```

---

## مثال الاستخدام

### تسجيل الدخول
```typescript
const response = await fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'student@university.edu',
    password: 'password123'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

### الحصول على الطلاب
```typescript
const response = await fetch('http://localhost:4000/students?page=1&limit=10', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const { data, pagination } = await response.json();
```

### إنشاء طالب جديد
```typescript
const response = await fetch('http://localhost:4000/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'سارة محمود',
    email: 'sara@example.com',
    department: 'هندسة البرمجيات',
    gpa: 3.85
  })
});

const { id } = await response.json();
```

---

## WebSocket API

### الاتصال

**URL:** `ws://localhost:8080` (تطوير) / `wss://api.university.edu` (إنتاج)

### الرسائل

#### الاشتراك (Subscribe)
```json
{
  "type": "subscribe",
  "channels": ["notifications", "updates", "alerts"]
}
```

#### إشعار (Notification)
```json
{
  "type": "notification",
  "id": "notif-123",
  "severity": "info" | "warning" | "error" | "success",
  "title": "عنوان الإشعار",
  "message": "تفاصيل الإشعار",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## حدود الأمان

### Rate Limiting
- الحد الأقصى: 5 طلبات لكل 15 دقيقة
- وقت القفل: 15 دقيقة
- إعادة المحاولة: بعد انقضاء وقت القفل

### JWT Configuration
- مدة الصلاحية: 24 ساعة
- نوع التشفير: HS256
- العبء: `Authorization: Bearer <token>`

---

## ملاحظات الإنتاج

### في الإنتاج
- استخدم HTTPS فقط
- تفعيل Rate Limiting
- استخدام سر JWT قوي
- تفعيل CSP Headers
- تسجيل جميع الأخطاء في Sentry

### متغيرات البيئة المطلوبة
```
VITE_API_URL=https://api.university.edu
VITE_WS_URL=wss://api.university.edu
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENABLED=true
```

---

## الدعم

للمساعدة والمزيد من المعلومات، راجع:
- [دليل التطوير](./DEVELOPMENT_GUIDE.md)
- [دليل النشر](./PRODUCTION_GUIDE.md)
- [أرشيف الأخطاء](./TROUBLESHOOTING.md)
