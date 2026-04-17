import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Interface representing a user in the system.
 * Contains all user-related information including authentication details and profile data.
 */
export interface User {
  /** Unique identifier for the user */
  id: string
  /** User's email address */
  email: string
  /** User's full name */
  name: string
  /** User's role in the system */
  role: 'student' | 'teacher' | 'admin' | 'staff'
  /** Optional URL to user's avatar image */
  avatar?: string
  /** Optional university ID for students/staff */
  university_id?: string
  /** Optional department name */
  department?: string
}

/**
 * Interface representing the authentication state in the Redux store.
 * Tracks user authentication status, user data, and loading states.
 */
interface AuthState {
  /** Current authenticated user data, null if not authenticated */
  user: User | null
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean
  /** Whether authentication state is currently being loaded */
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
}

/**
 * Redux slice for managing authentication state.
 * Handles user authentication, profile updates, and loading states.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Updates the current user's profile information.
     * Merges partial user data with existing user data.
     *
     * @param state - Current authentication state
     * @param action - Action containing partial user data to update
     */
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      } else if (action.payload.id) {
          state.user = action.payload as User
      }
    },
    /**
     * Sets the user as authenticated with provided user data.
     * Updates authentication status and stops loading state.
     *
     * @param state - Current authentication state
     * @param action - Action containing user data
     */
    setAuthenticated: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
    },
    /**
     * Updates the authentication loading state.
     *
     * @param state - Current authentication state
     * @param action - Action containing loading boolean
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    /**
     * Clears all authentication data and resets to unauthenticated state.
     *
     * @param state - Current authentication state
     */
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
  },
})

export const { updateProfile, setAuthenticated, setAuthLoading, clearAuth } = authSlice.actions
export default authSlice.reducer