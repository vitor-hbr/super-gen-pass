import {
  base64UrlToBytes,
  bytesToBase64Url,
  hashUserId,
  randomBytes,
} from "../offline-vault/crypto";

type ClientCapabilities = Record<string, boolean>;

type CredentialWithExtensions = PublicKeyCredential & {
  getClientExtensionResults(): {
    prf?: {
      enabled?: boolean;
      results?: {
        first?: ArrayBuffer;
      };
    };
  };
};

const CREDENTIAL_TIMEOUT = 60000;

function assertWebAuthn() {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    typeof window.PublicKeyCredential === "undefined" ||
    typeof navigator.credentials === "undefined"
  ) {
    throw new Error("WebAuthn is not available on this device.");
  }
}

function getPublicKeyCredentialConstructor() {
  return window.PublicKeyCredential as typeof PublicKeyCredential & {
    getClientCapabilities?: () => Promise<ClientCapabilities>;
  };
}

export async function isPlatformAuthenticatorAvailable() {
  try {
    assertWebAuthn();
    return await getPublicKeyCredentialConstructor().isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function isWebAuthnPrfAvailable() {
  try {
    assertWebAuthn();
    const capabilities = await getPublicKeyCredentialConstructor().getClientCapabilities?.();
    return capabilities?.["extension:prf"] === true;
  } catch {
    return false;
  }
}

export async function createOfflineCredential(
  userId: string,
  prfInputLabel: string,
) {
  assertWebAuthn();
  const challenge = randomBytes(32);
  const userHandle = await hashUserId(`${userId}:offline-access`);
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        id: window.location.hostname,
        name: "Super Gen Pass",
      },
      user: {
        id: userHandle,
        name: userId,
        displayName: "Offline access",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      timeout: CREDENTIAL_TIMEOUT,
      attestation: "none",
      extensions: {
        prf: {
          eval: {
            first: new TextEncoder().encode(prfInputLabel),
          },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as CredentialWithExtensions | null;

  if (!credential) {
    throw new Error("Offline access credential creation failed.");
  }

  return bytesToBase64Url(new Uint8Array(credential.rawId));
}

export async function derivePrfOutput(
  credentialIdBase64Url: string,
  prfInputLabel: string,
) {
  assertWebAuthn();
  const challenge = randomBytes(32);
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: base64UrlToBytes(credentialIdBase64Url),
          type: "public-key",
        },
      ],
      timeout: CREDENTIAL_TIMEOUT,
      userVerification: "required",
      extensions: {
        prf: {
          evalByCredential: {
            [credentialIdBase64Url]: {
              first: new TextEncoder().encode(prfInputLabel),
            },
          },
        },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as CredentialWithExtensions | null;

  const prfResult = credential?.getClientExtensionResults?.().prf?.results?.first;

  if (!prfResult) {
    throw new Error("PRF output is unavailable for this credential.");
  }

  if (prfResult instanceof ArrayBuffer) {
    return new Uint8Array(prfResult);
  }

  return new Uint8Array(prfResult.buffer, prfResult.byteOffset, prfResult.byteLength);
}
