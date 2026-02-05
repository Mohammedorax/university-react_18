import { SystemSettings } from '@/features/settings/types'
import { initialSettings, initialUsers } from './data'
import { getStorageData, setStorageData, delay } from './utils'
import type { User } from '@/store/slices/authSlice'

let addAuditLog: (action: string, details: string) => Promise<any>

export const setAuthAuditLogFunction = (fn: (action: string, details: string) => Promise<any>) => {
    addAuditLog = fn
}

export const authApi = {
    login: async (email: string, password: string) => {
        await delay(500)

        const users = getStorageData('users', initialUsers)
        const user = users.find((u) => u.email === email && u.password === password)

        if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        }

        const { password: _, ...userWithoutPassword } = user
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
        if (addAuditLog) {
            await addAuditLog('Login', `User ${user.email} logged in`);
        }
        
        return {
            user: userWithoutPassword as User,
            token: 'mock-jwt-token-' + user.id,
        }
    },

    logout: async () => {
        await delay(200)
        return true
    },

    getMe: async (token: string) => {
        await delay(300)
        const id = token.replace('mock-jwt-token-', '')
        const users = getStorageData('users', initialUsers)
        const user = users.find((u) => u.id === id)

        if (!user) throw new Error('المستخدم غير موجود')

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword as User
    },

    getSettings: async () => {
        await delay(300)
        return getStorageData('settings', initialSettings)
    },

    updateSettings: async (settings: Partial<SystemSettings>) => {
        await delay(300)
        const currentSettings = getStorageData('settings', initialSettings)
        const updatedSettings = { ...currentSettings, ...settings }
        setStorageData('settings', updatedSettings)
        return updatedSettings
    },

    getAuditLogs: async () => {
        await delay(300)
        return getStorageData('audit_logs', []);
    },

    addAuditLog: async (action: string, details: string) => {
        const logs = getStorageData<any[]>('audit_logs', [])
        const newLog = {
            id: Date.now().toString(),
            action,
            details,
            timestamp: new Date().toISOString(),
            userId: JSON.parse(localStorage.getItem('auth_user') || '{}').id || 'system'
        }
        logs.unshift(newLog)
        setStorageData('audit_logs', logs.slice(0, 100))
        return newLog
    },
}
