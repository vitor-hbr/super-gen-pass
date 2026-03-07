import {
  EncryptedOfflineVault,
  OfflineVaultPayload,
  OfflineVaultSummary,
  PasswordConfigEntry,
  PatternSequence,
} from "./models";
import {
  createOfflineCredential,
  derivePrfOutput,
  isPlatformAuthenticatorAvailable,
  isWebAuthnPrfAvailable,
} from "./offline-auth/webauthn";
import {
  decryptVaultPayload,
  deriveWrappingKeyFromPattern,
  deriveWrappingKeyFromPrfOutput,
  randomBytes,
  reencryptVaultPayload,
  unwrapContentKey,
  validatePatternSequence,
  wrapContentKey,
  bytesToBase64,
  base64ToBytes,
} from "./offline-vault/crypto";
import {
  clearOfflineVaultRecord,
  getOfflineVaultRecord,
  getOfflineVaultSummary as getStoredOfflineVaultSummary,
  hasOfflineVaultRecord,
  setOfflineVaultRecord,
} from "./offline-vault/storage";

type OfflineAccessErrorCode =
  | "unsupported-environment"
  | "unsupported-method"
  | "vault-not-found"
  | "vault-locked"
  | "user-mismatch"
  | "invalid-pattern"
  | "unlock-cancelled"
  | "unlock-unavailable"
  | "unlock-failed"
  | "corrupted-vault";

export class OfflineAccessError extends Error {
  code: OfflineAccessErrorCode;

  constructor(code: OfflineAccessErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

type ActiveOfflineSession = {
  userId: string;
  contentKeyBytes: Uint8Array;
};

type OfflineEnvironmentSupport = {
  available: boolean;
  reason: string | null;
};

const PRF_INPUT_LABEL = "offline-vault-key-v1";
let activeOfflineSession: ActiveOfflineSession | null = null;

function getEnvironmentSupport(): OfflineEnvironmentSupport {
  if (typeof window === "undefined") {
    return {
      available: false,
      reason: "Offline access is only available in the browser.",
    };
  }

  if (!window.isSecureContext) {
    return {
      available: false,
      reason: "Offline access requires a secure browser context (HTTPS).",
    };
  }

  if (!window.indexedDB || !window.crypto?.subtle) {
    return {
      available: false,
      reason: "This browser does not support the storage or crypto APIs required for offline access.",
    };
  }

  return {
    available: true,
    reason: null,
  };
}

export function getOfflineEnvironmentSupport() {
  return getEnvironmentSupport();
}

async function buildVaultEnvelope(
  entries: PasswordConfigEntry[],
  userId: string,
  wrapping: EncryptedOfflineVault["wrapping"],
  contentKeyBytes: Uint8Array,
  wrappedContentKey: Pick<
    EncryptedOfflineVault,
    "wrappedContentKeyBase64" | "wrappingIvBase64"
  >,
) {
  const payload: OfflineVaultPayload = {
    version: 1,
    userId,
    updatedAt: new Date().toISOString(),
    entries,
  };

  const encryptedPayload = await reencryptVaultPayload(contentKeyBytes, payload);
  return {
    version: 1,
    userId,
    updatedAt: payload.updatedAt,
    ...encryptedPayload,
    ...wrappedContentKey,
    wrapping,
  } satisfies EncryptedOfflineVault;
}

function rememberOfflineSession(userId: string, contentKeyBytes: Uint8Array) {
  activeOfflineSession = {
    userId,
    contentKeyBytes,
  };
}

function clearOfflineSession() {
  activeOfflineSession = null;
}

function assertPattern(pattern: number[]): asserts pattern is PatternSequence {
  if (!validatePatternSequence(pattern)) {
    throw new OfflineAccessError(
      "invalid-pattern",
      "Use five taps and avoid selecting the same cell for all five taps.",
    );
  }
}

function wrapUnlockError(error: unknown) {
  if (error instanceof OfflineAccessError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return new OfflineAccessError(
      "unlock-cancelled",
      "Unlock was cancelled before a credential could be used.",
    );
  }

  return new OfflineAccessError(
    "unlock-failed",
    error instanceof Error ? error.message : "Offline unlock failed.",
  );
}

async function unlockVault(
  vault: EncryptedOfflineVault,
  wrappingKey: CryptoKey,
) {
  try {
    const contentKeyBytes = await unwrapContentKey(vault, wrappingKey);
    const payload = await decryptVaultPayload(vault, contentKeyBytes);

    if (payload.userId !== vault.userId) {
      throw new OfflineAccessError(
        "corrupted-vault",
        "Offline vault ownership could not be verified.",
      );
    }

    rememberOfflineSession(vault.userId, contentKeyBytes);

    return payload;
  } catch (error) {
    if (error instanceof OfflineAccessError) {
      throw error;
    }

    throw new OfflineAccessError(
      "corrupted-vault",
      "Offline data could not be decrypted safely.",
    );
  }
}

export async function isOfflineAccessSupported() {
  const environment = getEnvironmentSupport();
  const platformAuthenticator = environment.available
    ? await isPlatformAuthenticatorAvailable()
    : false;
  const webauthnPrf =
    environment.available && platformAuthenticator
      ? await isWebAuthnPrfAvailable()
      : false;

  return {
    platformAuthenticator,
    webauthnPrf,
    method: platformAuthenticator && webauthnPrf ? ("webauthn-prf" as const) : ("grid" as const),
  };
}

export async function enableOfflineAccessWithBiometrics(
  entries: PasswordConfigEntry[],
  userId: string,
) {
  const environment = getEnvironmentSupport();
  if (!environment.available) {
    throw new OfflineAccessError("unsupported-environment", environment.reason ?? "Offline access is unavailable.");
  }

  const support = await isOfflineAccessSupported();
  if (!(support.platformAuthenticator && support.webauthnPrf)) {
    throw new OfflineAccessError(
      "unsupported-method",
      "Biometric offline unlock requires a platform authenticator with WebAuthn PRF support.",
    );
  }

  try {
    const hkdfSalt = randomBytes(16);
    const credentialIdBase64Url = await createOfflineCredential(userId, PRF_INPUT_LABEL);
    const prfOutput = await derivePrfOutput(credentialIdBase64Url, PRF_INPUT_LABEL);
    const wrappingKey = await deriveWrappingKeyFromPrfOutput(prfOutput, hkdfSalt);
    const contentKeyBytes = randomBytes(32);
    const wrappedContentKey = await wrapContentKey(contentKeyBytes, wrappingKey);
    const vault = await buildVaultEnvelope(
      entries,
      userId,
      {
        type: "webauthn-prf",
        credentialIdBase64Url,
        hkdfSaltBase64: bytesToBase64(hkdfSalt),
        prfInputLabel: PRF_INPUT_LABEL,
      },
      contentKeyBytes,
      wrappedContentKey,
    );

    await setOfflineVaultRecord(vault);
    rememberOfflineSession(userId, contentKeyBytes);
  } catch (error) {
    throw wrapUnlockError(error);
  }
}

export async function enableOfflineAccessWithGrid(
  entries: PasswordConfigEntry[],
  userId: string,
  pattern: PatternSequence,
) {
  const environment = getEnvironmentSupport();
  if (!environment.available) {
    throw new OfflineAccessError("unsupported-environment", environment.reason ?? "Offline access is unavailable.");
  }

  assertPattern(pattern);

  const salt = randomBytes(16);
  const wrappingKey = await deriveWrappingKeyFromPattern(pattern, salt);
  const contentKeyBytes = randomBytes(32);
  const wrappedContentKey = await wrapContentKey(contentKeyBytes, wrappingKey);
  const vault = await buildVaultEnvelope(
    entries,
    userId,
    {
      type: "grid",
      saltBase64: bytesToBase64(salt),
    },
    contentKeyBytes,
    wrappedContentKey,
  );

  await setOfflineVaultRecord(vault);
  rememberOfflineSession(userId, contentKeyBytes);
}

export async function unlockOfflineAccessWithBiometrics() {
  const vault = await getOfflineVaultRecord();
  if (!vault) {
    throw new OfflineAccessError("vault-not-found", "Offline access is not enabled on this device.");
  }

  if (vault.wrapping.type !== "webauthn-prf") {
    throw new OfflineAccessError(
      "unsupported-method",
      "This device is configured to use the sound grid for offline unlock.",
    );
  }

  try {
    const prfOutput = await derivePrfOutput(
      vault.wrapping.credentialIdBase64Url,
      vault.wrapping.prfInputLabel,
    );
    const wrappingKey = await deriveWrappingKeyFromPrfOutput(
      prfOutput,
      base64ToBytes(vault.wrapping.hkdfSaltBase64),
    );

    return await unlockVault(vault, wrappingKey);
  } catch (error) {
    throw wrapUnlockError(error);
  }
}

export async function unlockOfflineAccessWithGrid(pattern: PatternSequence) {
  assertPattern(pattern);
  const vault = await getOfflineVaultRecord();

  if (!vault) {
    throw new OfflineAccessError("vault-not-found", "Offline access is not enabled on this device.");
  }

  if (vault.wrapping.type !== "grid") {
    throw new OfflineAccessError(
      "unsupported-method",
      "This device is configured to use biometrics for offline unlock.",
    );
  }

  try {
    const wrappingKey = await deriveWrappingKeyFromPattern(
      pattern,
      base64ToBytes(vault.wrapping.saltBase64),
    );

    return await unlockVault(vault, wrappingKey);
  } catch (error) {
    if (error instanceof OfflineAccessError) {
      throw error;
    }

    throw new OfflineAccessError("unlock-failed", "Offline unlock failed.");
  }
}

export async function syncOfflineVault(entries: PasswordConfigEntry[], userId: string) {
  const vault = await getOfflineVaultRecord();
  if (!vault) {
    return;
  }

  if (vault.userId !== userId) {
    throw new OfflineAccessError(
      "user-mismatch",
      "Offline access on this device belongs to a different account.",
    );
  }

  if (!activeOfflineSession || activeOfflineSession.userId !== userId) {
    throw new OfflineAccessError(
      "vault-locked",
      "Offline access must be unlocked before it can be refreshed.",
    );
  }

  const nextVault = await buildVaultEnvelope(
    entries,
    userId,
    vault.wrapping,
    activeOfflineSession.contentKeyBytes,
    {
      wrappedContentKeyBase64: vault.wrappedContentKeyBase64,
      wrappingIvBase64: vault.wrappingIvBase64,
    },
  );
  await setOfflineVaultRecord(nextVault);
}

export async function hasOfflineVault() {
  return hasOfflineVaultRecord();
}

export async function disableOfflineAccess() {
  clearOfflineSession();
  await clearOfflineVaultRecord();
}

export async function resetOfflineAccess() {
  await disableOfflineAccess();
}

export async function getOfflineVaultSummary(): Promise<OfflineVaultSummary> {
  return getStoredOfflineVaultSummary();
}

export function clearOfflineAccessSession() {
  clearOfflineSession();
}
