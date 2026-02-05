/**
 * @file storage.ts
 * @description IndexedDB storage - بدلاً من localStorage (أسرع وغير متزامن)
 * @ts-nocheck
 */

const DB_NAME = 'UniversityDB';
const DB_VERSION = 1;

/**
 * أنواع البيانات في IndexedDB
 */
export enum StoreName {
  AUTH = 'auth',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  COURSES = 'courses',
  GRADES = 'grades',
  INVENTORY = 'inventory',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',
  STAFF = 'staff',
}

/**
 * ثوابت أسماء Stores
 */
export const STORE_NAMES = Object.values(StoreName);

/**
 * فتح قاعدة البيانات
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (errorEvent: Event) => {
      reject(new Error('فشل فتح قاعدة البيانات'));
    };

    request.onsuccess = (event: Event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      // @ts-expect-error - event.target.result is typed as EventTarget but we know it's IDBOpenDBRequest
      const db = event.target.result as IDBDatabase;

      // إنشاء ObjectStores
      if (!db.objectStoreNames.contains(StoreName.AUTH)) {
        db.createObjectStore(StoreName.AUTH, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.STUDENTS)) {
        db.createObjectStore(StoreName.STUDENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.TEACHERS)) {
        db.createObjectStore(StoreName.TEACHERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.COURSES)) {
        db.createObjectStore(StoreName.COURSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.GRADES)) {
        db.createObjectStore(StoreName.GRADES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.INVENTORY)) {
        db.createObjectStore(StoreName.INVENTORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.NOTIFICATIONS)) {
        db.createObjectStore(StoreName.NOTIFICATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(StoreName.SETTINGS)) {
        db.createObjectStore(StoreName.SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(StoreName.STAFF)) {
        db.createObjectStore(StoreName.STAFF, { keyPath: 'id' });
      }
    };
  });
}

/**
 * الحصول على Store
 */
function getStore(storeName: StoreName): Promise<IDBObjectStore> {
  return openDB()
    .then((db: IDBDatabase) => {
      const transaction = db.transaction(storeName, 'readwrite');
      return transaction.objectStore(storeName);
    });
}

/**
 * قراءة بيانات
 */
export async function getStoreData<T>(storeName: StoreName, key?: string): Promise<T | undefined> {
  const store = await getStore(storeName);
  
  if (key) {
    return new Promise<T | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return new Promise<T | undefined>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

/**
 * حفظ بيانات
 */
export async function setStoreData<T>(storeName: StoreName, data: T, key?: string): Promise<void> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = key ? store.put(data, key) : store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * إضافة عنصر
 */
export async function addStoreItem<T>(storeName: StoreName, item: T): Promise<void> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * تحديث عنصر
 */
export async function updateStoreItem<T>(storeName: StoreName, item: T & { id: string | number }): Promise<void> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * حذف عنصر
 */
export async function deleteStoreItem(storeName: StoreName, key: string | number): Promise<void> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * حذف جميع البيانات من Store
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * مسح قاعدة البيانات بالكامل
 */
export async function clearDatabase(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * الحصول على جميع العناصر
 */
export async function getAllStoreItems<T>(storeName: StoreName): Promise<T[]> {
  const store = await getStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * البحث في Store
 */
export async function searchStore<T>(
  storeName: StoreName,
  searchTerm: string,
  searchFields: (keyof T)[]
): Promise<T[]> {
  const allItems = await getAllStoreItems<T>(storeName);
  
  const term = searchTerm.toLowerCase();
  
  return allItems.filter(item => {
    return searchFields.some(field => {
      const value = String(item[field]);
      return value.toLowerCase().includes(term);
    });
  });
}

/**
 * التحقق من دعم IndexedDB
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window;
}
