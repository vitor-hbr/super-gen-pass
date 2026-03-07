export type PasswordConfigEntry = {
  id: string;
  url: string;
  length: number;
  forceSpecialCharacter: boolean;
  onlyDomain: boolean;
};

export type OfflineVaultPayload = {
  version: 1;
  userId: string;
  updatedAt: string;
  entries: PasswordConfigEntry[];
};

export type OfflineWrappingMethod =
  | {
      type: "webauthn-prf";
      credentialIdBase64Url: string;
      hkdfSaltBase64: string;
      prfInputLabel: string;
    }
  | {
      type: "grid";
      saltBase64: string;
    };

export type EncryptedOfflineVault = {
  version: 1;
  userId: string;
  updatedAt: string;
  ivBase64: string;
  ciphertextBase64: string;
  wrappedContentKeyBase64: string;
  wrappingIvBase64: string;
  wrapping: OfflineWrappingMethod;
};

export type PatternSequence = [number, number, number, number, number];

export type OfflineAccessState =
  | "disabled"
  | "setup"
  | "enabled"
  | "locked"
  | "unlocking"
  | "unlocked"
  | "error";

export type OfflineVaultSummary = {
  hasVault: boolean;
  method: OfflineWrappingMethod["type"] | null;
  userId: string | null;
  updatedAt: string | null;
};
