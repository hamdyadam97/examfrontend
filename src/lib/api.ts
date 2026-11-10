import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/** Error body the backend returns (and what the store's thunks reject with). */
export interface ApiError {
  status?: boolean;
  statusCode?: number;
  code?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * The backend's message for a failed request, whether the error is a raw axios error or the
 * body a store thunk rejected with; undefined when there is none (e.g. a network failure).
 */
export function apiErrorMessage(err: unknown): string | undefined {
  if (axios.isAxiosError<ApiError>(err)) return err.response?.data?.message;
  const body = err as ApiError | undefined;
  return body?.statusCode || body?.code ? body.message : undefined;
}

/**
 * The session token lives in an httpOnly cookie the browser sends by itself; scripts never see it.
 * X-Requested-With tells the backend a write comes from this site (it cannot be forged cross-site).
 */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/** Readable marker cookie set next to the session; it holds no secret. */
export const SESSION_FLAG = 'logged_in';
export const hasSession = () => Cookies.get(SESSION_FLAG) === '1';

// Tokens from before the httpOnly session were kept in a readable cookie; drop them.
Cookies.remove('token', { path: '/' });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove(SESSION_FLAG, { path: '/' });
      Cookies.remove('user', { path: '/' });
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Flag consumed by the login form to explain why the user was signed out.
        window.sessionStorage.setItem('auth:session-expired', '1');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
