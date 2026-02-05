import { Student } from '@/features/students/types'
import { Teacher } from '@/features/teachers/types'
import { Staff } from '@/features/staff/types'
import { Course } from '@/features/courses/types'
import { Grade } from '@/features/grades/types'
import { InventoryItem } from '@/features/inventory/types'
import { SystemSettings } from '@/features/settings/types'
import { User } from '@/store/slices/authSlice'
import { StudentDocument, Discount, Notification } from './types'

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
    }
]

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
    }
]

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
    }
]

export const initialInventoryCategories: string[] = [
    'أجهزة إلكترونية',
    'قرطاسية',
    'أثاث',
    'معدات مختبرات',
    'كتب ومراجع'
]

export const initialUsers: (User & { password: string })[] = [
    {
        id: '1',
        email: 'student@university.edu',
        password: '123456',
        name: 'أحمد محمد',
        role: 'student',
        university_id: '2024001',
        department: 'علوم الحاسب',
    },
    {
        id: '2',
        email: 'teacher@university.edu',
        password: '123456',
        name: 'د. سارة أحمد',
        role: 'teacher',
        department: 'علوم الحاسب',
    },
    {
        id: '3',
        email: 'admin@university.edu',
        password: '123456',
        name: 'محمد علي',
        role: 'admin',
    },
    {
        id: 'st1',
        email: 'saeed@university.edu',
        password: '123456',
        name: 'سعيد محمد',
        role: 'staff',
        department: 'شؤون الطلاب',
    },
]

export const initialSettings: SystemSettings = {
    currentSemester: 'خريف 2024',
    academicYear: '2024-2025',
    registrationEnabled: true,
    gradingEnabled: true,
    systemMaintenance: false,
    universityName: 'الجامعة الافتراضية',
    contactEmail: 'admin@university.edu',
    emailNotifications: true,
    pushNotifications: true,
    systemNotifications: true,
    academicNotifications: true,
    financialNotifications: true,
    administrativeNotifications: true,
}

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
]

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
]

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
    }
]

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
            {
                day: 'الأحد',
                start_time: '08:00',
                end_time: '10:00',
                room: 'A101',
            },
            {
                day: 'الثلاثاء',
                start_time: '08:00',
                end_time: '10:00',
                room: 'A101',
            },
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
            {
                day: 'الاثنين',
                start_time: '10:00',
                end_time: '12:00',
                room: 'B202',
            },
            {
                day: 'الأربعاء',
                start_time: '10:00',
                end_time: '12:00',
                room: 'B202',
            },
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
            {
                day: 'الأحد',
                start_time: '13:00',
                end_time: '15:00',
                room: 'C303',
            },
        ],
        prerequisites: ['c2'],
    },
    {
        id: 'c6',
        code: 'CS301',
        name: 'الذكاء الاصطناعي',
        description: 'مقدمة في الذكاء الاصطناعي وتعلم الآلة',
        department: 'علوم الحاسب',
        credits: 3,
        teacher_id: '3',
        teacher_name: 'د. محمد علي',
        semester: 'الفصل الصيفي',
        year: 2024,
        max_students: 30,
        enrolled_students: 15,
        schedule: [
            {
                day: 'السبت',
                start_time: '09:00',
                end_time: '13:00',
                room: 'C301',
            },
        ],
        prerequisites: ['c2'],
    },
    {
        id: 'c7',
        code: 'CS401',
        name: 'أمن المعلومات',
        description: 'دراسة مفاهيم أمن المعلومات والتشفير',
        department: 'الأمن السيبراني',
        credits: 3,
        teacher_id: '4',
        teacher_name: 'د. أحمد محمد',
        semester: 'الفصل الصيفي',
        year: 2024,
        max_students: 25,
        enrolled_students: 12,
        schedule: [
            {
                day: 'الأحد',
                start_time: '10:00',
                end_time: '13:00',
                room: 'D101',
            },
            {
                day: 'الثلاثاء',
                start_time: '10:00',
                end_time: '12:00',
                room: 'D101',
            },
        ],
        prerequisites: ['c3'],
    },
]

export const initialGrades: Grade[] = [
    {
        id: 'g1',
        student_id: '1',
        course_id: 'c1',
        course_name: 'مقدمة في البرمجة',
        course_code: 'CS101',
        semester: 'الفصل الثاني',
        year: 2023,
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
]

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
    }
]
