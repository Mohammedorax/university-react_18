import { InventoryItem } from '@/features/inventory/types'
import { initialInventory, initialInventoryCategories } from './data'
import { getStorageData, setStorageData, delay } from './utils'

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
        return newItem
    },

    updateInventoryItem: async (id: string, data: Partial<InventoryItem>) => {
        await delay(500)
        const inventory = getStorageData('inventory', initialInventory)
        const index = inventory.findIndex(i => i.id === id)
        if (index === -1) throw new Error('العنصر غير موجود')
        
        inventory[index] = { ...inventory[index], ...data }
        setStorageData('inventory', inventory)
        return inventory[index]
    },

    deleteInventoryItem: async (id: string) => {
        await delay(500)
        const inventory = getStorageData('inventory', initialInventory)
        const newInventory = inventory.filter(i => i.id !== id)
        setStorageData('inventory', newInventory)
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
        return category
    },

    deleteCategory: async (category: string) => {
        await delay(300)
        let categories = getStorageData('categories', initialInventoryCategories)
        categories = categories.filter(c => c !== category)
        setStorageData('categories', categories)
        return category
    },
}
