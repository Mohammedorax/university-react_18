import { InventoryItem } from '@/features/inventory/types'
import { getStorageData, setStorageData, delay } from './utils'
import { initialInventory, initialInventoryCategories } from './data'
import { addAuditLog } from './auditLog'

export const inventoryApi = {
    getInventory: async () => {
        await delay(300)
        return getStorageData('inventory', initialInventory)
    },

    addInventoryItem: async (itemData: Omit<InventoryItem, 'id'>) => {
        await delay(500)
        const inventory = getStorageData('inventory', initialInventory)
        const newItem: InventoryItem = {
            ...itemData,
            id: 'inv' + (inventory.length + 1) + Date.now()
        }
        inventory.push(newItem)
        setStorageData('inventory', inventory)

        // Audit Log
        await addAuditLog('إضافة صنف للمخزن', `تم إضافة ${newItem.name} إلى المخزن`)

        return newItem
    },

    updateInventoryItem: async (id: string, data: Partial<InventoryItem>) => {
        await delay(500)
        const inventory = getStorageData('inventory', initialInventory)
        const index = inventory.findIndex(i => i.id === id)
        if (index === -1) throw new Error('العنصر غير موجود')

        inventory[index] = { ...inventory[index], ...data }
        setStorageData('inventory', inventory)

        // Audit Log
        await addAuditLog('تحديث صنف في المخزن', `تم تحديث بيانات ${inventory[index].name}`)

        return inventory[index]
    },

    deleteInventoryItem: async (id: string) => {
        await delay(500)
        const inventory = getStorageData('inventory', initialInventory)
        const itemToDelete = inventory.find(i => i.id === id)
        if (!itemToDelete) throw new Error('العنصر غير موجود')

        const newInventory = inventory.filter(i => i.id !== id)
        setStorageData('inventory', newInventory)

        // Audit Log
        await addAuditLog('حذف صنف من المخزن', `تم حذف ${itemToDelete.name} من المخزن`)

        return id
    },

    getCategories: async () => {
        await delay(200)
        return getStorageData('categories', initialInventoryCategories)
    },

    addCategory: async (category: string) => {
        await delay(300)
        const categories = getStorageData('categories', initialInventoryCategories)
        if (categories.includes(category)) {
            throw new Error('التصنيف موجود بالفعل')
        }
        categories.push(category)
        setStorageData('categories', categories)

        // Audit Log
        await addAuditLog('إضافة تصنيف مخزون', `تم إضافة تصنيف جديد للمخزن: ${category}`)

        return category
    },

    deleteCategory: async (category: string) => {
        await delay(300)
        let categories = getStorageData('categories', initialInventoryCategories)
        categories = categories.filter(c => c !== category)
        setStorageData('categories', categories)

        // Cascading: Mark items in this category as 'غير مصنف'
        const inventory = JSON.parse(JSON.stringify(getStorageData('inventory', initialInventory)))
        inventory.forEach(item => {
            if (item.category === category) {
                item.category = 'غير مصنف'
            }
        })
        setStorageData('inventory', inventory)

        // Audit Log
        await addAuditLog('حذف تصنيف مخزون', `تم حذف تصنيف ${category} وتحديث العناصر المرتبطة به`)

        return category
    },
}
