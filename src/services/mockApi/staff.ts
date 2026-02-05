import { Staff } from '@/features/staff/types'
import { initialStaff, initialUsers } from './data'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'

export const staffApi = {
    getStaff: async (params?: { query?: string, department?: string, page?: number, limit?: number }) => {
        await delay(300)
        let staff = getStorageData('staff', initialStaff)

        if (params?.query) {
            staff = applySearch(staff, params.query, ['name', 'email', 'department', 'job_title'])
        }

        if (params?.department && params.department !== 'all') {
            staff = staff.filter(s => s.department === params.department)
        }
        
        return applyPagination(staff, params?.page, params?.limit)
    },

    getStaffById: async (id: string) => {
        await delay(300)
        const staff = getStorageData('staff', initialStaff)
        const member = staff.find(s => s.id === id)
        if (!member) throw new Error('الموظف غير موجود')
        return member
    },

    addStaff: async (staffData: Omit<Staff, 'id'>) => {
        await delay(500)
        const staff = getStorageData('staff', initialStaff)
        
        if (staff.some(s => s.email === staffData.email)) {
            throw new Error('البريد الإلكتروني مستخدم بالفعل')
        }

        const newStaff: Staff = {
            ...staffData,
            id: 'st' + (staff.length + 1) + Date.now(),
        }
        
        staff.push(newStaff)
        setStorageData('staff', staff)
        
        const users = getStorageData('users', initialUsers)
        users.push({
            id: newStaff.id,
            email: newStaff.email,
            password: '123456',
            name: newStaff.name,
            role: 'staff',
            department: newStaff.department
        })
        setStorageData('users', users)
        
        return newStaff
    },

    updateStaff: async (id: string, data: Partial<Staff>) => {
        await delay(500)
        const staff = getStorageData('staff', initialStaff)
        const index = staff.findIndex(s => s.id === id)
        
        if (index === -1) throw new Error('الموظف غير موجود')
        
        staff[index] = { ...staff[index], ...data }
        setStorageData('staff', staff)

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
        
        return staff[index]
    },

    deleteStaff: async (id: string) => {
        await delay(500)
        const staff = getStorageData('staff', initialStaff)
        const newStaff = staff.filter(s => s.id !== id)
        setStorageData('staff', newStaff)
        
        const users = getStorageData('users', initialUsers)
        const newUsers = users.filter(u => u.id !== id)
        setStorageData('users', newUsers)
        
        return id
    },
}
