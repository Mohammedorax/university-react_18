import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { clearAuth } from '../store/slices/authSlice'
import { useAutoLogout } from '../hooks/useAutoLogout'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: preloadedState,
    },
  })
}

const wrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useAutoLogout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return initial state when not authenticated', () => {
    const store = createTestStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    const { result } = renderHook(() => useAutoLogout(), {
      wrapper: wrapper(store),
    })

    expect(result.current.showWarning).toBe(false)
    expect(result.current.remainingTime).toBe(0)
  })

  it('should set up timers when authenticated', () => {
    const store = createTestStore({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      isAuthenticated: true,
      isLoading: false,
    })

    const { result } = renderHook(() => useAutoLogout(), {
      wrapper: wrapper(store),
    })

    expect(result.current.showWarning).toBe(false)
    expect(document.addEventListener).toHaveBeenCalled()
  })

  it('should show warning before logout', () => {
    const store = createTestStore({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      isAuthenticated: true,
      isLoading: false,
    })

    const { result } = renderHook(() => useAutoLogout(), {
      wrapper: wrapper(store),
    })

    expect(result.current.showWarning).toBe(false)

    act(() => {
      vi.advanceTimersByTime(28 * 60 * 1000)
    })

    expect(result.current.showWarning).toBe(true)
  })

  it('should trigger logout after inactivity timeout', () => {
    const store = createTestStore({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      isAuthenticated: true,
      isLoading: false,
    })

    const { result } = renderHook(() => useAutoLogout(), {
      wrapper: wrapper(store),
    })

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(result.current.showWarning).toBe(false)
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })

  it('should clear timers when user becomes unauthenticated', () => {
    const store = createTestStore({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
      isAuthenticated: true,
      isLoading: false,
    })

    const { rerender } = renderHook(() => useAutoLogout(), {
      wrapper: wrapper(store),
    })

    act(() => {
      store.dispatch(clearAuth())
    })

    rerender()

    expect(document.removeEventListener).toHaveBeenCalled()
  })

  describe('continueSession', () => {
    it('should reset timer when continueSession is called', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      const { result } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      act(() => {
        vi.advanceTimersByTime(28 * 60 * 1000)
      })

      expect(result.current.showWarning).toBe(true)

      act(() => {
        result.current.continueSession()
      })

      expect(result.current.showWarning).toBe(false)
    })
  })

  describe('logout function', () => {
    it('should manually logout user', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      const { result } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      act(() => {
        result.current.logout()
      })

      expect(store.getState().auth.isAuthenticated).toBe(false)
      expect(store.getState().auth.user).toBeNull()
    })
  })

  describe('activity events', () => {
    it('should add event listeners for user activity', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      const expectedEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
      expectedEvents.forEach(event => {
        expect(document.addEventListener).toHaveBeenCalledWith(
          event,
          expect.any(Function),
          { passive: true }
        )
      })
    })

    it('should reset timer on user activity', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      const { result } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000)
      })

      const listeners = (document.addEventListener as ReturnType<typeof vi.spyOn>).mock.calls
      const mousemoveListener = listeners.find(call => call[0] === 'mousemove')?.[1]

      if (mousemoveListener) {
        act(() => {
          (mousemoveListener as () => void)()
        })
      }

      act(() => {
        vi.advanceTimersByTime(20 * 60 * 1000)
      })

      expect(result.current.showWarning).toBe(false)
    })
  })

  describe('remaining time', () => {
    it('should countdown remaining time when warning is shown', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      const { result } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      act(() => {
        vi.advanceTimersByTime(28 * 60 * 1000)
      })

      expect(result.current.showWarning).toBe(true)
      expect(result.current.remainingTime).toBe(120)

      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000)
      })

      expect(result.current.remainingTime).toBe(60)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid authentication changes', () => {
      const store = createTestStore({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      const { rerender } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      act(() => {
        store.dispatch({ type: 'auth/setAuthenticated', payload: { user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' } } })
      })

      rerender()

      act(() => {
        store.dispatch(clearAuth())
      })

      rerender()
    })

    it('should handle cleanup on unmount', () => {
      const store = createTestStore({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
        isLoading: false,
      })

      const { unmount } = renderHook(() => useAutoLogout(), {
        wrapper: wrapper(store),
      })

      unmount()

      expect(document.removeEventListener).toHaveBeenCalled()
    })
  })
})