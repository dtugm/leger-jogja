/**
 * API-related constants shared across the fetch wrapper and services.
 */

/** Default request timeout in milliseconds (30 seconds). */
export const API_TIMEOUT_MS = 30_000;

/** Default headers sent with every API request. */
export const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** HTTP status codes that trigger specific behaviours in interceptors. */
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
