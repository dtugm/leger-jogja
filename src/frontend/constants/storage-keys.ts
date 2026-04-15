/**
 * Centralized localStorage key constants.
 *
 * Keeping all keys here prevents typo-related bugs and makes it easy
 * to audit what the app persists in the browser.
 */
export const STORAGE_KEYS = {
  /** Encrypted auth token (AES-GCM ciphertext, base64). */
  AUTH_TOKEN: "app_auth_token",
  /** Initialisation vector used for AES-GCM (base64). */
  AUTH_TOKEN_IV: "app_auth_token_iv",
  /** Serialised user menu (JSON string). */
  USER_MENU: "app_user_menu",
} as const;
