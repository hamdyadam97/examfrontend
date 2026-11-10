import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { api, hasSession, SESSION_FLAG } from '@/lib/api';

interface UserData {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  mobile_number?: string;
  dial_code?: string;
  mobile_country_code?: string;
  specialization?: string;
  governorate?: string;
  birth_date?: string;
  image?: string;
  categories?: unknown[];
  sub_categories?: unknown[];
  sub_sub_categories?: unknown[];
  active_subscriptions_count?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthState {
  authenticated: boolean;
  user: UserData;
  loading: boolean;
  isForget: boolean;
  isSendOtp: boolean;
}

// One-time ticket from /forget-verify-otp that /reset requires. Kept for this tab only.
const RESET_TOKEN_KEY = 'reset_token';
const readResetToken = () => {
  try {
    return sessionStorage.getItem(RESET_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};
const writeResetToken = (token: string | null) => {
  try {
    if (token) sessionStorage.setItem(RESET_TOKEN_KEY, token);
    else sessionStorage.removeItem(RESET_TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode); the reset page will ask for a new code.
  }
};

/** The phone waiting for an OTP: the backend returns it as `phone`. */
const pendingPhone = (state: AuthState) =>
  String(state.user?.phone || state.user?.mobile || Cookies.get('otp_mobile') || '');

const initialState: AuthState = {
  authenticated: hasSession(),
  user: {},
  loading: false,
  isForget: Cookies.get('is_forget') === 'true',
  isSendOtp: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiError = (error: any) => error?.response?.data ?? { message: 'Network Error' };

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { mobile_number: string; dial_code: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', payload);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post('/signup', payload);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ otp, isForget }: { otp: string; isForget: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const endpoint = isForget ? '/forget-verify-otp' : '/verify-otp';
      const response = await api.post(endpoint, { phone: pendingPhone(state.auth), otp });
      return { ...response.data?.data, isForget };
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const forgetPassword = createAsyncThunk(
  'auth/forgetPassword',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await api.post('/forget', payload);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: { password: string; password_confirmation: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const response = await api.post('/reset', {
        ...payload,
        phone: pendingPhone(state.auth),
        reset_token: readResetToken(),
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const getProfileData = createAsyncThunk(
  'auth/getProfileData',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await api.get('/get-user-info');
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (form: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const config = form instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.post('/update-user-info', form, config);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (form: Record<string, unknown>, { rejectWithValue }) => {
    try {
      await api.post('/update-user-password', form);
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { mobile?: string } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const response = await api.post('/resend-otp', { phone: payload.mobile || pendingPhone(state.auth) });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await api.post('/logout');
  } catch {
    // ignore
  }
  // The server clears the session cookies; the flag is removed here too in case the call failed.
  Cookies.remove(SESSION_FLAG, { path: '/' });
  Cookies.remove('user', { path: '/' });
  Cookies.remove('is_forget', { path: '/' });
  Cookies.remove('otp_mobile', { path: '/' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<{ user?: UserData }>) {
      state.user = { ...state.user, ...(action.payload.user || {}) };
    },
    clearAuth(state) {
      state.authenticated = false;
      state.user = {};
      state.isForget = false;
      state.isSendOtp = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload?.authenticated) state.authenticated = true;
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(register.fulfilled, (state, action) => {
        const phone = action.payload?.user?.phone;
        if (phone) {
          Cookies.set('otp_mobile', String(phone), { sameSite: 'lax', path: '/' });
          state.user = { ...state.user, ...action.payload.user };
        }
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        Cookies.set('is_forget', 'true', { sameSite: 'lax', path: '/' });
        state.isForget = true;
        state.isSendOtp = true;
        writeResetToken(null);
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
        const phone = action.payload?.user?.phone;
        if (phone) Cookies.set('otp_mobile', String(phone), { sameSite: 'lax', path: '/' });
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        if (action.payload?.reset_token) writeResetToken(action.payload.reset_token);
        if (action.payload?.authenticated) {
          state.authenticated = true;
          state.isForget = false;
          Cookies.remove('otp_mobile', { path: '/' });
          Cookies.remove('is_forget', { path: '/' });
        } else {
          state.isSendOtp = false;
        }
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        writeResetToken(null);
        if (action.payload?.authenticated) {
          state.authenticated = true;
          state.isForget = false;
          state.isSendOtp = false;
          Cookies.remove('otp_mobile', { path: '/' });
          Cookies.remove('is_forget', { path: '/' });
        }
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(getProfileData.fulfilled, (state, action) => {
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (action.payload?.user) state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isSendOtp = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authenticated = false;
        state.user = {};
        state.isForget = false;
        state.isSendOtp = false;
      });
  },
});

export const { setUserData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
