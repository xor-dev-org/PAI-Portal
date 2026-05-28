import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse, LoginRequest, SignupRequest } from '@/models';
import { authService } from '@/api/services/authService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getCurrentUser(),
  isAuthenticated: !!authService.getToken(),
  isLoading: false,
  error: null,
};

// Async thunks
export const msalLogin = createAsyncThunk(
  'auth/msalLogin',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.msalLogin(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const supplierLogin = createAsyncThunk(
  'auth/supplierLogin',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.supplierLogin(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const supplierSignup = createAsyncThunk(
  'auth/supplierSignup',
  async (data: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await authService.supplierSignup(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Signup failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // MSAL Login
    builder
      .addCase(msalLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(msalLogin.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(msalLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Supplier Login
    builder
      .addCase(supplierLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(supplierLogin.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(supplierLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Supplier Signup
    builder
      .addCase(supplierSignup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(supplierSignup.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(supplierSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
