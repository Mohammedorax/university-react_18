import { User } from '@/store/slices/authSlice'
import { Student } from '@/features/students/types'
import { Teacher } from '@/features/teachers/types'
import { Staff } from '@/features/staff/types'
import { Course } from '@/features/courses/types'
import { Grade } from '@/features/grades/types'
import { InventoryItem } from '@/features/inventory/types'
import { SystemSettings } from '@/features/settings/types'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    read: boolean
    createdAt: string
    link?: string
}

export type NotificationSubscriber = (notification: Notification) => void;

export interface Discount {
    id: string
    name: string
    type: 'percentage' | 'fixed_amount'
    value: number
    description: string
    active: boolean
}

export interface StudentDocument {
    id: string
    entityId: string
    entityType: 'student' | 'teacher' | 'course' | 'staff'
    name: string
    type: string
    size: number
    uploadDate: string
    url: string
}

export const SEMESTERS = ['الفصل الأول', 'الفصل الثاني', 'الفصل الصيفي'] as const;
export type Semester = typeof SEMESTERS[number];

export interface StorageKeys {
    documents: string
    discounts: string
    notifications: string
    categories: string
    users: string
    settings: string
    students: string
    teachers: string
    staff: string
    courses: string
    grades: string
    inventory: string
    audit_logs: string
    auth_user: string
}

export const STORAGE_KEYS: StorageKeys = {
    documents: 'documents',
    discounts: 'discounts',
    notifications: 'notifications',
    categories: 'categories',
    users: 'users',
    settings: 'settings',
    students: 'students',
    teachers: 'teachers',
    staff: 'staff',
    courses: 'courses',
    grades: 'grades',
    inventory: 'inventory',
    audit_logs: 'audit_logs',
    auth_user: 'auth_user',
};

export type {
    User,
    Student,
    Teacher,
    Staff,
    Course,
    Grade,
    InventoryItem,
    SystemSettings,
}
