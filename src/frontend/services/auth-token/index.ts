/**
 * Auth Token Service
 *
 * Provides a clean API to store, retrieve, and remove the auth token.
 * Tokens are AES-256-GCM encrypted before being written to
 * localStorage so they are never visible as plain text.
 */

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { storage } from "@/utils/storage";

import { decrypt, encrypt } from "./crypto";

export const AuthTokenService = {
  /**
   * Encrypt and persist the auth token in localStorage.
   */
  async setToken(token: string): Promise<void> {
    const { ciphertext, iv } = await encrypt(token);
    storage.setString(STORAGE_KEYS.AUTH_TOKEN, ciphertext);
    storage.setString(STORAGE_KEYS.AUTH_TOKEN_IV, iv);
  },

  /**
   * Retrieve and decrypt the stored auth token.
   * Returns `null` if no token exists or decryption fails.
   */
  async getToken(): Promise<string | null> {
    const ciphertext = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const iv = storage.getString(STORAGE_KEYS.AUTH_TOKEN_IV);

    if (!ciphertext || !iv) return null;

    try {
      return await decrypt(ciphertext, iv);
    } catch {
      // If decryption fails (e.g. key changed), wipe the invalid data.
      AuthTokenService.removeToken();
      return null;
    }
  },

  /**
   * Remove the stored token and its IV.
   */
  removeToken(): void {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_TOKEN_IV);
  },

  /**
   * Quick synchronous check — does a token entry exist?
   * (Does not verify whether it can be decrypted.)
   */
  hasToken(): boolean {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN) !== null;
  },
};
