
// contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  requestForToken, 
  removeTokenFromFirestore, 
  setupForegroundMessageListener 
} from '../firebase';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check if FCM is supported
    if ('serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window) {
      setIsSupported(true);
      
      // Setup foreground message listener
      setupForegroundMessageListener(handleForegroundMessage);
    }
  }, []);

  useEffect(() => {
    // Auto-request token if user is logged in and notifications were previously enabled
    if (user && isSupported) {
      const savedNotificationPreference = localStorage.getItem(`notifications_${user.uid}`);
      if (savedNotificationPreference === 'enabled') {
        enableNotifications();
      }
    }
  }, [user, isSupported]);

  const handleForegroundMessage = (payload) => {
    const notification = {
      id: Date.now(),
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 latest
  };

  const enableNotifications = async () => {
    if (!user || !isSupported) {
      setError('Notifications not supported or user not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await requestForToken(user.uid);
      
      if (token) {
        setFcmToken(token);
        localStorage.setItem(`notifications_${user.uid}`, 'enabled');
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Failed to get FCM token');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  const disableNotifications = async () => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      await removeTokenFromFirestore(user.uid);
      setFcmToken(null);
      localStorage.removeItem(`notifications_${user.uid}`);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    fcmToken,
    isSupported,
    isLoading,
    error,
    notifications,
    isEnabled: !!fcmToken,
    unreadCount: notifications.filter(n => !n.read).length,
    enableNotifications,
    disableNotifications,
    markNotificationAsRead,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};