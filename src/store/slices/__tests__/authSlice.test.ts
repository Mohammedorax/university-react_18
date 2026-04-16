import authReducer, { updateProfile, setAuthenticated, setAuthLoading, clearAuth } from '../authSlice';
import { User } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    university_id: '12345678',
    department: 'Computer Science'
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('updateProfile', () => {
    it('should update user profile when user exists', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const updates = { name: 'Updated Name', department: 'Updated Department' };
      const action = updateProfile(updates);
      const result = authReducer(stateWithUser, action);

      expect(result.user?.name).toBe('Updated Name');
      expect(result.user?.department).toBe('Updated Department');
      expect(result.user?.email).toBe(mockUser.email); // unchanged
    });

    it('should create user if no user exists but id is provided', () => {
      const updates = { id: '2', name: 'New User', email: 'new@example.com', role: 'teacher' as const };
      const action = updateProfile(updates);
      const result = authReducer(initialState, action);

      expect(result.user).toEqual(updates);
    });

    it('should not create user if no id provided', () => {
      const updates = { name: 'New User' };
      const action = updateProfile(updates);
      const result = authReducer(initialState, action);

      expect(result.user).toBeNull();
    });
  });

  describe('setAuthenticated', () => {
    it('should set user and authentication state', () => {
      const action = setAuthenticated({ user: mockUser });
      const result = authReducer(initialState, action);

      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('setAuthLoading', () => {
    it('should set loading state to true', () => {
      const action = setAuthLoading(true);
      const result = authReducer(initialState, action);

      expect(result.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const loadingState = { ...initialState, isLoading: false };
      const action = setAuthLoading(false);
      const result = authReducer(loadingState, action);

      expect(result.isLoading).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should reset to initial unauthenticated state', () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const action = clearAuth();
      const result = authReducer(authenticatedState, action);

      expect(result).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle updateProfile with empty object', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const action = updateProfile({});
      const result = authReducer(stateWithUser, action);

      expect(result.user).toEqual(mockUser); // unchanged
    });

    it('should handle updateProfile with partial user data', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      };

      const updates = { avatar: 'new-avatar.jpg' };
      const action = updateProfile(updates);
      const result = authReducer(stateWithUser, action);

      expect(result.user?.avatar).toBe('new-avatar.jpg');
      expect(result.user?.name).toBe(mockUser.name); // unchanged
    });
  });
});