/**
 * Centralized Fetch Client
 *
 * A thin wrapper around the native `fetch` API that provides:
 *  - Base URL prefixing from env
 *  - Request interceptor: auto-attach Bearer auth token
 *  - Response interceptor: normalise into ApiResponse, handle 401
 *  - Configurable timeout via AbortController
 *  - Global error handling
 */

import { API_TIMEOUT_MS, DEFAULT_HEADERS, HTTP_STATUS } from "@/constants/api";
import { AuthTokenService } from "@/services/auth-token";
import type { ApiResponse, RequestConfig } from "@/types/api";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a full URL from a path, prepending the base URL. */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/** Create an AbortController that auto-aborts after `ms` milliseconds. */
function createTimeout(ms: number, externalSignal?: AbortSignal): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("Request timeout"), ms);

  // If the caller passed their own signal, chain it so either can abort.
  if (externalSignal) {
    externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason));
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

/* ------------------------------------------------------------------ */
/*  Response interceptor                                               */
/* ------------------------------------------------------------------ */

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Handle 401 → force logout
  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    AuthTokenService.removeToken();
    // Optionally redirect to login — can be customised later
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // Try to parse JSON body
  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    body = {
      success: false,
      data: null as unknown as T,
      message: response.statusText || "Terjadi kesalahan pada server",
      statusCode: response.status,
    };
  }

  // Normalise: ensure the envelope always has the expected shape
  return {
    success: body.success ?? response.ok,
    data: body.data ?? (null as unknown as T),
    message: body.message ?? (response.ok ? "Success" : "Error"),
    statusCode: body.statusCode ?? response.status,
  };
}

/* ------------------------------------------------------------------ */
/*  Core request function                                              */
/* ------------------------------------------------------------------ */

export async function apiRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const timeout = createTimeout(
    config?.timeout ?? API_TIMEOUT_MS,
    config?.signal,
  );

  try {
    // --- Request interceptor: attach auth token ---
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...config?.headers,
    };

    const token = await AuthTokenService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = buildUrl(path, config?.params);

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: timeout.signal,
    };

    if (body !== undefined && method !== "GET") {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // --- Response interceptor ---
    return await handleResponse<T>(response);
  } catch (error: unknown) {
    // Network error or timeout
    const isAbort = error instanceof DOMException && error.name === "AbortError";
    return {
      success: false,
      data: null as unknown as T,
      message: isAbort
        ? "Request timeout — server tidak merespons"
        : "Tidak dapat terhubung ke server",
      statusCode: 0,
    };
  } finally {
    timeout.clear();
  }
}
