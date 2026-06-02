import { useAppSelector, useAppDispatch } from '@/app/store';
import { logout, msalLogin, supplierLogin, supplierSignup, clearError } from '@/app/slices/authSlice';
import { LoginRequest, SignupRequest } from '@/models';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleMsalLogin = async (email: string) => {
    return dispatch(msalLogin(email));
  };

  const handleSupplierLogin = async (credentials: LoginRequest) => {
    return dispatch(supplierLogin(credentials));
  };

  const handleSupplierSignup = async (data: SignupRequest) => {
    return dispatch(supplierSignup(data));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    msalLogin: handleMsalLogin,
    supplierLogin: handleSupplierLogin,
    supplierSignup: handleSupplierSignup,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
