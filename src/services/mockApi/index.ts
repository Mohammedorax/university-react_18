/**
 * ⚠️ DEV-ONLY: Mock API Service - Modular Architecture
 * هذا الموديول يوفر بيانات وهمية للتطوير والاختبار فقط
 * يتم استبعاده بالكامل من بناء الإنتاج عبر tree-shaking
 * لا تستورد من هذا الملف مباشرة - استخدم @/services/api بدلاً من ذلك
 * @see src/services/api.ts
 */

export { addAuditLog, getAuditLogs } from './auditLog'
export { referenceApi } from './reference'

export type {
    Notification,
    NotificationType,
    NotificationSubscriber,
    Department,
    Specialization,
    Discount,
    StudentDocument,
    Semester,
    StorageKeys,
    User,
    Student,
    Teacher,
    Staff,
    Course,
    Grade,
    InventoryItem,
    SystemSettings,
} from './types'

import {
    SEMESTERS,
    STORAGE_KEYS
} from './types'

import {
    getStorageData,
    setStorageData,
    delay,
    applySearch,
    applyPagination,
    calculateGradeLetter,
    generateId,
    generateTimestampId,
} from './utils'

import {
    initialDocuments,
    initialDiscounts,
    initialNotifications,
    initialInventoryCategories,
    initialUsers,
    initialSettings,
    initialStudents,
    initialTeachers,
    initialStaff,
    initialCourses,
    initialGrades,
    initialInventory,
} from './data'

import { studentApi } from './students'
import { courseApi } from './courses'
import { gradeApi } from './grades'
import { teacherApi } from './teachers'
import { staffApi } from './staff'
import { inventoryApi } from './inventory'
import { financeApi } from './finance'
import { notificationApi } from './notifications'
import { documentApi } from './documents'
import { authApi } from './auth'
import { referenceApi } from './reference'
import { addAuditLog, getAuditLogs } from './auditLog'

// Combined mock API object for backward compatibility
export const mockApi = {
    // Audit Logs
    getAuditLogs,
    addAuditLog,

    // Authentication
    login: authApi.login,
    logout: authApi.logout,
    getMe: authApi.getMe,

    // Documents
    getDocuments: documentApi.getDocuments,
    uploadDocument: documentApi.uploadDocument,
    deleteDocument: documentApi.deleteDocument,

    // Students
    getStudents: studentApi.getStudents,
    getStudentById: studentApi.getStudentById,
    getGradeStatistics: gradeApi.getGradeStatistics,
    addStudent: studentApi.addStudent,
    updateStudent: studentApi.updateStudent,
    deleteStudent: studentApi.deleteStudent,
    assignDiscountToStudent: studentApi.assignDiscountToStudent,
    removeDiscountFromStudent: studentApi.removeDiscountFromStudent,
    getStudentStats: studentApi.getStudentStats,

    // Courses
    getCourses: courseApi.getCourses,
    getCourseById: courseApi.getCourseById,
    getEnrolledCourses: courseApi.getEnrolledCourses,
    addCourse: courseApi.addCourse,
    updateCourse: courseApi.updateCourse,
    deleteCourse: courseApi.deleteCourse,
    enrollInCourse: courseApi.enrollInCourse,
    unenrollFromCourse: courseApi.unenrollFromCourse,

    // Grades
    getAllGrades: gradeApi.getAllGrades,
    getStudentGrades: gradeApi.getStudentGrades,
    getCourseGrades: gradeApi.getCourseGrades,
    submitGrade: gradeApi.submitGrade,
    deleteGrade: gradeApi.deleteGrade,

    // Teachers
    getTeachers: teacherApi.getTeachers,
    getTeacherById: teacherApi.getTeacherById,
    addTeacher: teacherApi.addTeacher,
    updateTeacher: teacherApi.updateTeacher,
    deleteTeacher: teacherApi.deleteTeacher,

    // Staff
    getStaff: staffApi.getStaff,
    getStaffById: staffApi.getStaffById,
    addStaff: staffApi.addStaff,
    updateStaff: staffApi.updateStaff,
    deleteStaff: staffApi.deleteStaff,

    // Inventory
    getInventory: inventoryApi.getInventory,
    addInventoryItem: inventoryApi.addInventoryItem,
    updateInventoryItem: inventoryApi.updateInventoryItem,
    deleteInventoryItem: inventoryApi.deleteInventoryItem,
    getCategories: inventoryApi.getCategories,
    addCategory: inventoryApi.addCategory,
    deleteCategory: inventoryApi.deleteCategory,

    // Discounts & Scholarships
    getDiscounts: financeApi.getDiscounts,
    addDiscount: financeApi.addDiscount,
    updateDiscount: financeApi.updateDiscount,
    deleteDiscount: financeApi.deleteDiscount,

    // System Settings
    getSettings: authApi.getSettings,
    updateSettings: authApi.updateSettings,
    getDepartments: referenceApi.getDepartments,
    createDepartment: referenceApi.createDepartment,
    updateDepartment: referenceApi.updateDepartment,
    deleteDepartment: referenceApi.deleteDepartment,
    getSpecializations: referenceApi.getSpecializations,
    createSpecialization: referenceApi.createSpecialization,
    updateSpecialization: referenceApi.updateSpecialization,
    deleteSpecialization: referenceApi.deleteSpecialization,
    getSemesters: referenceApi.getSemesters,

    // Notifications
    getNotifications: notificationApi.getNotifications,
    markNotificationAsRead: notificationApi.markNotificationAsRead,
    markAllNotificationsAsRead: notificationApi.markAllNotificationsAsRead,
    deleteNotification: notificationApi.deleteNotification,
    clearAllNotifications: notificationApi.clearAllNotifications,
    addNotification: notificationApi.addNotification,
    subscribeToNotifications: notificationApi.subscribeToNotifications,
}

// End of file
