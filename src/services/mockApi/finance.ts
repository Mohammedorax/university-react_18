import { Discount } from './types'
import { initialDiscounts, initialStudents } from './data'
import { getStorageData, setStorageData, delay } from './utils'

export const financeApi = {
    getDiscounts: async () => {
        await delay(300)
        return getStorageData('discounts', initialDiscounts)
    },

    addDiscount: async (discountData: Omit<Discount, 'id'>) => {
        await delay(400)
        const discounts = getStorageData('discounts', initialDiscounts)
        const newDiscount: Discount = { 
            ...discountData, 
            id: 'd' + (discounts.length + 1) + Date.now() 
        }
        discounts.push(newDiscount)
        setStorageData('discounts', discounts)
        return newDiscount
    },

    updateDiscount: async (id: string, data: Partial<Discount>) => {
        await delay(400)
        const discounts = getStorageData('discounts', initialDiscounts)
        const index = discounts.findIndex(d => d.id === id)
        if (index === -1) throw new Error('الخصم غير موجود')
        
        discounts[index] = { ...discounts[index], ...data }
        setStorageData('discounts', discounts)
        return discounts[index]
    },

    deleteDiscount: async (id: string) => {
        await delay(400)
        const discounts = getStorageData('discounts', initialDiscounts)
        const discountToDelete = discounts.find(d => d.id === id)
        if (!discountToDelete) throw new Error('الخصم غير موجود')

        const students = getStorageData('students', initialStudents)
        students.forEach(student => {
            if (student.assigned_discounts?.includes(id)) {
                student.assigned_discounts = student.assigned_discounts.filter(dId => dId !== id)
            }
        })
        setStorageData('students', students)

        const filteredDiscounts = discounts.filter(d => d.id !== id)
        setStorageData('discounts', filteredDiscounts)
        return id
    },
}
