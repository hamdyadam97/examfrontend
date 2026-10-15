/**
 * Central classifier for login API failures.
 * Maps the backend error envelope ({ status, statusCode, message, errors })
 * to a safe, user-presentable category. Never leaks internals.
 */

export type LoginErrorKind =
  | 'network'
  | 'invalid_credentials'
  | 'account_disabled'
  | 'rate_limited'
  | 'session_expired'
  | 'server_error'
  | 'field_errors'
  | 'unknown';

export interface LoginFieldErrors {
  mobile?: string;
  password?: string;
}

export interface LoginFailure {
  kind: LoginErrorKind;
  fields?: LoginFieldErrors;
}

interface ApiErrorEnvelope {
  statusCode?: number;
  status?: number;
  message?: string;
  errors?: Record<string, string[] | string>;
}

export function classifyLoginError(err: unknown): LoginFailure {
  const envelope = (err ?? {}) as ApiErrorEnvelope;

  // Network failure / request aborted / CORS: no HTTP response at all.
  // The store's apiError() fallback produces { message: 'Network Error' } here.
  const status: number | undefined = envelope.statusCode ?? envelope.status;
  if (!status) {
    return { kind: 'network' };
  }

  const errors = envelope.errors ?? {};

  if (errors.WrongCredentials || envelope.message === 'Unauthorised') {
    return { kind: 'invalid_credentials' };
  }

  if (errors.AccountDisabled || status === 403) {
    return { kind: 'account_disabled' };
  }

  if (status === 429) {
    return { kind: 'rate_limited' };
  }

  if (status === 401) {
    return { kind: 'session_expired' };
  }

  if (status >= 500) {
    return { kind: 'server_error' };
  }

  if (status === 422) {
    const fields: LoginFieldErrors = {};
    if (errors.phone) {
      fields.mobile = Array.isArray(errors.phone) ? errors.phone[0] : errors.phone;
    }
    if (errors.password) {
      fields.password = Array.isArray(errors.password) ? errors.password[0] : errors.password;
    }
    if (fields.mobile || fields.password) {
      return { kind: 'field_errors', fields };
    }
  }

  return { kind: 'unknown' };
}

/** Normalizes a mobile input: converts Arabic/Persian digits, keeps digits only shape. */
export function normalizeMobileInput(mobile: string): string {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  let value = mobile.trim();
  for (let i = 0; i < 10; i += 1) {
    value = value.split(arabic[i]).join(String(i)).split(persian[i]).join(String(i));
  }
  return value.replace(/^0+/, '');
}

/** Local validation before any request is sent. */
export function validateLoginInput(mobile: string, password: string): LoginFieldErrors {
  const fields: LoginFieldErrors = {};
  const normalized = normalizeMobileInput(mobile);
  if (!normalized) {
    fields.mobile = 'required';
  } else if (!/^\d{7,12}$/.test(normalized)) {
    fields.mobile = 'invalid';
  }
  if (!password) {
    fields.password = 'required';
  }
  return fields;
}
