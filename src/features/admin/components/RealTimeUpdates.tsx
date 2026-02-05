import React, { useState } from 'react';
import { Bell, Wifi, WifiOff, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface RealTimeUpdatesProps {
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * Real-Time Updates Component
 * تحديثات فورية عبر WebSocket
 */
export function RealTimeUpdates({ onNotificationClick }: RealTimeUpdatesProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const connectWebSocket = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        logger.info('WebSocket connected');

        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['notifications', 'updates', 'alerts']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error:', { type: error.type, target: error.target });
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        logger.info('WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      logger.error('Failed to create WebSocket:', error);
      return null;
    }
  };

  const handleIncomingMessage = (message: any) => {
    logger.debug('Received WebSocket message:', message);

    if (message.type === 'notification') {
      const notification: Notification = {
        id: message.id || `notif-${Date.now()}`,
        type: message.severity || 'info',
        title: message.title || 'إشعار جديد',
        message: message.message || '',
        timestamp: message.timestamp || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [notification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      if (notification.type === 'error') {
        logger.error('Received error notification:', { id: notification.id, title: notification.title, message: notification.message });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    logger.info(`Notification ${id} marked as read`);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
    logger.info('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (!notif?.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(notif => notif.id !== id);
    });
    logger.info(`Notification ${id} deleted`);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    logger.info('All notifications cleared');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeText = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return date.toLocaleString('ar-SA');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          التحديثات الفورية
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>

        <button
          onClick={() => connectWebSocket()}
          className={`p-2 rounded-lg transition-colors ${
            isConnected
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={isConnected ? 'متصل' : 'غير متصل'}
        >
          {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '● متصل' : '● غير متصل'}
          </span>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد إشعارات</p>
          <p className="text-sm mt-2">سيظهر هنا التحديثات الفورية</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                notification.read ? 'opacity-60' : getTypeColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold ${getTypeText(notification.type)}`}>
                      {notification.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                    {!notification.read && (
                      <span className="text-xs text-blue-600 font-medium">
                        جديد
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ملاحظة:</strong> للاتصال بخادم WebSocket، قم بتعيين متغير البيئة{' '}
          <code className="px-1 py-0.5 bg-blue-100 rounded">VITE_WS_URL</code>
        </p>
      </div>
    </div>
  );
}
