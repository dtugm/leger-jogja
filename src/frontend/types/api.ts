/* ------------------------------------------------------------------ */
/*  Shared API types                                                   */
/* ------------------------------------------------------------------ */

/**
 * Standard API success response envelope.
 * All backend responses should conform to this shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

/**
 * Standard API error shape returned by the fetch wrapper
 * when the request fails (non-2xx or network error).
 */
export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/**
 * Options accepted by the `withApiHandler` / `useApiHandler` wrappers.
 */
export interface ApiHandlerOptions<T = unknown> {
  /** The API call to execute. Must return an `ApiResponse<T>`. */
  request: () => Promise<ApiResponse<T>>;
  /** Custom toast message on success (overrides the one from the API). */
  successMessage?: string;
  /** Custom toast message on error (overrides the one from the API). */
  errorMessage?: string;
  /** Set to `false` to suppress the success toast. Defaults to `true`. */
  showSuccessToast?: boolean;
  /** Set to `false` to suppress the error toast. Defaults to `true`. */
  showErrorToast?: boolean;
}

/**
 * Configuration for `ApiClient` requests (maps to native `fetch` options
 * with a few convenience additions).
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  /** Abort signal for cancellation support. */
  signal?: AbortSignal;
  /** Override the default timeout (ms). */
  timeout?: number;
}
