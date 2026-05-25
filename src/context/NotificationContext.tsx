import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, Message } from '../types';
import { LOCAL_STORAGE_KEYS, TOAST_DURATION } from '../constants';
import { storage } from '../lib/storage';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (userId: string, title: string, messageText: string, type: Notification['type']) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  showToast: (text: string, type?: Message['type']) => void;
  toast: Message | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return storage.get(LOCAL_STORAGE_KEYS.NOTIFICATIONS, []);
  });

  const [toast, setToast] = useState<Message | null>(null);

  // Sync to Storage
  useEffect(() => {
    storage.set(LOCAL_STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  const addNotification = useCallback((userId: string, title: string, messageText: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId,
      title,
      message: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const showToast = useCallback((text: string, type: Message['type'] = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    addNotification,
    setNotifications,
    showToast,
    toast,
    unreadCount,
    markAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
