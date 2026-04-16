import { Staff } from '@/features/staff/types'
import { getStorageData, setStorageData, delay, applySearch, applyPagination } from './utils'
import { initialStaff, initialUsers } from './data'
import { addAuditLog } from './auditLog'

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
            password: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // SHA-256 hash of '123456'
            name: newStaff.name,
            role: 'staff',
            department: newStaff.department
        })
        setStorageData('users', users)

        // Audit Log
        await addAuditLog('إضافة موظف', `تم إضافة الموظف ${newStaff.name} في قسم ${newStaff.department}`)

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

        // Audit Log
        await addAuditLog('تحديث موظف', `تم تحديث بيانات الموظف ${staff[index].name}`)

        return staff[index]
    },

    deleteStaff: async (id: string) => {
        await delay(500)
        const staff = getStorageData('staff', initialStaff)
        const staffToDelete = staff.find(s => s.id === id)
        if (!staffToDelete) throw new Error('الموظف غير موجود')

        const newStaff = staff.filter(s => s.id !== id)
        setStorageData('staff', newStaff)

        const users = getStorageData('users', initialUsers)
        const newUsers = users.filter(u => u.id !== id)
        setStorageData('users', newUsers)

        // Audit Log
        await addAuditLog('حذف موظف', `تم حذف الموظف ${staffToDelete.name}`)

        return id
    },
}
