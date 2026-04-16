import { Student } from '@/features/students/types'
import { getStorageData, setStorageData, delay, applySearch, applyPagination, generateTimestampId } from './utils'
import { initialStudents, initialUsers, initialCourses, initialGrades } from './data'
import { addAuditLog } from './auditLog'

export const studentApi = {
    getStudents: async (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
        await delay(300)
        let students = getStorageData('students', initialStudents)

        if (params?.query) {
            students = applySearch(students, params.query, ['name', 'university_id', 'email'])
        }

        if (params?.department && params.department !== 'all') {
            students = students.filter(s => s.department === params.department)
        }

        return applyPagination(students, params?.page, params?.limit)
    },

    getStudentById: async (id: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const student = students.find(s => s.id === id)
        if (!student) throw new Error('الطالب غير موجود')
        return student
    },

    addStudent: async (studentData: Omit<Student, 'id' | 'enrolled_courses'>) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const newStudent: Student = {
            ...studentData,
            id: generateTimestampId('s'),
            enrolled_courses: []
        }
        students.push(newStudent)
        setStorageData('students', students)

        // Audit Log
        await addAuditLog('إضافة طالب', `تم إضافة الطالب ${newStudent.name} (${newStudent.university_id})`)

        return newStudent
    },

    updateStudent: async (id: string, data: Partial<Student>) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const index = students.findIndex(s => s.id === id)
        if (index === -1) throw new Error('الطالب غير موجود')

        students[index] = { ...students[index], ...data }
        setStorageData('students', students)

        if (data.name || data.email) {
            const users = getStorageData('users', initialUsers)
            const userIndex = users.findIndex(u => u.id === id)
            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: data.name || users[userIndex].name,
                    email: data.email || users[userIndex].email
                }
                setStorageData('users', users)
            }
        }

        // Audit Log
        await addAuditLog('تحديث بيانات طالب', `تم تحديث بيانات الطالب ${students[index].name}`)

        return students[index]
    },

    deleteStudent: async (id: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const studentToDelete = students.find(s => s.id === id)
        if (!studentToDelete) throw new Error('الطالب غير موجود')

        // Collect all data snapshots for rollback
        const snapshot = {
            courses: getStorageData('courses', initialCourses),
            grades: getStorageData('grades', initialGrades),
            students: getStorageData('students', initialStudents),
            users: getStorageData('users', initialUsers),
        }

        try {
            // 1. Prepare all changes in memory (no storage writes yet)
            // Cascading Unenrollment - decrement course enrollment counts
            const updatedCourses = snapshot.courses.map(c => {
                if (studentToDelete.enrolled_courses?.includes(c.id)) {
                    return { ...c, enrolled_students: Math.max(0, (c.enrolled_students || 0) - 1) }
                }
                return c
            })

            // Cascading Grade Removal - remove all grades for this student
            const updatedGrades = snapshot.grades.filter(g => g.student_id !== id)

            // Delete from Students
            const updatedStudents = snapshot.students.filter(s => s.id !== id)

            // Delete from Users
            const updatedUsers = snapshot.users.filter(u => u.id !== id)

            // 2. Apply all changes atomically
            setStorageData('courses', updatedCourses)
            setStorageData('grades', updatedGrades)
            setStorageData('students', updatedStudents)
            setStorageData('users', updatedUsers)

            // Audit Log (only after all storage writes succeed)
            await addAuditLog('حذف طالب', `تم حذف الطالب ${studentToDelete.name} وكافة بياناته المرتبطة`)

            return id
        } catch (error) {
            // Rollback all changes to restore consistency
            setStorageData('courses', snapshot.courses)
            setStorageData('grades', snapshot.grades)
            setStorageData('students', snapshot.students)
            setStorageData('users', snapshot.users)

            const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
            await addAuditLog('فشل حذف طالب', `فشل حذف الطالب ${studentToDelete.name}: ${errorMessage} - تم استعادة البيانات`)
            throw new Error(`فشل حذف الطالب: ${errorMessage}`)
        }
    },

    assignDiscountToStudent: async (studentId: string, discountId: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const index = students.findIndex(s => s.id === studentId)
        if (index === -1) throw new Error('الطالب غير موجود')

        const student = students[index]
        if (!student.assigned_discounts) {
            student.assigned_discounts = []
        }

        if (student.assigned_discounts.includes(discountId)) {
            throw new Error('الخصم مضاف بالفعل للطالب')
        }

        student.assigned_discounts.push(discountId)
        students[index] = student
        setStorageData('students', students)
        return student
    },

    removeDiscountFromStudent: async (studentId: string, discountId: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const index = students.findIndex(s => s.id === studentId)
        if (index === -1) throw new Error('الطالب غير موجود')

        const student = students[index]
        if (student.assigned_discounts) {
            student.assigned_discounts = student.assigned_discounts.filter(id => id !== discountId)
            students[index] = student
            setStorageData('students', students)
        }
        return student
    },

    getStudentStats: async () => {
        await delay(300)
        const students = getStorageData('students', initialStudents)

        // 1. Department Distribution
        const deptMap: Record<string, number> = {}
        students.forEach(s => {
            deptMap[s.department] = (deptMap[s.department] || 0) + 1
        })
        const deptDistribution = Object.entries(deptMap).map(([name, value]) => ({ name, value }))

        // 2. Growth Data (Mocked based on current month if created_at is missing)
        const months = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير']
        const growthData = months.map((month, index) => {
            // In a real app, calculate based on created_at
            // For now, interpolate based on total students to look realistic
            const factor = (index + 1) / months.length
            return {
                month,
                students: Math.ceil(students.length * factor)
            }
        })

        return {
            deptDistribution,
            growthData,
            totalStudents: students.length
        }
    }
}
