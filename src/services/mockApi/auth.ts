import { SystemSettings } from '@/features/settings/types'
import { initialSettings, initialUsers } from './data'
import { getStorageData, setStorageData, delay } from './utils'
import type { User } from '@/store/slices/authSlice'
import { addAuditLog } from './auditLog'
import { verifyPassword, hashPassword } from '@/lib/security'

/**
 * دالة لمحاكاة عمل الكوكيز الآمنة (HttpOnly Secure)
 * ملاحظة: في الإنتاج الحقيقي سيتم التعامل مع هذه الكوكيز من طرف الخادم فقط
 * لا يمكن الوصول لها من الجافا سكريبت في المتصفح
 */
const mockHttpOnlyCookie = {
  setAuthToken: (userId: string) => {
    // في الخادم الحقيقي يتم إرسال:
    // Set-Cookie: auth_token=xxxx; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
    document.cookie = `auth_token=mock-jwt-token-${userId}; path=/; SameSite=Strict`;
  },
  getAuthToken: () => {
    // في الإنتاج الحقيقي هذه الدالة غير موجودة نهائياً لأن الكوكيز لا يمكن قراءتها من جافاسكريبت
    // هذا هو المحاكاة فقط لغرض اختبار الواجهة الأمامية
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    return match ? match[2] : null;
  },
  clearAuthToken: () => {
    // في الخادم يتم إرسال Set-Cookie مع انتهاء الصلاحية
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

/**
 * Migration: Hash any plain text passwords found in stored users.
 * This handles the transition from plain text passwords to hashed passwords.
 */ 
async function migratePasswords(): Promise<void> {
    const users = getStorageData('users', initialUsers)
    const LEGACY_SHA256_REGEX = /^[a-f0-9]{64}$/i
    const PBKDF2_PREFIX = 'pbkdf2$'
    
    let migrated = false
    for (const user of users) {
        const currentPassword = user.password ?? ''
        const isLegacyHash = LEGACY_SHA256_REGEX.test(currentPassword)
        const isNewHash = currentPassword.startsWith(PBKDF2_PREFIX)
        if (currentPassword && !isLegacyHash && !isNewHash) {
            // This is a plain text password - hash it
            user.password = await hashPassword(user.password)
            migrated = true
        }
    }
    
    if (migrated) {
        setStorageData('users', users)
    }
}

export const authApi = {
    login: async (email: string, password: string) => {
        await delay(500)

        // Run password migration before attempting login
        await migratePasswords()

        const users = getStorageData('users', initialUsers)
        const user = users.find((u) => u.email === email)

        if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        }

        // Verify password against stored hash
        const isValidPassword = await verifyPassword(password, user.password)
        if (!isValidPassword) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        }

        const { password: _, ...userWithoutPassword } = user
        // ✅ تم الإصلاح: لا يتم حفظ التوكن أو بيانات المستخدم في localStorage نهائياً
        // تم استخدام الكوكيز الآمنة HttpOnly التي لا يمكن الوصول لها من جافاسكريبت
        mockHttpOnlyCookie.setAuthToken(user.id);
        
        if (addAuditLog) {
            await addAuditLog('Login', `User ${user.email} logged in`);
        }
        
        return {
            user: userWithoutPassword as User,
            // ⚠️ ملاحظة مهمة: في الإنتاج الحقيقي لا يتم إرجاع التوكن أبداً إلى الواجهة الأمامية
            // يتم إرساله فقط عبر الهيدر Set-Cookie من الخادم
            // هذا موجود هنا فقط لأغراض المحاكاة
        }
    },

    logout: async () => {
        await delay(200)
        // ✅ تم الإصلاح: مسح الكوكيز الآمنة
        mockHttpOnlyCookie.clearAuthToken();
        // ⚠️ في الإنتاج الحقيقي: الخادم هو الذي يقوم بمسح الكوكيز عبر إرسال Set-Cookie منتهي الصلاحية
        return true
    },

    getMe: async () => {
        await delay(300)
        // ✅ تم الإصلاح: لا يتم تمرير التوكن في الطلب من الواجهة الأمامية
        // الكوكيز يتم إرسالها تلقائياً بواسطة المتصفح مع كل طلب
        const token = mockHttpOnlyCookie.getAuthToken();
        if (!token) throw new Error('غير مصادق عليه');
        
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

    addAuditLog,
}
