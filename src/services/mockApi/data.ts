import { Student } from '@/features/students/types'
import { Teacher } from '@/features/teachers/types'
import { Staff } from '@/features/staff/types'
import { Course } from '@/features/courses/types'
import { Grade } from '@/features/grades/types'
import { InventoryItem } from '@/features/inventory/types'
import { SystemSettings } from '@/features/settings/types'
import { User } from '@/store/slices/authSlice'
import { StudentDocument, Discount, Notification } from './types'

// ==========================================
// المستندات (Documents)
// ==========================================
export const initialDocuments: StudentDocument[] = [
    {
        id: 'doc1',
        entityId: '1',
        entityType: 'student',
        name: 'البطاقة الجامعية.pdf',
        type: 'application/pdf',
        size: 1024 * 500,
        uploadDate: new Date(Date.now() - 86400000 * 30).toISOString(),
        url: '#'
    },
    {
        id: 'doc2',
        entityId: '1',
        entityType: 'student',
        name: 'صورة شخصية.jpg',
        type: 'image/jpeg',
        size: 1024 * 200,
        uploadDate: new Date(Date.now() - 86400000 * 25).toISOString(),
        url: '#'
    },
    {
        id: 'doc3',
        entityId: '2',
        entityType: 'teacher',
        name: 'السيرة الذاتية.pdf',
        type: 'application/pdf',
        size: 1024 * 800,
        uploadDate: new Date(Date.now() - 86400000 * 60).toISOString(),
        url: '#'
    },
    {
        id: 'doc4',
        entityId: 's2',
        entityType: 'student',
        name: 'شهادة الثانوية.pdf',
        type: 'application/pdf',
        size: 1024 * 600,
        uploadDate: new Date(Date.now() - 86400000 * 45).toISOString(),
        url: '#'
    },
    {
        id: 'doc5',
        entityId: 's3',
        entityType: 'student',
        name: 'تقرير طبي.pdf',
        type: 'application/pdf',
        size: 1024 * 350,
        uploadDate: new Date(Date.now() - 86400000 * 15).toISOString(),
        url: '#'
    }
]

// ==========================================
// الخصومات والمنح (Discounts)
// ==========================================
export const initialDiscounts: Discount[] = [
    {
        id: 'd1',
        name: 'منحة التفوق الدراسي',
        type: 'percentage',
        value: 20,
        description: 'خصم 20% للطلاب المتفوقين بمعدل تراكمي أعلى من 3.75',
        active: true
    },
    {
        id: 'd2',
        name: 'خصم الأشقاء',
        type: 'percentage',
        value: 10,
        description: 'خصم 10% للأخوة المسجلين في نفس الجامعة',
        active: true
    },
    {
        id: 'd3',
        name: 'منحة الضمان الاجتماعي',
        type: 'fixed_amount',
        value: 5000,
        description: 'خصم مبلغ 5000 ريال لمستفيدي الضمان الاجتماعي',
        active: true
    },
    {
        id: 'd4',
        name: 'خصم الدفع المبكر',
        type: 'percentage',
        value: 5,
        description: 'خصم 5% للطلاب الذين يسددون الرسوم قبل بداية الفصل',
        active: true
    },
    {
        id: 'd5',
        name: 'منحة ذوي الاحتياجات الخاصة',
        type: 'fixed_amount',
        value: 3000,
        description: 'دعم مالي لطلاب ذوي الاحتياجات الخاصة',
        active: true
    },
    {
        id: 'd6',
        name: 'خصم الموظفين',
        type: 'percentage',
        value: 15,
        description: 'خصم 15% لأبناء موظفي الجامعة',
        active: false
    }
]

// ==========================================
// الإشعارات (Notifications)
// ==========================================
export const initialNotifications: Notification[] = [
    {
        id: '1',
        title: 'بدء التسجيل',
        message: 'تم فتح باب التسجيل للفصل الدراسي الجديد',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/courses'
    },
    {
        id: '2',
        title: 'موعد الامتحانات',
        message: 'تم إعلان جدول الامتحانات النهائية',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        link: '/schedule'
    },
    {
        id: '3',
        title: 'نتائج الاختبار النصفي',
        message: 'تم رصد درجات الاختبار النصفي لمقرر مقدمة في البرمجة',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        link: '/grades'
    },
    {
        id: '4',
        title: 'تحذير أكاديمي',
        message: 'معدلك التراكمي أقل من 2.5 - يرجى مراجعة المرشد الأكاديمي',
        type: 'error',
        read: false,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        link: '/profile'
    },
    {
        id: '5',
        title: 'صيانة النظام',
        message: 'سيتم إجراء صيانة دورية للنظام يوم السبت القادم من 12 صباحاً حتى 4 صباحاً',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        link: '/settings'
    }
]

// ==========================================
// تصنيفات المخزون (Inventory Categories)
// ==========================================
export const initialInventoryCategories: string[] = [
    'أجهزة إلكترونية',
    'قرطاسية',
    'أثاث',
    'معدات مختبرات',
    'كتب ومراجع',
    'معدات تنظيف',
    'قطع غيار'
]

// ==========================================
// المستخدمون (Users)
// ==========================================
// NOTE: Passwords are SHA-256 hashed for demo purposes.
// The plain text password for all accounts is '123456'.
// In production, use bcrypt/argon2 with salt rounds on the server side.
const DEMO_PASSWORD_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

export const initialUsers: (User & { password: string })[] = [
    {
        id: '1',
        email: 'student@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'أحمد محمد',
        role: 'student',
        university_id: '2024001',
        department: 'علوم الحاسب',
    },
    {
        id: '2',
        email: 'teacher@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'د. سارة أحمد',
        role: 'teacher',
        department: 'علوم الحاسب',
    },
    {
        id: '3',
        email: 'admin@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'محمد علي',
        role: 'admin',
    },
    {
        id: 'st1',
        email: 'saeed@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'سعيد محمد',
        role: 'staff',
        department: 'شؤون الطلاب',
    },
    {
        id: 's2',
        email: 'fatima@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'فاطمة خالد',
        role: 'student',
        university_id: '2024002',
        department: 'علوم الحاسب',
    },
    {
        id: 's3',
        email: 'omar@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'عمر حسن',
        role: 'student',
        university_id: '2024003',
        department: 'الهندسة',
    },
    {
        id: 't2',
        email: 'mahmoud@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'د. محمود علي',
        role: 'teacher',
        department: 'علوم الحاسب',
    },
    {
        id: 't3',
        email: 'noura@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'د. نورة السالم',
        role: 'teacher',
        department: 'الرياضيات',
    },
    {
        id: 'st2',
        email: 'mona@university.edu',
        password: DEMO_PASSWORD_HASH,
        name: 'منى علي',
        role: 'staff',
        department: 'المكتبة المركزية',
    }
]

// ==========================================
// إعدادات النظام (Settings)
// ==========================================
export const initialSettings: SystemSettings = {
    currentSemester: 'خريف 2024',
    academicYear: '2024-2025',
    registrationEnabled: true,
    gradingEnabled: true,
    systemMaintenance: false,
    universityName: 'جامعة العرب',
    contactEmail: 'admin@university.edu',
    emailNotifications: true,
    pushNotifications: true,
    systemNotifications: true,
    academicNotifications: true,
    financialNotifications: true,
    administrativeNotifications: true,
    reportHeaderSubtitle: 'نظام إدارة الجامعة المتكامل',
    reportFooterText: 'تم إنشاء هذا التقرير آلياً بواسطة نظام إدارة الجامعة',
    language: 'ar',
    direction: 'rtl',
}

// ==========================================
// الطلاب (Students)
// ==========================================
export const initialStudents: Student[] = [
    {
        id: '1',
        name: 'أحمد محمد',
        email: 'student@university.edu',
        university_id: '2024001',
        department: 'علوم الحاسب',
        year: 2,
        gpa: 3.75,
        enrolled_courses: ['c1', 'c2', 'c3'],
    },
    {
        id: 's2',
        name: 'فاطمة خالد',
        email: 'fatima@university.edu',
        university_id: '2024002',
        department: 'علوم الحاسب',
        year: 2,
        gpa: 3.92,
        enrolled_courses: ['c1', 'c2'],
    },
    {
        id: 's3',
        name: 'عمر حسن',
        email: 'omar@university.edu',
        university_id: '2024003',
        department: 'الهندسة',
        year: 3,
        gpa: 3.45,
        enrolled_courses: ['c3'],
    },
    {
        id: 's4',
        name: 'نورة السعيد',
        email: 'noura.s@university.edu',
        university_id: '2024004',
        department: 'نظم المعلومات',
        year: 1,
        gpa: 3.88,
        enrolled_courses: ['c1'],
    },
    {
        id: 's5',
        name: 'خالد العمري',
        email: 'khaled@university.edu',
        university_id: '2024005',
        department: 'الذكاء الاصطناعي',
        year: 4,
        gpa: 3.20,
        enrolled_courses: ['c2', 'c3'],
    },
    {
        id: 's6',
        name: 'ريم الحربي',
        email: 'reem@university.edu',
        university_id: '2024006',
        department: 'الأمن السيبراني',
        year: 2,
        gpa: 3.65,
        enrolled_courses: ['c1', 'c3'],
    },
    {
        id: 's7',
        name: 'ياسر الدوسري',
        email: 'yasser@university.edu',
        university_id: '2024007',
        department: 'علوم الحاسب',
        year: 3,
        gpa: 2.85,
        enrolled_courses: ['c2'],
    },
    {
        id: 's8',
        name: 'هند القحطاني',
        email: 'hind@university.edu',
        university_id: '2024008',
        department: 'الهندسة',
        year: 1,
        gpa: 3.95,
        enrolled_courses: ['c1'],
    },
    {
        id: 's9',
        name: 'ماجد الشهري',
        email: 'majed@university.edu',
        university_id: '2024009',
        department: 'نظم المعلومات',
        year: 4,
        gpa: 3.10,
        enrolled_courses: ['c3'],
    },
    {
        id: 's10',
        name: 'لمى العتيبي',
        email: 'lama@university.edu',
        university_id: '2024010',
        department: 'الذكاء الاصطناعي',
        year: 2,
        gpa: 3.78,
        enrolled_courses: ['c1', 'c2'],
    }
]

// ==========================================
// المعلمون (Teachers)
// ==========================================
export const initialTeachers: Teacher[] = [
    {
        id: '2',
        name: 'د. سارة أحمد',
        email: 'teacher@university.edu',
        department: 'علوم الحاسب',
        specialization: 'هندسة البرمجيات',
        taught_courses: ['c1', 'c2'],
    },
    {
        id: 't2',
        name: 'د. محمود علي',
        email: 'mahmoud@university.edu',
        department: 'علوم الحاسب',
        specialization: 'الذكاء الاصطناعي',
        taught_courses: ['c3'],
    },
    {
        id: 't3',
        name: 'د. نورة السالم',
        email: 'noura@university.edu',
        department: 'الرياضيات',
        specialization: 'الرياضيات التطبيقية',
        taught_courses: ['c4'],
    },
    {
        id: 't4',
        name: 'د. فهد الراشد',
        email: 'fahad@university.edu',
        department: 'الأمن السيبراني',
        specialization: 'أمن المعلومات',
        taught_courses: ['c5'],
    },
    {
        id: 't5',
        name: 'د. منال الحربي',
        email: 'manal@university.edu',
        department: 'الهندسة',
        specialization: 'الهندسة الكهربائية',
        taught_courses: ['c6'],
    },
    {
        id: 't6',
        name: 'د. عبدالله الدوسري',
        email: 'abdullah@university.edu',
        department: 'نظم المعلومات',
        specialization: 'تحليل البيانات',
        taught_courses: ['c7'],
    }
]

// ==========================================
// الموظفون (Staff)
// ==========================================
export const initialStaff: Staff[] = [
    {
        id: 'st1',
        name: 'سعيد محمد',
        email: 'saeed@university.edu',
        job_title: 'مسجل الكلية',
        department: 'شؤون الطلاب',
        phone: '0501234567'
    },
    {
        id: 'st2',
        name: 'منى علي',
        email: 'mona@university.edu',
        job_title: 'أمين المكتبة',
        department: 'المكتبة المركزية',
        phone: '0507654321'
    },
    {
        id: 'st3',
        name: 'بندر الشمري',
        email: 'bandar@university.edu',
        job_title: 'مشرف المختبرات',
        department: 'تقنية المعلومات',
        phone: '0501122334'
    },
    {
        id: 'st4',
        name: 'عبير العنزي',
        email: 'abeer@university.edu',
        job_title: 'محاسبة',
        department: 'الشؤون المالية',
        phone: '0504455667'
    },
    {
        id: 'st5',
        name: 'تركي المطيري',
        email: 'turki@university.edu',
        job_title: 'مشرف الصيانة',
        department: 'الخدمات العامة',
        phone: '0507788990'
    }
]

// ==========================================
// المقررات (Courses)
// ==========================================
export const initialCourses: Course[] = [
    {
        id: 'c1',
        code: 'CS101',
        name: 'مقدمة في البرمجة',
        description: 'أساسيات البرمجة باستخدام Python',
        department: 'علوم الحاسب',
        credits: 3,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 50,
        enrolled_students: 35,
        schedule: [
            { day: 'الأحد', start_time: '08:00', end_time: '10:00', room: 'A101' },
            { day: 'الثلاثاء', start_time: '08:00', end_time: '10:00', room: 'A101' },
        ],
    },
    {
        id: 'c2',
        code: 'CS201',
        name: 'هياكل البيانات',
        description: 'دراسة هياكل البيانات والخوارزميات',
        department: 'علوم الحاسب',
        credits: 4,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 40,
        enrolled_students: 28,
        schedule: [
            { day: 'الاثنين', start_time: '10:00', end_time: '12:00', room: 'B202' },
            { day: 'الأربعاء', start_time: '10:00', end_time: '12:00', room: 'B202' },
        ],
        prerequisites: ['c1'],
    },
    {
        id: 'c3',
        code: 'CS301',
        name: 'الذكاء الاصطناعي',
        description: 'مقدمة في الذكاء الاصطناعي والتعلم الآلي',
        department: 'علوم الحاسب',
        credits: 3,
        teacher_id: 't2',
        teacher_name: 'د. محمود علي',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 30,
        enrolled_students: 22,
        schedule: [
            { day: 'الأحد', start_time: '13:00', end_time: '15:00', room: 'C303' },
        ],
        prerequisites: ['c2'],
    },
    {
        id: 'c4',
        code: 'MATH101',
        name: 'التفاضل والتكامل',
        description: 'أساسيات التفاضل والتكامل مع التطبيقات',
        department: 'الرياضيات',
        credits: 4,
        teacher_id: 't3',
        teacher_name: 'د. نورة السالم',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 60,
        enrolled_students: 45,
        schedule: [
            { day: 'الأحد', start_time: '10:00', end_time: '12:00', room: 'D101' },
            { day: 'الثلاثاء', start_time: '10:00', end_time: '12:00', room: 'D101' },
        ],
    },
    {
        id: 'c5',
        code: 'CYB201',
        name: 'أساسيات الأمن السيبراني',
        description: 'مقدمة في أمن المعلومات والحماية من الاختراقات',
        department: 'الأمن السيبراني',
        credits: 3,
        teacher_id: 't4',
        teacher_name: 'د. فهد الراشد',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 35,
        enrolled_students: 25,
        schedule: [
            { day: 'الاثنين', start_time: '08:00', end_time: '10:00', room: 'E201' },
            { day: 'الأربعاء', start_time: '08:00', end_time: '10:00', room: 'E201' },
        ],
    },
    {
        id: 'c6',
        code: 'ENG101',
        name: 'الهندسة الكهربائية',
        description: 'أساسيات الدوائر الكهربائية والإلكترونيات',
        department: 'الهندسة',
        credits: 4,
        teacher_id: 't5',
        teacher_name: 'د. منال الحربي',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 40,
        enrolled_students: 30,
        schedule: [
            { day: 'الأحد', start_time: '15:00', end_time: '17:00', room: 'F101' },
            { day: 'الثلاثاء', start_time: '15:00', end_time: '17:00', room: 'F101' },
        ],
    },
    {
        id: 'c7',
        code: 'IS301',
        name: 'تحليل البيانات الضخمة',
        description: 'تقنيات تحليل ومعالجة البيانات الضخمة',
        department: 'نظم المعلومات',
        credits: 3,
        teacher_id: 't6',
        teacher_name: 'د. عبدالله الدوسري',
        semester: 'الفصل الأول',
        year: 2024,
        max_students: 30,
        enrolled_students: 18,
        schedule: [
            { day: 'الاثنين', start_time: '13:00', end_time: '15:00', room: 'G201' },
        ],
        prerequisites: ['c1'],
    }
]

// ==========================================
// الدرجات (Grades)
// ==========================================
export const initialGrades: Grade[] = [
    {
        id: 'g1',
        student_id: '1',
        course_id: 'c1',
        course_name: 'مقدمة في البرمجة',
        course_code: 'CS101',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 18, max_score: 20, weight: 0.1 },
            { name: 'الواجب 2', score: 19, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 45, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 38,
        final_score: 85,
        total_score: 88.5,
        letter_grade: 'A',
        grade_points: 4.0,
        credits: 3,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g2',
        student_id: '1',
        course_id: 'c2',
        course_name: 'هياكل البيانات',
        course_code: 'CS201',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 17, max_score: 20, weight: 0.15 },
            { name: 'الواجب 2', score: 16, max_score: 20, weight: 0.15 },
        ],
        midterm_score: 35,
        final_score: 78,
        total_score: 82.0,
        letter_grade: 'B+',
        grade_points: 3.5,
        credits: 4,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g3',
        student_id: '1',
        course_id: 'c3',
        course_name: 'الذكاء الاصطناعي',
        course_code: 'CS301',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 15, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 40, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 32,
        final_score: 72,
        total_score: 76.5,
        letter_grade: 'B',
        grade_points: 3.0,
        credits: 3,
        teacher_id: 't2',
        teacher_name: 'د. محمود علي'
    },
    {
        id: 'g4',
        student_id: 's2',
        course_id: 'c1',
        course_name: 'مقدمة في البرمجة',
        course_code: 'CS101',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 20, max_score: 20, weight: 0.1 },
            { name: 'الواجب 2', score: 19, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 48, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 39,
        final_score: 92,
        total_score: 94.5,
        letter_grade: 'A+',
        grade_points: 4.0,
        credits: 3,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g5',
        student_id: 's2',
        course_id: 'c2',
        course_name: 'هياكل البيانات',
        course_code: 'CS201',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 18, max_score: 20, weight: 0.15 },
            { name: 'الواجب 2', score: 17, max_score: 20, weight: 0.15 },
        ],
        midterm_score: 37,
        final_score: 88,
        total_score: 90.0,
        letter_grade: 'A',
        grade_points: 4.0,
        credits: 4,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g6',
        student_id: 's3',
        course_id: 'c3',
        course_name: 'الذكاء الاصطناعي',
        course_code: 'CS301',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 14, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 35, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 28,
        final_score: 65,
        total_score: 68.0,
        letter_grade: 'C+',
        grade_points: 2.5,
        credits: 3,
        teacher_id: 't2',
        teacher_name: 'د. محمود علي'
    },
    {
        id: 'g7',
        student_id: 's4',
        course_id: 'c1',
        course_name: 'مقدمة في البرمجة',
        course_code: 'CS101',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 19, max_score: 20, weight: 0.1 },
            { name: 'الواجب 2', score: 18, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 42, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 36,
        final_score: 80,
        total_score: 84.0,
        letter_grade: 'A-',
        grade_points: 3.7,
        credits: 3,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g8',
        student_id: 's5',
        course_id: 'c2',
        course_name: 'هياكل البيانات',
        course_code: 'CS201',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 12, max_score: 20, weight: 0.15 },
            { name: 'الواجب 2', score: 14, max_score: 20, weight: 0.15 },
        ],
        midterm_score: 25,
        final_score: 55,
        total_score: 58.0,
        letter_grade: 'D+',
        grade_points: 1.5,
        credits: 4,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g9',
        student_id: 's6',
        course_id: 'c1',
        course_name: 'مقدمة في البرمجة',
        course_code: 'CS101',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 17, max_score: 20, weight: 0.1 },
            { name: 'الواجب 2', score: 16, max_score: 20, weight: 0.1 },
            { name: 'المشروع', score: 40, max_score: 50, weight: 0.2 },
        ],
        midterm_score: 34,
        final_score: 75,
        total_score: 78.0,
        letter_grade: 'B',
        grade_points: 3.0,
        credits: 3,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    },
    {
        id: 'g10',
        student_id: 's7',
        course_id: 'c2',
        course_name: 'هياكل البيانات',
        course_code: 'CS201',
        semester: 'الفصل الأول',
        year: 2024,
        assignments: [
            { name: 'الواجب 1', score: 10, max_score: 20, weight: 0.15 },
            { name: 'الواجب 2', score: 12, max_score: 20, weight: 0.15 },
        ],
        midterm_score: 22,
        final_score: 48,
        total_score: 46.0,
        letter_grade: 'F',
        grade_points: 0.0,
        credits: 4,
        teacher_id: '2',
        teacher_name: 'د. سارة أحمد'
    }
]

// ==========================================
// المخزون (Inventory)
// ==========================================
export const initialInventory: InventoryItem[] = [
    {
        id: 'inv1',
        name: 'جهاز عرض (Projector)',
        category: 'أجهزة إلكترونية',
        quantity: 5,
        location: 'المستودع الرئيسي',
        status: 'available',
        price: 1500,
        sku: 'PRJ-001',
        min_quantity: 2,
        unit: 'جهاز'
    },
    {
        id: 'inv2',
        name: 'أقلام سبورة',
        category: 'قرطاسية',
        quantity: 50,
        location: 'غرفة المدرسين',
        status: 'available',
        price: 5,
        sku: 'PN-002',
        min_quantity: 20,
        unit: 'قلم'
    },
    {
        id: 'inv3',
        name: 'كمبيوتر محمول Dell',
        category: 'أجهزة إلكترونية',
        quantity: 2,
        location: 'معمل الحاسب 1',
        status: 'low_stock',
        price: 3000,
        sku: 'LPT-003',
        min_quantity: 5,
        unit: 'جهاز'
    },
    {
        id: 'inv4',
        name: 'كرسي مكتب دوار',
        category: 'أثاث',
        quantity: 25,
        location: 'المستودع الرئيسي',
        status: 'available',
        price: 350,
        sku: 'CHR-004',
        min_quantity: 10,
        unit: 'كرسي'
    },
    {
        id: 'inv5',
        name: 'مجهر إلكتروني',
        category: 'معدات مختبرات',
        quantity: 8,
        location: 'مختبر العلوم',
        status: 'available',
        price: 5000,
        sku: 'MIC-005',
        min_quantity: 3,
        unit: 'جهاز'
    },
    {
        id: 'inv6',
        name: 'كتاب: أساسيات البرمجة',
        category: 'كتب ومراجع',
        quantity: 15,
        location: 'المكتبة المركزية',
        status: 'available',
        price: 75,
        sku: 'BK-006',
        min_quantity: 5,
        unit: 'نسخة'
    },
    {
        id: 'inv7',
        name: 'طابعة ليزر HP',
        category: 'أجهزة إلكترونية',
        quantity: 1,
        location: 'غرفة المدرسين',
        status: 'low_stock',
        price: 1200,
        sku: 'PRT-007',
        min_quantity: 2,
        unit: 'جهاز'
    },
    {
        id: 'inv8',
        name: 'مكتب خشبي',
        category: 'أثاث',
        quantity: 12,
        location: 'المستودع الرئيسي',
        status: 'available',
        price: 800,
        sku: 'DSK-008',
        min_quantity: 5,
        unit: 'مكتب'
    },
    {
        id: 'inv9',
        name: 'منظف شاشات',
        category: 'معدات تنظيف',
        quantity: 30,
        location: 'غرفة الخدمات',
        status: 'available',
        price: 25,
        sku: 'CLN-009',
        min_quantity: 10,
        unit: 'عبوة'
    },
    {
        id: 'inv10',
        name: 'كابل HDMI',
        category: 'قطع غيار',
        quantity: 20,
        location: 'مخزن التقنية',
        status: 'available',
        price: 35,
        sku: 'CBL-010',
        min_quantity: 10,
        unit: 'كابل'
    }
]
