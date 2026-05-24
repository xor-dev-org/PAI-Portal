import { describe, it, expect } from 'vitest';
import authReducer, {
  login,
  logout,
  setUser,
  clearAuth,
  clearError,
} from '@/app/slices/authSlice';
import { User, UserRole } from '@/models';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.BUYER,
  department: 'Procurement',
  permissions: ['read', 'write'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const actual = authReducer(initialState, setUser(mockUser));
    expect(actual.user).toEqual(mockUser);
    expect(actual.isAuthenticated).toBe(true);
  });

  it('should handle clearAuth', () => {
    const stateWithUser = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const actual = authReducer(stateWithUser, clearAuth());
    expect(actual.user).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.error).toBeNull();
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
    };
    const actual = authReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });

  it('should handle login (dummy)', () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const actual = authReducer(initialState, login(credentials));
    expect(actual.user).toBeDefined();
    expect(actual.user?.email).toBe(credentials.email);
    expect(actual.user?.firstName).toBe('Demo');
    expect(actual.user?.lastName).toBe('User');
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.error).toBeNull();
  });

  it('should handle logout', () => {
    const stateWithUser = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const actual = authReducer(stateWithUser, logout());
    expect(actual.user).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.error).toBeNull();
  });
});
