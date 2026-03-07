import { EncryptedOfflineVault, OfflineVaultSummary } from "../models";

const DATABASE_NAME = "super-gen-pass-offline";
const STORE_NAME = "records";
const RECORD_KEY = "vault";
const DATABASE_VERSION = 1;

type VaultRecord = {
  key: typeof RECORD_KEY;
  value: EncryptedOfflineVault;
};

function assertIndexedDb() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("IndexedDB is not available on this device.");
  }
}

async function openDatabase() {
  assertIndexedDb();

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T,
) {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let callbackResult: T;

    transaction.oncomplete = () => {
      database.close();
      resolve(callbackResult);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    };

    Promise.resolve(callback(store))
      .then((value) => {
        callbackResult = value;
      })
      .catch((error) => {
        transaction.onerror = null;
        transaction.oncomplete = null;
        transaction.onabort = null;
        database.close();
        reject(error);
      });
  });
}

export async function getOfflineVaultRecord() {
  return withStore("readonly", (store) => {
    return new Promise<EncryptedOfflineVault | null>((resolve, reject) => {
      const request = store.get(RECORD_KEY);
      request.onsuccess = () => {
        const result = request.result as VaultRecord | undefined;
        resolve(result?.value ?? null);
      };
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to read offline vault."));
    });
  });
}

export async function setOfflineVaultRecord(value: EncryptedOfflineVault) {
  return withStore("readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key: RECORD_KEY, value } satisfies VaultRecord);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to store offline vault."));
    });
  });
}

export async function clearOfflineVaultRecord() {
  return withStore("readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(RECORD_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to delete offline vault."));
    });
  });
}

export async function hasOfflineVaultRecord() {
  return (await getOfflineVaultRecord()) !== null;
}

export async function getOfflineVaultSummary(): Promise<OfflineVaultSummary> {
  const vault = await getOfflineVaultRecord();

  return {
    hasVault: vault !== null,
    method: vault?.wrapping.type ?? null,
    userId: vault?.userId ?? null,
    updatedAt: vault?.updatedAt ?? null,
  };
}
