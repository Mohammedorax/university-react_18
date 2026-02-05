// Re-export from modular structure for backward compatibility
// All code has been moved to src/services/mockApi/

export { mockApi, studentApi, courseApi, gradeApi, teacherApi, staffApi, inventoryApi, financeApi, notificationApi, documentApi, authApi } from './mockApi/index'
export type { Notification, NotificationType, NotificationSubscriber, Discount, StudentDocument, Semester, StorageKeys } from './mockApi/index'
export { SEMESTERS, STORAGE_KEYS, getStorageData, setStorageData, delay, applySearch, applyPagination, calculateGradeLetter, generateId, generateTimestampId } from './mockApi/index'
export { initialDocuments, initialDiscounts, initialNotifications, initialInventoryCategories, initialUsers, initialSettings, initialStudents, initialTeachers, initialStaff, initialCourses, initialGrades, initialInventory } from './mockApi/index'
