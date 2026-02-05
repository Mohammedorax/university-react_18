/**
 * @file i18n.ts
 * @description Internationalization configuration and translation utilities
 */

export type Language = 'ar' | 'en';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface LanguageConfig {
  code: Language;
  name: string;
  nameArabic: string;
  dir: 'rtl' | 'ltr';
  dateFormat: string;
}

// Arabic translations (default)
export const ar: TranslationDict = {
  // Common
  common: {
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    refresh: 'تحديث',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    close: 'إغلاق',
    view: 'عرض',
    actions: 'الإجراءات',
    status: 'الحالة',
    date: 'التاريخ',
    time: 'الوقت',
    noData: 'لا توجد بيانات',
    required: 'مطلوب',
    optional: 'اختياري',
  },
  
  // Navigation
  nav: {
    dashboard: 'لوحة التحكم',
    students: 'الطلاب',
    teachers: 'المعلمون',
    staff: 'الموظفون',
    courses: 'المقررات',
    grades: 'الدرجات',
    schedule: 'الجدول الدراسي',
    reports: 'التقارير',
    finance: 'المالية',
    inventory: 'المخزون',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
  },
  
  // Auth
  auth: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'التسجيل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور?',
    rememberMe: 'تذكرني',
    noAccount: 'ليس لديك حساب?',
    haveAccount: 'لديك حساب?',
    signUp: 'سجل الآن',
    signIn: 'سجل الدخول',
  },
  
  // Students
  students: {
    title: 'إدارة الطلاب',
    addStudent: 'إضافة طالب',
    editStudent: 'تعديل طالب',
    studentName: 'اسم الطالب',
    universityId: 'الرقم الجامعي',
    department: 'القسم',
    year: 'السنة',
    gpa: 'المعدل التراكمي',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    enrolledCourses: 'المقررات المسجلة',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    graduated: 'تخرج',
    suspended: 'معلق',
  },
  
  // Teachers
  teachers: {
    title: 'إدارة المعلمين',
    addTeacher: 'إضافة معلم',
    editTeacher: 'تعديل معلم',
    teacherName: 'اسم المعلم',
    specialization: 'التخصص',
    office: 'المكتب',
    officeHours: 'ساعات المكتب',
  },
  
  // Courses
  courses: {
    title: 'إدارة المقررات',
    addCourse: 'إضافة مقرر',
    editCourse: 'تعديل مقرر',
    courseName: 'اسم المقرر',
    courseCode: 'رمز المقرر',
    credits: 'الساعات المعتمدة',
    description: 'الوصف',
    department: 'القسم',
    teacher: 'المعلم',
    schedule: 'الجدول',
    capacity: 'السعة',
    enrolled: 'المسجلين',
    prerequisites: 'المتطلبات السابقة',
    semester: 'الفصل الدراسي',
    firstSemester: 'الفصل الأول',
    secondSemester: 'الفصل الثاني',
    summerSemester: 'الفصل الصيفي',
  },
  
  // Grades
  grades: {
    title: 'الدرجات',
    addGrade: 'رصد درجة',
    editGrade: 'تعديل درجة',
    assignments: 'الواجبات',
    midterm: 'الامتحان النصفي',
    final: 'الامتحان النهائي',
    total: 'المجموع',
    grade: 'التقدير',
    points: 'النقاط',
    score: 'الدرجة',
    maxScore: 'الدرجة القصوى',
    weight: 'الوزن',
    gpa: 'المعدل التراكمي',
    cumulativeGpa: 'المعدل التراكمي',
    passed: 'نجح',
    failed: 'راسب',
  },
  
  // Schedule
  schedule: {
    title: 'الجدول الدراسي',
    day: 'اليوم',
    time: 'الوقت',
    room: 'القاعة',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    noClasses: 'لا توجد محاضرات',
  },
  
  // Reports
  reports: {
    title: 'التقارير',
    general: 'عام',
    students: 'الطلاب',
    courses: 'المقررات',
    grades: 'الدرجات',
    financial: 'مالي',
    exportPDF: 'تصدير PDF',
    exportExcel: 'تصدير Excel',
    generateReport: 'إنشاء تقرير',
    dateRange: 'نطاق التاريخ',
  },
  
  // Finance
  finance: {
    title: 'إدارة المالية',
    fees: 'الرسوم',
    discounts: 'الخصومات',
    payments: 'المدفوعات',
    addDiscount: 'إضافة خصم',
    discountName: 'اسم الخصم',
    discountType: 'نوع الخصم',
    percentage: 'نسبة مئوية',
    fixedAmount: 'مبلغ ثابت',
    discountValue: 'قيمة الخصم',
    active: 'نشط',
    inactive: 'غير نشط',
  },
  
  // Inventory
  inventory: {
    title: 'إدارة المخزون',
    items: 'الأصناف',
    categories: 'الفئات',
    addItem: 'إضافة صنف',
    addCategory: 'إضافة فئة',
    itemName: 'اسم الصنف',
    category: 'الفئة',
    quantity: 'الكمية',
    price: 'السعر',
    location: 'الموقع',
    status: 'الحالة',
    available: 'متاح',
    borrowed: 'معار',
    underMaintenance: 'صيانة',
  },
  
  // Settings
  settings: {
    title: 'الإعدادات',
    general: 'عام',
    appearance: 'المظهر',
    notifications: 'الإشعارات',
    security: 'الأمان',
    currentSemester: 'الفصل الدراسي الحالي',
    academicYear: 'السنة الأكاديمية',
    theme: 'السمة',
    light: 'فاتح',
    dark: 'داكن',
    system: 'تلقائي',
    universityName: 'اسم الجامعة',
    language: 'اللغة',
    timezone: 'المنطقة الزمنية',
  },
  
  // Errors
  errors: {
    networkError: 'خطأ في الاتصال بالخادم',
    unauthorized: 'غير مصرح لك بالوصول',
    forbidden: 'محظور',
    notFound: 'الصفحة غير موجودة',
    serverError: 'خطأ في الخادم',
    validationError: 'خطأ في التحقق',
    unknownError: 'خطأ غير معروف',
    retry: 'إعادة المحاولة',
  },
  
  // Success messages
  success: {
    saved: 'تم الحفظ بنجاح',
    deleted: 'تم الحذف بنجاح',
    updated: 'تم التحديث بنجاح',
    created: 'تم الإنشاء بنجاح',
    exported: 'تم التصدير بنجاح',
    imported: 'تم الاستيراد بنجاح',
    sent: 'تم الإرسال بنجاح',
  },
};

// English translations
export const en: TranslationDict = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    view: 'View',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    noData: 'No data available',
    required: 'Required',
    optional: 'Optional',
  },
  
  nav: {
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    staff: 'Staff',
    courses: 'Courses',
    grades: 'Grades',
    schedule: 'Schedule',
    reports: 'Reports',
    finance: 'Finance',
    inventory: 'Inventory',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
  },
  
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
  },
  
  students: {
    title: 'Student Management',
    addStudent: 'Add Student',
    editStudent: 'Edit Student',
    studentName: 'Student Name',
    universityId: 'University ID',
    department: 'Department',
    year: 'Year',
    gpa: 'GPA',
    email: 'Email',
    phone: 'Phone Number',
    enrolledCourses: 'Enrolled Courses',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    graduated: 'Graduated',
    suspended: 'Suspended',
  },
  
  teachers: {
    title: 'Teacher Management',
    addTeacher: 'Add Teacher',
    editTeacher: 'Edit Teacher',
    teacherName: 'Teacher Name',
    specialization: 'Specialization',
    office: 'Office',
    officeHours: 'Office Hours',
  },
  
  courses: {
    title: 'Course Management',
    addCourse: 'Add Course',
    editCourse: 'Edit Course',
    courseName: 'Course Name',
    courseCode: 'Course Code',
    credits: 'Credits',
    description: 'Description',
    department: 'Department',
    teacher: 'Teacher',
    schedule: 'Schedule',
    capacity: 'Capacity',
    enrolled: 'Enrolled',
    prerequisites: 'Prerequisites',
    semester: 'Semester',
    firstSemester: 'First Semester',
    secondSemester: 'Second Semester',
    summerSemester: 'Summer Semester',
  },
  
  grades: {
    title: 'Grades',
    addGrade: 'Add Grade',
    editGrade: 'Edit Grade',
    assignments: 'Assignments',
    midterm: 'Midterm',
    final: 'Final',
    total: 'Total',
    grade: 'Grade',
    points: 'Points',
    score: 'Score',
    maxScore: 'Maximum Score',
    weight: 'Weight',
    gpa: 'GPA',
    cumulativeGpa: 'Cumulative GPA',
    passed: 'Passed',
    failed: 'Failed',
  },
  
  schedule: {
    title: 'Weekly Schedule',
    day: 'Day',
    time: 'Time',
    room: 'Room',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    noClasses: 'No classes scheduled',
  },
  
  reports: {
    title: 'Reports',
    general: 'General',
    students: 'Students',
    courses: 'Courses',
    grades: 'Grades',
    financial: 'Financial',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    generateReport: 'Generate Report',
    dateRange: 'Date Range',
  },
  
  finance: {
    title: 'Financial Management',
    fees: 'Fees',
    discounts: 'Discounts',
    payments: 'Payments',
    addDiscount: 'Add Discount',
    discountName: 'Discount Name',
    discountType: 'Discount Type',
    percentage: 'Percentage',
    fixedAmount: 'Fixed Amount',
    discountValue: 'Discount Value',
    active: 'Active',
    inactive: 'Inactive',
  },
  
  inventory: {
    title: 'Inventory Management',
    items: 'Items',
    categories: 'Categories',
    addItem: 'Add Item',
    addCategory: 'Add Category',
    itemName: 'Item Name',
    category: 'Category',
    quantity: 'Quantity',
    price: 'Price',
    location: 'Location',
    status: 'Status',
    available: 'Available',
    borrowed: 'Borrowed',
    underMaintenance: 'Under Maintenance',
  },
  
  settings: {
    title: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    notifications: 'Notifications',
    security: 'Security',
    currentSemester: 'Current Semester',
    academicYear: 'Academic Year',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    universityName: 'University Name',
    language: 'Language',
    timezone: 'Timezone',
  },
  
  errors: {
    networkError: 'Network error occurred',
    unauthorized: 'You are not authorized to access this resource',
    forbidden: 'Access forbidden',
    notFound: 'Page not found',
    serverError: 'Server error occurred',
    validationError: 'Validation error',
    unknownError: 'An unknown error occurred',
    retry: 'Retry',
  },
  
  success: {
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
    exported: 'Exported successfully',
    imported: 'Imported successfully',
    sent: 'Sent successfully',
  },
};

// Language configuration
export const languages: Record<Language, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nameArabic: 'العربية',
    dir: 'rtl',
    dateFormat: 'dd/MM/yyyy',
  },
  en: {
    code: 'en',
    name: 'English',
    nameArabic: 'الإنجليزية',
    dir: 'ltr',
    dateFormat: 'MM/dd/yyyy',
  },
};

export default { ar, en, languages };
