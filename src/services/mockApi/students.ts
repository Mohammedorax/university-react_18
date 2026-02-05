import { Student } from '@/features/students/types'
import { initialStudents, initialUsers } from './data'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'

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
            id: 's' + (students.length + 1), 
            enrolled_courses: [] 
        }
        students.push(newStudent)
        setStorageData('students', students)
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
        
        return students[index]
    },

    deleteStudent: async (id: string) => {
        await delay(300)
        let students = getStorageData('students', initialStudents)
        students = students.filter(s => s.id !== id)
        setStorageData('students', students)

        const users = getStorageData('users', initialUsers)
        const newUsers = users.filter(u => u.id !== id)
        setStorageData('users', newUsers)
        
        return id
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
}
