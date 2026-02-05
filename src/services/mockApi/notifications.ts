import { Notification, NotificationSubscriber } from './types'
import { initialNotifications } from './data'
import { getStorageData, setStorageData, delay } from './utils'

const notificationSubscribers: Set<NotificationSubscriber> = new Set();

export const notificationApi = {
    getNotifications: async () => {
        await delay(300)
        return getStorageData('notifications', initialNotifications)
    },

    markNotificationAsRead: async (id: string) => {
        await delay(200)
        const notifications = getStorageData('notifications', initialNotifications)
        const index = notifications.findIndex(n => n.id === id)
        if (index !== -1) {
            notifications[index].read = true
            setStorageData('notifications', notifications)
        }
        return id
    },

    markAllNotificationsAsRead: async () => {
        await delay(200)
        const notifications = getStorageData('notifications', initialNotifications)
        notifications.forEach(n => n.read = true)
        setStorageData('notifications', notifications)
        return true
    },

    deleteNotification: async (id: string) => {
        await delay(200)
        let notifications = getStorageData('notifications', initialNotifications)
        notifications = notifications.filter(n => n.id !== id)
        setStorageData('notifications', notifications)
        return id
    },

    clearAllNotifications: async () => {
        await delay(200)
        setStorageData('notifications', [])
        return true
    },

    addNotification: async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        await delay(200)
        const notifications = getStorageData('notifications', initialNotifications)
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            read: false,
            createdAt: new Date().toISOString()
        }
        notifications.unshift(newNotification)
        setStorageData('notifications', notifications)
        
        notificationSubscribers.forEach(subscriber => subscriber(newNotification))
        
        return newNotification
    },

    subscribeToNotifications: (callback: NotificationSubscriber) => {
        notificationSubscribers.add(callback)
        return () => {
            notificationSubscribers.delete(callback)
        }
    }
}
