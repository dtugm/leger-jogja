/**
 * AES-256-GCM encryption / decryption using the Web Crypto API.
 *
 * Used to encrypt auth tokens before storing them in localStorage so
 * they are not visible as plain text.  The encryption key is derived
 * from the NEXT_PUBLIC_TOKEN_ENCRYPTION_KEY env var.
 *
 * Note: because the key lives in a NEXT_PUBLIC_ variable it ships to
 * the client — this is obfuscation, not true security.  For real
 * security use HttpOnly cookies.
 */

import { ENV } from "@/config/env";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert an ArrayBuffer to a base-64 string. */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Convert a base-64 string back to a Uint8Array. */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* ------------------------------------------------------------------ */
/*  Key derivation                                                     */
/* ------------------------------------------------------------------ */

/**
 * Derive a CryptoKey from the plain-text secret stored in env.
 * We use the raw bytes of the 32-char string as a 256-bit AES key.
 */
async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENV.TOKEN_ENCRYPTION_KEY.slice(0, 32));

  return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export interface EncryptedPayload {
  /** Base-64 encoded ciphertext. */
  ciphertext: string;
  /** Base-64 encoded initialisation vector (12 bytes). */
  iv: string;
}

/**
 * Encrypt a plain-text string with AES-256-GCM.
 * Returns the ciphertext + IV, both base-64 encoded.
 */
export async function encrypt(plaintext: string): Promise<EncryptedPayload> {
  const key = await getKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt a previously encrypted payload back to plain text.
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
): Promise<string> {
  const key = await getKey();
  const decoder = new TextDecoder();

  const ivBytes = base64ToBuffer(iv);
  const cipherBytes = base64ToBuffer(ciphertext);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer.slice(ivBytes.byteOffset, ivBytes.byteOffset + ivBytes.byteLength) as ArrayBuffer },
    key,
    cipherBytes.buffer.slice(cipherBytes.byteOffset, cipherBytes.byteOffset + cipherBytes.byteLength) as ArrayBuffer,
  );

  return decoder.decode(plainBuffer);
}
