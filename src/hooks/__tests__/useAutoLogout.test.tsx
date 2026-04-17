import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAutoLogout } from '../useAutoLogout';
import authReducer from '../../store/slices/authSlice';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.useFakeTimers();

const addListenerSpy = vi.spyOn(document, 'addEventListener')
const removeListenerSpy = vi.spyOn(document, 'removeEventListener')

describe('useAutoLogout', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    vi.clearAllTimers();
    addListenerSpy.mockClear()
    removeListenerSpy.mockClear()
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );

  describe('initial state', () => {
    it('should not show warning when not authenticated', () => {
      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      expect(result.current.showWarning).toBe(false);
      expect(result.current.remainingTime).toBe(0);
    });

    it('should show warning when authenticated', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      // Fast-forward to warning time (30 min - 2 min = 28 min)
      act(() => {
        vi.advanceTimersByTime(28 * 60 * 1000);
      });

      expect(result.current.showWarning).toBe(true);
      expect(result.current.remainingTime).toBe(120); // 2 minutes in seconds
    });
  });

  describe('timer behavior', () => {
    it('should logout after inactivity timeout', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      renderHook(() => useAutoLogout(), { wrapper });

      // Fast-forward to logout time
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
    });

    it('should reset timer on activity', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      renderHook(() => useAutoLogout(), { wrapper });

      act(() => {
        vi.advanceTimersByTime(15 * 60 * 1000);
      });

      // يعيد ضبط مؤقت الخمول (الموصول بـ document في useAutoLogout)
      act(() => {
        document.dispatchEvent(new Event('click', { bubbles: true }));
      });

      // بعد إعادة الضبط: 15 دقيقة لا تكفي لإنهاء 30 دقيقة خمول
      act(() => {
        vi.advanceTimersByTime(15 * 60 * 1000);
      });

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('continueSession', () => {
    it('should hide warning and reset timer', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      // Show warning
      act(() => {
        vi.advanceTimersByTime(28 * 60 * 1000);
      });

      expect(result.current.showWarning).toBe(true);

      // Continue session
      act(() => {
        result.current.continueSession();
      });

      expect(result.current.showWarning).toBe(false);
    });
  });

  describe('manual logout', () => {
    it('should logout immediately', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      act(() => {
        result.current.logout();
      });

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
    });
  });

  describe('remaining time countdown', () => {
    it('should countdown remaining time when warning is shown', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      // Show warning
      act(() => {
        vi.advanceTimersByTime(28 * 60 * 1000);
      });

      expect(result.current.remainingTime).toBe(120);

      // Advance 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current.remainingTime).toBe(90);
    });
  });

  describe('cleanup on unmount', () => {
    it('should remove event listeners on unmount', () => {
      store.dispatch({
        type: 'auth/setAuthenticated',
        payload: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      });

      const { unmount } = renderHook(() => useAutoLogout(), { wrapper });

      unmount();

      expect(addListenerSpy).toHaveBeenCalled();
      expect(removeListenerSpy).toHaveBeenCalled();
    });
  });

  describe('unauthenticated behavior', () => {
    it('should not set timers when user is not authenticated', () => {
      const { result } = renderHook(() => useAutoLogout(), { wrapper });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });

      expect(result.current.showWarning).toBe(false);
      expect(result.current.remainingTime).toBe(0);
    });
  });
});