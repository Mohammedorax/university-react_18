import { Teacher } from '@/features/teachers/types'
import { initialTeachers, initialUsers } from './data'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'

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
            password: '123456',
            name: newTeacher.name,
            role: 'teacher',
            department: newTeacher.department
        })
        setStorageData('users', users)
        
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
        
        return teachers[index]
    },

    deleteTeacher: async (id: string) => {
        await delay(500)
        const teachers = getStorageData('teachers', initialTeachers)
        const newTeachers = teachers.filter(t => t.id !== id)
        setStorageData('teachers', newTeachers)
        
        const users = getStorageData('users', initialUsers)
        const newUsers = users.filter(u => u.id !== id)
        setStorageData('users', newUsers)
        
        return id
    },
}
