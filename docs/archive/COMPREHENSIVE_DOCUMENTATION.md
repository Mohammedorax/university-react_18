# University Management System - Documentation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Routing System](#routing-system)
3. [Main Functions & Services](#main-functions--services)
4. [Components Library](#components-library)
5. [State Management](#state-management)
6. [API & Mock Services](#api--mock-services)

---

## Project Overview

This is a **University Management System** built with React, TypeScript, Redux Toolkit, and Tailwind CSS. The application supports multiple user roles: Student, Teacher, Admin, and Staff.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **State**: Redux Toolkit + React Query
- **Routing**: React Router v7
- **i18n**: i18next (Arabic & English)
- **Charts**: Recharts

---

## Routing System

### URL Routes Structure

| Path | Component | Role Access | Description |
|------|-----------|-------------|-------------|
| `/login` | LoginPage | Public | User authentication |
| `/register` | RegisterPage | Public | New user registration |
| `/student/dashboard` | StudentDashboard | Student | Student main dashboard |
| `/teacher/dashboard` | TeacherDashboard | Teacher | Teacher main dashboard |
| `/admin/dashboard` | AdminDashboard | Admin | Admin main dashboard |
| `/staff/dashboard` | StaffDashboard | Staff | Staff main dashboard |
| `/admin/students` | StudentsPage | Admin, Staff | Student management |
| `/admin/teachers` | TeachersPage | Admin, Staff | Teacher management |
| `/admin/staff` | StaffPage | Admin | Staff management |
| `/admin/logs` | AuditLogsPage | Admin | System audit logs |
| `/courses` | CoursesPage | All | Course listing & enrollment |
| `/grades` | GradesPage | Student, Teacher, Admin | Grade management |
| `/schedule` | SchedulePage | Student, Teacher, Admin | Weekly schedule |
| `/inventory` | InventoryPage | Admin, Staff | Inventory management |
| `/discounts` | DiscountsPage | Admin, Staff | Discounts & scholarships |
| `/reports` | ReportsPage | Admin | System reports |
| `/settings` | SettingsPage | Admin | System settings |
| `/profile` | ProfilePage | All | User profile |
| `/teacher/attendance` | AttendancePage | Teacher | Attendance tracking |

### Navigation Items (Sidebar)

The sidebar is defined in `src/components/layouts/DashboardLayout.tsx` and displays items based on user role:

```typescript
const navItems = [
    { label: 'لوحة التحكم', href: '/{role}/dashboard', roles: ['student', 'teacher', 'admin', 'staff'] },
    { label: 'إدارة الطلاب', href: '/admin/students', roles: ['admin', 'staff'] },
    { label: 'إدارة المعلمين', href: '/admin/teachers', roles: ['admin', 'staff'] },
    { label: 'إدارة الموظفين', href: '/admin/staff', roles: ['admin', 'staff'] },
    { label: 'المقررات', href: '/courses', roles: ['student', 'teacher', 'admin', 'staff'] },
    { label: 'الدرجات', href: '/grades', roles: ['student', 'teacher', 'admin'] },
    { label: 'الجدول الدراسي', href: '/schedule', roles: ['student', 'teacher', 'admin'] },
    { label: 'المخزون', href: '/inventory', roles: ['admin', 'staff'] },
    { label: 'الخصومات والمنح', href: '/discounts', roles: ['admin', 'staff'] },
    { label: 'التقارير', href: '/reports', roles: ['admin', 'staff'] },
    { label: 'إعدادات النظام', href: '/settings', roles: ['admin', 'staff'] },
    { label: 'الملف الشخصي', href: '/profile', roles: ['student', 'teacher', 'admin', 'staff'] }
]
```

---

## Main Functions & Services

### 1. Authentication (`src/features/auth/hooks/useAuth.ts`)

```typescript
// Hook: useAuthState
const { user, token, isAuthenticated } = useAuthState()
// Returns: user object, JWT token, authentication status

// Hook: useLogin
const loginMutation = useLogin()
loginMutation.mutate({ email, password })
// Returns: login mutation with isPending, isSuccess, isError states

// Hook: useLogout
const logoutMutation = useLogout()
logoutMutation.mutate()
// Clears auth state and redirects to login
```

### 2. Students API (`src/services/mockApi/students.ts`)

```typescript
const studentApi = {
    getStudents: async (params?: { query?, department?, page?, limit? }) => PaginatedResult<Student>,
    getStudentById: async (id: string) => Student,
    addStudent: async (studentData: Omit<Student, 'id' | 'enrolled_courses'>) => Student,
    updateStudent: async (id: string, data: Partial<Student>) => Student,
    deleteStudent: async (id: string) => string,  // Cascading: removes grades, enrollments
    assignDiscountToStudent: async (studentId: string, discountId: string) => Student,
    removeDiscountFromStudent: async (studentId: string, discountId: string) => Student,
    getStudentStats: async () => { deptDistribution, growthData, totalStudents }
}
```

### 3. Courses API (`src/services/mockApi/courses.ts`)

```typescript
const courseApi = {
    getCourses: async (params?) => PaginatedResult<Course>,
    getCourseById: async (id: string) => Course,
    getEnrolledCourses: async (studentId: string) => Course[],
    addCourse: async (courseData: Omit<Course, 'id'>) => Course,
    updateCourse: async (id: string, data: Partial<Course>) => Course,
    deleteCourse: async (id: string) => string,
    enrollInCourse: async (studentId: string, courseId: string) => Course,
    unenrollFromCourse: async (studentId: string, courseId: string) => Course
}
```

### 4. Grades API (`src/services/mockApi/grades.ts`)

```typescript
const gradeApi = {
    getAllGrades: async () => Grade[],
    getStudentGrades: async (studentId: string) => Grade[],
    getCourseGrades: async (courseId: string) => Grade[],
    submitGrade: async (gradeData: GradeInput) => Grade,
    deleteGrade: async (id: string) => string,
    getGradeStatistics: async () => { avgGrade, passRate, distribution }
}
```

### 5. Teachers API (`src/services/mockApi/teachers.ts`)

```typescript
const teacherApi = {
    getTeachers: async (params?) => PaginatedResult<Teacher>,
    getTeacherById: async (id: string) => Teacher,
    addTeacher: async (teacherData: Omit<Teacher, 'id'>) => Teacher,
    updateTeacher: async (id: string, data: Partial<Teacher>) => Teacher,
    deleteTeacher: async (id: string) => string  // Cascading: releases courses
}
```

### 6. Staff API (`src/services/mockApi/staff.ts`)

```typescript
const staffApi = {
    getStaff: async (params?) => PaginatedResult<Staff>,
    getStaffById: async (id: string) => Staff,
    addStaff: async (staffData: Omit<Staff, 'id'>) => Staff,
    updateStaff: async (id: string, data: Partial<Staff>) => Staff,
    deleteStaff: async (id: string) => string
}
```

### 7. Inventory API (`src/services/mockApi/inventory.ts`)

```typescript
const inventoryApi = {
    getInventory: async () => InventoryItem[],
    addInventoryItem: async (itemData: Omit<InventoryItem, 'id'>) => InventoryItem,
    updateInventoryItem: async (id: string, data: Partial<InventoryItem>) => InventoryItem,
    deleteInventoryItem: async (id: string) => string,
    getCategories: async () => string[],
    addCategory: async (category: string) => string,
    deleteCategory: async (category: string) => string  // Cascading: marks items as 'غير مصنف'
}
```

### 8. Finance API (`src/services/mockApi/finance.ts`)

```typescript
const financeApi = {
    getDiscounts: async () => Discount[],
    addDiscount: async (discountData: Omit<Discount, 'id'>) => Discount,
    updateDiscount: async (id: string, data: Partial<Discount>) => Discount,
    deleteDiscount: async (id: string) => string  // Cascading: removes from all students
}
```

### 9. Audit Logging (`src/services/mockApi/auth.ts`)

```typescript
const authApi = {
    getAuditLogs: async () => AuditLog[],
    addAuditLog: async (action: string, details: string) => AuditLog
    // Automatically called on CRUD operations
}
```

---

## Components Library

### Data Table Components
| Component | File | Description |
|-----------|------|-------------|
| DataTable | `src/components/data-table/DataTable.tsx` | Main table with sorting, filtering |
| DataTableVirtual | `src/components/data-table/DataTableVirtual.tsx` | Virtualized table for large datasets |
| useDataTable | `src/components/data-table/useDataTable.ts` | Hook for table state management |
| useDataTableExport | `src/components/data-table/useDataTableExport.ts` | Export functionality hook |

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| Button | `src/components/ui/button.tsx` | Button with variants |
| Card | `src/components/ui/card.tsx` | Container card |
| Dialog | `src/components/ui/dialog.tsx` | Modal dialog |
| Select | `src/components/ui/select.tsx` | Dropdown select |
| Table | `src/components/ui/table.tsx` | HTML table elements |
| Badge | `src/components/ui/badge.tsx` | Status badges |
| Avatar | `src/components/ui/avatar.tsx` | User avatars |
| Sheet | `src/components/ui/sheet.tsx` | Side drawer |

### Custom Components
| Component | File | Description |
|-----------|------|-------------|
| LazyImage | `src/components/LazyImage.tsx` | Lazy loaded images with skeleton |
| ConfirmDialog | `src/components/ConfirmDialog.tsx` | Confirmation dialog |
| NotificationCenter | `src/components/NotificationCenter.tsx` | Notification dropdown |
| Breadcrumbs | `src/components/Breadcrumbs.tsx` | Navigation breadcrumbs |
| EmptyState | `src/components/EmptyState.tsx` | Empty data placeholder |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | Error handling wrapper |

---

## State Management

### Redux Store Structure

```
store/
├── index.ts              # Store configuration
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── coursesSlice.ts   # Courses state
│   ├── studentsSlice.ts  # Students state
│   └── ...other slices
```

### React Query Configuration

```typescript
// Query client in main.tsx
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,  // 5 minutes
            refetchOnWindowFocus: true,
            retry: 1
        }
    }
})
```

---

## i18n Configuration

### Languages Supported
- **Arabic (ar)** - Default, RTL support
- **English (en)** - LTR

### Configuration (`src/i18n/config.ts`)
```typescript
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ar: { translation: ar },
            en: { translation: en }
        },
        lng: 'ar',
        fallbackLng: 'ar',
        interpolation: { escapeValue: false }
    })
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
return <h1>{t('students.title')}</h1>
```

---

## Audit Logging

All CRUD operations automatically log to audit system:

| Module | Operations Logged |
|--------|------------------|
| Students | add, update, delete, assign/remove discount |
| Teachers | add, update, delete |
| Staff | add, update, delete |
| Courses | add, update, delete |
| Inventory | add, update, delete items and categories |
| Finance | add, update, delete discounts |
| Grades | submit, update |

---

## Cascading Deletes

The system implements cascading deletes for data integrity:

1. **Student Deletion** → Removes grades, unenrolls from courses, removes from users
2. **Teacher Deletion** → Releases courses (sets teacher to "غير محدد")
3. **Discount Deletion** → Removes from all students' assigned discounts
4. **Category Deletion** → Marks inventory items as "غير مصنف"

---

## File Structure

```
src/
├── components/           # Reusable UI components
│   ├── layouts/         # Layout components (Dashboard, Auth, Main)
│   ├── data-table/      # Data table components
│   └── ui/              # Base UI components (Radix-based)
├── features/            # Feature-based modules
│   ├── admin/          # Admin-specific features
│   ├── auth/           # Authentication
│   ├── courses/        # Course management
│   ├── students/       # Student management
│   ├── teachers/       # Teacher management
│   ├── staff/          # Staff management
│   ├── finance/        # Financial features
│   ├── inventory/      # Inventory features
│   ├── grades/         # Grade management
│   ├── schedule/       # Schedule features
│   ├── reports/        # Reporting features
│   └── settings/        # System settings
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── utils.ts        # General utilities
│   ├── fonts.ts        # Font loading utilities
│   └── export-utils.ts # Export functions (PDF, Excel, CSV)
├── services/           # API services
│   └── mockApi/        # Mock API with localStorage
├── store/              # Redux store
├── i18n/               # Internationalization
├── locales/            # Translation files (ar.json, en.json)
└── router.tsx          # Main router configuration
```

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests with Playwright
```

---

## License & Credits

Built with:
- React + Vite
- Tailwind CSS
- Radix UI
- Lucide Icons
- Recharts
- i18next