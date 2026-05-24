import { useAppSelector, useAppDispatch } from '@/app/store';
import { login, logout, clearAuth, clearError } from '@/app/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearAuthentication = () => {
    dispatch(clearAuth());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: clearAuthError,
    clearAuth: clearAuthentication,
  };
};
