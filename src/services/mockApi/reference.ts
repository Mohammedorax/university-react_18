import { Department, SEMESTERS, Specialization } from './types'
import { getStorageData, setStorageData, delay, generateTimestampId } from './utils'
import { initialDepartments, initialSpecializations } from './data'

export const referenceApi = {
    getDepartments: async () => {
        await delay(150)
        return getStorageData('departments', initialDepartments) as Department[]
    },

    createDepartment: async (payload: Omit<Department, 'id'>) => {
        await delay(200)
        const departments = getStorageData('departments', initialDepartments) as Department[]
        const department: Department = { id: generateTimestampId('dep'), ...payload }
        departments.push(department)
        setStorageData('departments', departments)
        return department
    },

    updateDepartment: async (id: string, payload: Partial<Department>) => {
        await delay(200)
        const departments = getStorageData('departments', initialDepartments) as Department[]
        const index = departments.findIndex((item) => item.id === id)
        if (index === -1) throw new Error('القسم غير موجود')
        departments[index] = { ...departments[index], ...payload }
        setStorageData('departments', departments)
        return departments[index]
    },

    deleteDepartment: async (id: string) => {
        await delay(200)
        const departments = getStorageData('departments', initialDepartments) as Department[]
        const next = departments.filter((item) => item.id !== id)
        setStorageData('departments', next)
        const specializations = getStorageData('specializations', initialSpecializations) as Specialization[]
        setStorageData('specializations', specializations.filter((item) => item.departmentId !== id))
        return id
    },

    getSpecializations: async () => {
        await delay(150)
        return getStorageData('specializations', initialSpecializations) as Specialization[]
    },

    createSpecialization: async (payload: Omit<Specialization, 'id'>) => {
        await delay(200)
        const specializations = getStorageData('specializations', initialSpecializations) as Specialization[]
        const specialization: Specialization = { id: generateTimestampId('sp'), ...payload }
        specializations.push(specialization)
        setStorageData('specializations', specializations)
        return specialization
    },

    updateSpecialization: async (id: string, payload: Partial<Specialization>) => {
        await delay(200)
        const specializations = getStorageData('specializations', initialSpecializations) as Specialization[]
        const index = specializations.findIndex((item) => item.id === id)
        if (index === -1) throw new Error('التخصص غير موجود')
        specializations[index] = { ...specializations[index], ...payload }
        setStorageData('specializations', specializations)
        return specializations[index]
    },

    deleteSpecialization: async (id: string) => {
        await delay(200)
        const specializations = getStorageData('specializations', initialSpecializations) as Specialization[]
        setStorageData('specializations', specializations.filter((item) => item.id !== id))
        return id
    },

    getSemesters: async () => {
        await delay(120)
        return [...SEMESTERS, 'تكميلي']
    },
}

