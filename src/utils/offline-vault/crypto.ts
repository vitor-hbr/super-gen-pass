import {
  EncryptedOfflineVault,
  OfflineVaultPayload,
  PatternSequence,
} from "../models";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const WRAPPING_INFO = encoder.encode("super-gen-pass-offline-wrap-v1");

function assertCrypto() {
  if (
    typeof window === "undefined" ||
    !window.crypto?.subtle ||
    typeof window.crypto.getRandomValues !== "function"
  ) {
    throw new Error("Secure crypto is not available on this device.");
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const clone = new Uint8Array(bytes.length);
  clone.set(bytes);
  return clone.buffer as ArrayBuffer;
}

export function randomBytes(length: number) {
  assertCrypto();
  return window.crypto.getRandomValues(new Uint8Array(length));
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }

  return btoa(binary);
}

export function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return base64ToBytes(`${normalized}${padding}`);
}

function normalizePattern(pattern: PatternSequence) {
  return pattern.join("-");
}

export function validatePatternSequence(pattern: number[]): pattern is PatternSequence {
  return (
    pattern.length === 5 &&
    pattern.every((value) => Number.isInteger(value) && value >= 0 && value <= 8) &&
    !pattern.every((value) => value === pattern[0])
  );
}

export async function hashUserId(userId: string) {
  assertCrypto();
  const digest = await window.crypto.subtle.digest("SHA-256", encoder.encode(userId));
  return new Uint8Array(digest);
}

async function importAesKey(rawKey: Uint8Array, keyUsages: KeyUsage[]) {
  return window.crypto.subtle.importKey(
    "raw",
    toArrayBuffer(rawKey),
    "AES-GCM",
    false,
    keyUsages,
  );
}

async function importHkdfKey(rawKey: Uint8Array) {
  return window.crypto.subtle.importKey("raw", toArrayBuffer(rawKey), "HKDF", false, [
    "deriveKey",
  ]);
}

async function importPbkdf2Key(pattern: PatternSequence) {
  return window.crypto.subtle.importKey(
    "raw",
    toArrayBuffer(encoder.encode(normalizePattern(pattern))),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
}

export async function deriveWrappingKeyFromPrfOutput(prfOutput: Uint8Array, salt: Uint8Array) {
  assertCrypto();
  const hkdfKey = await importHkdfKey(prfOutput);

  return window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      info: toArrayBuffer(WRAPPING_INFO),
    },
    hkdfKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function deriveWrappingKeyFromPattern(pattern: PatternSequence, salt: Uint8Array) {
  assertCrypto();
  const pbkdf2Key = await importPbkdf2Key(pattern);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations: 250000,
    },
    pbkdf2Key,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function wrapContentKey(contentKeyBytes: Uint8Array, wrappingKey: CryptoKey) {
  assertCrypto();
  const wrappingIv = randomBytes(12);
  const wrappedContentKey = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(wrappingIv),
    },
    wrappingKey,
    toArrayBuffer(contentKeyBytes),
  );

  return {
    wrappingIvBase64: bytesToBase64(wrappingIv),
    wrappedContentKeyBase64: bytesToBase64(new Uint8Array(wrappedContentKey)),
  };
}

export async function unwrapContentKey(vault: EncryptedOfflineVault, wrappingKey: CryptoKey) {
  assertCrypto();
  const contentKey = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(base64ToBytes(vault.wrappingIvBase64)),
    },
    wrappingKey,
    base64ToBytes(vault.wrappedContentKeyBase64),
  );

  return new Uint8Array(contentKey);
}

export async function decryptVaultPayload(
  vault: EncryptedOfflineVault,
  contentKeyBytes: Uint8Array,
) {
  assertCrypto();
  const contentKey = await importAesKey(contentKeyBytes, ["decrypt"]);
  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(base64ToBytes(vault.ivBase64)),
    },
    contentKey,
    base64ToBytes(vault.ciphertextBase64),
  );

  return JSON.parse(decoder.decode(plaintext)) as OfflineVaultPayload;
}

export async function reencryptVaultPayload(
  contentKeyBytes: Uint8Array,
  payload: OfflineVaultPayload,
) {
  assertCrypto();
  const contentKey = await importAesKey(contentKeyBytes, ["encrypt"]);
  const iv = randomBytes(12);
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    contentKey,
    encoder.encode(JSON.stringify(payload)),
  );

  return {
    ivBase64: bytesToBase64(iv),
    ciphertextBase64: bytesToBase64(new Uint8Array(ciphertext)),
  };
}
