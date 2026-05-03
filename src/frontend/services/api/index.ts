/**
 * Centralized API Helper Functions
 *
 * Usage:
 *   import { ApiGetData, ApiPostData, ApiPutData, ApiDeleteData, ApiPatchData } from "@/services/api";
 *
 *   const users = await ApiGetData<User[]>("/users");
 *   const created = await ApiPostData<User>("/users", { name: "John" });
 *   const updated = await ApiPutData<User>("/users/1", { name: "Jane" });
 *   const patched = await ApiPatchData<User>("/users/1", { name: "Doe" });
 *   const deleted = await ApiDeleteData("/users/1");
 */

import type { ApiResponse, RequestConfig } from "@/types/api";

import { apiRequest } from "./client";

/**
 * Send a GET request.
 *
 * @param url    - API endpoint path (e.g. "/users")
 * @param config - Optional request config (params, headers, timeout, signal)
 */
export async function ApiGetData<T = unknown>(
  url: string,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("GET", url, undefined, config);
}

/**
 * Send a POST request.
 *
 * @param url    - API endpoint path
 * @param body   - Request body (will be JSON-stringified)
 * @param config - Optional request config
 */
export async function ApiPostData<T = unknown>(
  url: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("POST", url, body, config);
}

/**
 * Send a PUT request.
 *
 * @param url    - API endpoint path
 * @param body   - Request body (will be JSON-stringified)
 * @param config - Optional request config
 */
export async function ApiPutData<T = unknown>(
  url: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("PUT", url, body, config);
}

/**
 * Send a DELETE request.
 *
 * @param url    - API endpoint path
 * @param config - Optional request config
 */
export async function ApiDeleteData<T = unknown>(
  url: string,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("DELETE", url, undefined, config);
}

/**
 * Send a PATCH request.
 *
 * @param url    - API endpoint path
 * @param body   - Request body (will be JSON-stringified)
 * @param config - Optional request config
 */
export async function ApiPatchData<T = unknown>(
  url: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("PATCH", url, body, config);
}
