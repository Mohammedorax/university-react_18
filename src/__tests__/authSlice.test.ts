import { describe, it, expect } from 'vitest'
import reducer, {
  updateProfile,
  setAuthenticated,
  setAuthLoading,
  clearAuth,
  User,
} from '../store/slices/authSlice'

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  }

  describe('updateProfile', () => {
    it('should update existing user profile', () => {
      const stateWithUser = {
        user: {
          id: '1',
          email: 'old@example.com',
          name: 'Old Name',
          role: 'student' as const,
        },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(stateWithUser, updateProfile({ name: 'New Name' }))
      expect(newState.user?.name).toBe('New Name')
      expect(newState.user?.email).toBe('old@example.com')
    })

    it('should merge multiple fields', () => {
      const stateWithUser = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          role: 'student' as const,
        },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(
        stateWithUser,
        updateProfile({ name: 'Updated', avatar: 'avatar.jpg' })
      )
      expect(newState.user?.name).toBe('Updated')
      expect(newState.user?.avatar).toBe('avatar.jpg')
      expect(newState.user?.email).toBe('test@example.com')
    })

    it('should create user if not exists but id is provided', () => {
      const newState = reducer(initialState, updateProfile({
        id: 'new-user',
        name: 'New User',
        email: 'new@example.com',
        role: 'student' as const,
      }))
      expect(newState.user).not.toBeNull()
      expect(newState.user?.id).toBe('new-user')
      expect(newState.user?.name).toBe('New User')
    })

    it('should do nothing if no user and no id provided', () => {
      const newState = reducer(initialState, updateProfile({ name: 'Name' }))
      expect(newState.user).toBeNull()
    })
  })

  describe('setAuthenticated', () => {
    it('should set user as authenticated', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
      }

      const newState = reducer(initialState, setAuthenticated({ user }))
      expect(newState.isAuthenticated).toBe(true)
      expect(newState.user).toEqual(user)
      expect(newState.isLoading).toBe(false)
    })

    it('should overwrite existing user', () => {
      const existingState = {
        user: { id: '1', email: 'old@example.com', name: 'Old', role: 'student' as const },
        isAuthenticated: true,
        isLoading: false,
      }

      const newUser: User = {
        id: '2',
        email: 'new@example.com',
        name: 'New',
        role: 'teacher',
      }

      const newState = reducer(existingState, setAuthenticated({ user: newUser }))
      expect(newState.user).toEqual(newUser)
      expect(newState.user?.role).toBe('teacher')
    })
  })

  describe('setAuthLoading', () => {
    it('should set loading to true', () => {
      const newState = reducer(initialState, setAuthLoading(true))
      expect(newState.isLoading).toBe(true)
    })

    it('should set loading to false', () => {
      const loadingState = { ...initialState, isLoading: true }
      const newState = reducer(loadingState, setAuthLoading(false))
      expect(newState.isLoading).toBe(false)
    })

    it('should toggle loading state', () => {
      let state = reducer(initialState, setAuthLoading(false))
      expect(state.isLoading).toBe(false)

      state = reducer(state, setAuthLoading(true))
      expect(state.isLoading).toBe(true)
    })
  })

  describe('clearAuth', () => {
    it('should clear all authentication data', () => {
      const authenticatedState = {
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'admin' as const },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(authenticatedState, clearAuth())
      expect(newState.user).toBeNull()
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.isLoading).toBe(false)
    })

    it('should reset to initial state', () => {
      const newState = reducer(initialState, clearAuth())
      expect(newState).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle updateProfile with empty object', () => {
      const stateWithUser = {
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' as const },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(stateWithUser, updateProfile({}))
      expect(newState.user).toEqual(stateWithUser.user)
    })

    it('should handle role changes', () => {
      const stateWithUser = {
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' as const },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(stateWithUser, updateProfile({ role: 'teacher' as any }))
      expect(newState.user?.role).toBe('teacher')
    })

    it('should handle all user roles', () => {
      const roles: Array<'student' | 'teacher' | 'admin' | 'staff'> = ['student', 'teacher', 'admin', 'staff']
      
      roles.forEach(role => {
        const user: User = { id: '1', email: 'test@example.com', name: 'Test', role }
        const newState = reducer(initialState, setAuthenticated({ user }))
        expect(newState.user?.role).toBe(role)
      })
    })

    it('should preserve undefined optional fields', () => {
      const stateWithUser = {
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'student' as const },
        isAuthenticated: true,
        isLoading: false,
      }

      const newState = reducer(stateWithUser, updateProfile({ name: 'Updated' }))
      expect(newState.user?.university_id).toBeUndefined()
      expect(newState.user?.avatar).toBeUndefined()
      expect(newState.user?.department).toBeUndefined()
    })
  })
})