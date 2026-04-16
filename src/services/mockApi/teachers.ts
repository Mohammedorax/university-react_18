import { Teacher } from '@/features/teachers/types'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'
import { initialTeachers, initialUsers, initialCourses } from './data'
import { addAuditLog } from './auditLog'

export const teacherApi = {
    getTeachers: async (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
        await delay(300)
        let teachers = getStorageData('teachers', initialTeachers)

        if (params?.query) {
            teachers = applySearch(teachers, params.query, ['name', 'email', 'department', 'specialization'])
        }

        if (params?.department && params.department !== 'all') {
            teachers = teachers.filter(t => t.department === params.department)
        }

        return applyPagination(teachers, params?.page, params?.limit)
    },

    getTeacherById: async (id: string) => {
        await delay(300)
        const teachers = getStorageData('teachers', initialTeachers)
        const teacher = teachers.find(t => t.id === id)
        if (!teacher) throw new Error('المدرس غير موجود')
        return teacher
    },

    addTeacher: async (teacherData: Omit<Teacher, 'id'>) => {
        await delay(300)
        const teachers = getStorageData('teachers', initialTeachers)
        const newTeacher: Teacher = {
            ...teacherData,
            id: 't' + (teachers.length + 1)
        }
        teachers.push(newTeacher)
        setStorageData('teachers', teachers)

        const users = getStorageData('users', initialUsers)
        users.push({
            id: newTeacher.id,
            email: newTeacher.email,
            password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // SHA-256 hash of '123456'
            name: newTeacher.name,
            role: 'teacher',
            department: newTeacher.department
        })
        setStorageData('users', users)

        // Audit Log
        await addAuditLog('إضافة مدرس', `تم إضافة المدرس ${newTeacher.name} إلى قسم ${newTeacher.department}`)

        return newTeacher
    },

    updateTeacher: async (id: string, data: Partial<Teacher>) => {
        await delay(500)
        const teachers = getStorageData('teachers', initialTeachers)
        const index = teachers.findIndex(t => t.id === id)

        if (index === -1) throw new Error('المدرس غير موجود')

        teachers[index] = { ...teachers[index], ...data }
        setStorageData('teachers', teachers)

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
        await addAuditLog('تحديث مدرس', `تم تحديث بيانات المدرس ${teachers[index].name}`)

        return teachers[index]
    },

    deleteTeacher: async (id: string) => {
        await delay(500)
        const teachers = getStorageData('teachers', initialTeachers)
        const teacherToDelete = teachers.find(t => t.id === id)
        if (!teacherToDelete) throw new Error('المدرس غير موجود')

        // Collect all data snapshots for rollback
        const snapshot = {
            courses: getStorageData('courses', initialCourses),
            teachers: getStorageData('teachers', initialTeachers),
            users: getStorageData('users', initialUsers),
        }

        try {
            // 1. Prepare all changes in memory (no storage writes yet)
            // Cascading: Release courses assigned to this teacher
            const updatedCourses = snapshot.courses.map(c =>
                c.teacher_id === id
                    ? { ...c, teacher_id: '', teacher_name: 'غير محدد' }
                    : c
            )

            // Delete from Teachers
            const updatedTeachers = snapshot.teachers.filter(t => t.id !== id)

            // Delete from Users
            const updatedUsers = snapshot.users.filter(u => u.id !== id)

            // 2. Apply all changes atomically
            setStorageData('courses', updatedCourses)
            setStorageData('teachers', updatedTeachers)
            setStorageData('users', updatedUsers)

            // Audit Log (only after all storage writes succeed)
            await addAuditLog('حذف مدرس', `تم حذف المدرس ${teacherToDelete.name}`)

            return id
        } catch (error) {
            // Rollback all changes to restore consistency
            setStorageData('courses', snapshot.courses)
            setStorageData('teachers', snapshot.teachers)
            setStorageData('users', snapshot.users)

            const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
            await addAuditLog('فشل حذف مدرس', `فشل حذف المدرس ${teacherToDelete.name}: ${errorMessage} - تم استعادة البيانات`)
            throw new Error(`فشل حذف المدرس: ${errorMessage}`)
        }
    },
}
