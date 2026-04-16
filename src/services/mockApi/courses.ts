import { Course } from '@/features/courses/types'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'
import { initialCourses, initialStudents } from './data'
import { authApi } from './auth'

export const courseApi = {
    getCourses: async (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
        await delay(300)
        let courses = getStorageData('courses', initialCourses)

        if (params?.query) {
            courses = applySearch(courses, params.query, ['name', 'code', 'department'])
        }

        if (params?.department && params.department !== 'all') {
            courses = courses.filter(c => c.department === params.department)
        }

        return applyPagination(courses, params?.page, params?.limit)
    },

    getCourseById: async (id: string) => {
        await delay(300)
        const courses = getStorageData('courses', initialCourses)
        const course = courses.find(c => c.id === id)
        if (!course) throw new Error('المقرر غير موجود')
        return course
    },

    getEnrolledCourses: async (studentId: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const student = students.find(s => s.id === studentId)
        if (!student) return []

        const courses = getStorageData('courses', initialCourses)
        return courses.filter(c => student.enrolled_courses.includes(c.id))
    },

    addCourse: async (courseData: Omit<Course, 'id' | 'enrolled_students'>) => {
        await delay(300)
        const courses = getStorageData('courses', initialCourses)
        const newCourse: Course = {
            ...courseData,
            id: 'c' + (courses.length + 1),
            enrolled_students: 0
        }
        courses.push(newCourse)
        setStorageData('courses', courses)

        // Audit Log
        await authApi.addAuditLog('إضافة مقرر', `تم إضافة المقرر ${newCourse.name} (${newCourse.code})`)

        return newCourse
    },

    updateCourse: async (id: string, data: Partial<Course>) => {
        await delay(300)
        const courses = getStorageData('courses', initialCourses)
        const index = courses.findIndex(c => c.id === id)
        if (index === -1) throw new Error('المقرر غير موجود')

        courses[index] = { ...courses[index], ...data }
        setStorageData('courses', courses)

        // Audit Log
        await authApi.addAuditLog('تحديث مقرر', `تم تحديث بيانات المقرر ${courses[index].name}`)

        return courses[index]
    },

    deleteCourse: async (id: string) => {
        await delay(300)
        let courses = getStorageData('courses', initialCourses)
        const courseToDelete = courses.find(c => c.id === id)
        if (!courseToDelete) throw new Error('المقرر غير موجود')

        courses = courses.filter(c => c.id !== id)
        setStorageData('courses', courses)

        // Cascading: Remove course from students' enrolled_courses
        const students = getStorageData('students', initialStudents)
        students.forEach(student => {
            student.enrolled_courses = student.enrolled_courses.filter(cId => cId !== id)
        })
        setStorageData('students', students)

        // Audit Log
        await authApi.addAuditLog('حذف مقرر', `تم حذف المقرر ${courseToDelete.name}`)

        return id
    },

    enrollInCourse: async (studentId: string, courseId: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const studentIndex = students.findIndex(s => s.id === studentId)
        if (studentIndex === -1) throw new Error('الطالب غير موجود')

        if (!students[studentIndex].enrolled_courses.includes(courseId)) {
            students[studentIndex].enrolled_courses.push(courseId)
            setStorageData('students', students)
        }

        const courses = getStorageData('courses', initialCourses)
        const courseIndex = courses.findIndex(c => c.id === courseId)
        if (courseIndex !== -1) {
            courses[courseIndex].enrolled_students += 1
            setStorageData('courses', courses)
            return courses[courseIndex]
        }

        return courses[courseIndex]
    },

    unenrollFromCourse: async (studentId: string, courseId: string) => {
        await delay(300)
        const students = getStorageData('students', initialStudents)
        const studentIndex = students.findIndex(s => s.id === studentId)
        if (studentIndex !== -1) {
            students[studentIndex].enrolled_courses = students[studentIndex].enrolled_courses.filter(id => id !== courseId)
            setStorageData('students', students)
        }

        const courses = getStorageData('courses', initialCourses)
        const courseIndex = courses.findIndex(c => c.id === courseId)
        if (courseIndex !== -1) {
            courses[courseIndex].enrolled_students = Math.max(0, courses[courseIndex].enrolled_students - 1)
            setStorageData('courses', courses)
            return courses[courseIndex]
        }

        throw new Error('المقرر غير موجود')
    },
}
