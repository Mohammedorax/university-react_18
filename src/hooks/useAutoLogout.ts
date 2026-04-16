import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/slices/authSlice';
import { RootState } from '../store';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة بالمللي ثانية
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000; // تنبيه قبل 2 دقيقة

/**
 * Hook for managing automatic logout after a period of inactivity.
 * Displays a warning before logout and allows user to continue the session.
 *
 * @returns {Object} Object containing warning state, remaining time, and control functions
 */
export const useAutoLogout = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearAllTimeouts();
    dispatch(clearAuth());
    setShowWarning(false);
  }, [dispatch, clearAllTimeouts]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    clearAllTimeouts();
    setShowWarning(false);

    // تعيين وقت التنبيه
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(WARNING_BEFORE_LOGOUT / 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

    // تعيين وقت تسجيل الخروج النهائي
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, clearAllTimeouts, logout]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimeouts();
      setShowWarning(false);
      return;
    }

    resetTimer();

    // مراقبة أحداث نشاط المستخدم
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearAllTimeouts();
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer, clearAllTimeouts]);

  // تحديث الوقت المتبقي كل ثانية عند عرض التنبيه
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  return {
    showWarning,
    remainingTime,
    continueSession,
    logout
  };
};
