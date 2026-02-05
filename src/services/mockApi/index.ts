// Mock API Service - Modular Architecture
// This module provides mock data for development and testing with local storage

export type { 
    Notification, 
    NotificationType, 
    NotificationSubscriber,
    Discount, 
    StudentDocument,
    Semester,
    StorageKeys
} from './types'

export { SEMESTERS, STORAGE_KEYS } from './types'

export {
    getStorageData,
    setStorageData,
    delay,
    applySearch,
    applyPagination,
    calculateGradeLetter,
    generateId,
    generateTimestampId,
} from './utils'

export {
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
import { authApi, setAuthAuditLogFunction } from './auth'
import { setAuditLogFunction } from './grades'

// Connect audit log functions
setAuditLogFunction(authApi.addAuditLog)
setAuthAuditLogFunction(authApi.addAuditLog)

// Combined mock API object for backward compatibility
export const mockApi = {
    // Audit Logs
    getAuditLogs: authApi.getAuditLogs,
    addAuditLog: authApi.addAuditLog,

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
    
    // Notifications
    getNotifications: notificationApi.getNotifications,
    markNotificationAsRead: notificationApi.markNotificationAsRead,
    markAllNotificationsAsRead: notificationApi.markAllNotificationsAsRead,
    deleteNotification: notificationApi.deleteNotification,
    clearAllNotifications: notificationApi.clearAllNotifications,
    addNotification: notificationApi.addNotification,
    subscribeToNotifications: notificationApi.subscribeToNotifications,
}

// Export individual API modules for selective imports
export {
    studentApi,
    courseApi,
    gradeApi,
    teacherApi,
    staffApi,
    inventoryApi,
    financeApi,
    notificationApi,
    documentApi,
    authApi,
}
