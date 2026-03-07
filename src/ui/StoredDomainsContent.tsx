"use client";

import {
  useRef,
  useState,
  useEffect,
  useTransition,
  useCallback,
  useDeferredValue,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { nanoid } from "nanoid";
import { toast } from "react-hot-toast";
import { FaLock, FaPlus, FaSearch, FaWifi } from "react-icons/fa";

import { PasswordInput } from "./PasswordInput";
import {
  OfflineAccessState,
  OfflineVaultSummary,
  PasswordConfigEntry,
  PatternSequence,
} from "../utils/models";
import {
  addNewConfigEntry,
  removeConfigEntry,
  updateConfigEntry,
} from "../app/actions";
import { ActionType } from "../utils/constants";
import {
  useClipboard,
  usePasswordGenerator,
  useDebounce,
  Pair,
  useViewTransition,
} from "../hooks";
import { StoredCard } from "./StoredCard";
import { EntryDialog, initialDialogState } from "./EntryDialog";
import { OfflinePatternDialog } from "./OfflinePatternDialog";

type Props = {
  entries: PasswordConfigEntry[];
  readOnly?: boolean;
  offlineAccess?: {
    errorMessage: string | null;
    isOnline: boolean;
    ownerMismatch: boolean;
    state: OfflineAccessState;
    summary: OfflineVaultSummary;
    support: {
      available: boolean;
      method: "webauthn-prf" | "grid";
      platformAuthenticator: boolean;
      reason: string | null;
      webauthnPrf: boolean;
    };
    usingOfflineEntries: boolean;
    onDisable: () => Promise<void>;
    onEnableBiometrics: () => Promise<void>;
    onEnableGrid: (pattern: PatternSequence) => Promise<void>;
    onReset: () => Promise<void>;
    onUnlockBiometrics: () => Promise<void>;
    onUnlockGrid: (pattern: PatternSequence) => Promise<void>;
  };
};

const defaultOfflineAccess: NonNullable<Props["offlineAccess"]> = {
  errorMessage: null,
  isOnline: true,
  ownerMismatch: false,
  state: "disabled",
  summary: {
    hasVault: false,
    method: null,
    userId: null,
    updatedAt: null,
  },
  support: {
    available: false,
    method: "grid",
    platformAuthenticator: false,
    reason: null,
    webauthnPrf: false,
  },
  usingOfflineEntries: false,
  onDisable: async () => undefined,
  onEnableBiometrics: async () => undefined,
  onEnableGrid: async () => undefined,
  onReset: async () => undefined,
  onUnlockBiometrics: async () => undefined,
  onUnlockGrid: async () => undefined,
};

function formatStatusLabel(state: OfflineAccessState) {
  switch (state) {
    case "setup":
      return "Setting up";
    case "enabled":
      return "Enabled";
    case "locked":
      return "Locked";
    case "unlocking":
      return "Unlocking";
    case "unlocked":
      return "Unlocked";
    case "error":
      return "Error";
    default:
      return "Off";
  }
}

export const StoredDomainsContent = ({
  entries,
  readOnly = false,
  offlineAccess = defaultOfflineAccess,
}: Props) => {
  const { clipboardText, copyToClipboard } = useClipboard();
  const [dialogState, setDialogState] =
    useState<PasswordConfigEntry>(initialDialogState);
  const [dialogMode, setDialogMode] = useState<
    ActionType.add | ActionType.edit
  >(ActionType.add);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { startViewTransition } = useViewTransition();
  const [, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { generatePasswords, masterPassword, setMasterPassword } =
    usePasswordGenerator();

  const [localEntries, setLocalEntries] =
    useState<PasswordConfigEntry[]>(entries);
  const [pairs, setPairs] = useState<Pair[]>(entries);
  const [patternDialogMode, setPatternDialogMode] = useState<"setup" | "unlock" | null>(
    null,
  );

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  useEffect(() => {
    const update = async () => {
      const newPairs = await generatePasswords(localEntries, true);
      startViewTransition(() => {
        setPairs(newPairs);
      });
    };
    update();
  }, [localEntries, generatePasswords, startViewTransition]);

  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const debouncedUpdateSearchParams = useDebounce((value: string) => {
    updateSearchParams(value);
  }, 150);

  const onMasterPasswordChange = (value: string) => {
    setMasterPassword(value);
  };

  function openDialog() {
    startViewTransition(() => {
      dialogRef.current?.showModal();
    });
  }

  function closeDialog() {
    startViewTransition(() => {
      dialogRef.current?.close();
    });
  }

  const filteredPairs = pairs.filter((pair) =>
    pair.url.toLowerCase().includes(deferredSearchQuery.toLowerCase()),
  );

  const handleConfirm = async () => {
    if (readOnly) {
      return;
    }

    const previousEntries = localEntries;
    const previousPairs = pairs;

    const optimisticEntry: PasswordConfigEntry = {
      ...dialogState,
      id:
        dialogMode === ActionType.add
          ? `optimistic-${nanoid()}`
          : dialogState.id,
    };
    let optimisticPair: Pair = optimisticEntry;

    if (masterPassword) {
      const [entryWithPassword] = await generatePasswords(
        [optimisticEntry],
        true,
      );
      if (entryWithPassword) {
        optimisticPair = entryWithPassword;
      }
    }

    // Update local state immediately for instant feedback
    startViewTransition(() => {
      dialogRef.current?.close();
      if (dialogMode === ActionType.add) {
        setLocalEntries((prev) => [...prev, optimisticEntry]);
        setPairs((prev) => [...prev, optimisticPair]);
      } else {
        setLocalEntries((prev) =>
          prev.map((entry) =>
            entry.id === optimisticEntry.id ? optimisticEntry : entry,
          ),
        );
        setPairs((prev) =>
          prev.map((pair) =>
            pair.id === optimisticPair.id ? optimisticPair : pair,
          ),
        );
      }
      setDialogState(initialDialogState);
    });

    startTransition(async () => {
      try {
        if (dialogMode === ActionType.add) {
          await addNewConfigEntry(dialogState);
        } else {
          await updateConfigEntry(dialogState);
        }
      } catch (error) {
        toast.error(
          dialogMode === ActionType.add
            ? "Failed to create entry"
            : "Failed to edit entry",
        );
        startViewTransition(() => {
          setLocalEntries(previousEntries);
          setPairs(previousPairs);
        });
      }
    });
  };

  const handleRemove = async (pair: Pair) => {
    if (readOnly) {
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to remove the entry for "${pair.url}"?`,
    );

    if (!isConfirmed) {
      return;
    }

    const previousEntries = localEntries;
    const previousPairs = pairs;

    // Update local state immediately for instant feedback
    startViewTransition(() => {
      setLocalEntries((prev) => prev.filter((entry) => entry.id !== pair.id));
      setPairs((prev) => prev.filter((p) => p.id !== pair.id));
    });

    startTransition(async () => {
      try {
        await removeConfigEntry(pair.id);
      } catch (error) {
        toast.error("Failed to remove entry");
        startViewTransition(() => {
          setLocalEntries(previousEntries);
          setPairs(previousPairs);
        });
      }
    });
  };

  const handleOpenOfflineSetup = async () => {
    if (offlineAccess.support.method === "webauthn-prf") {
      await offlineAccess.onEnableBiometrics();
      return;
    }

    setPatternDialogMode("setup");
  };

  const handleUnlockOffline = async () => {
    if (offlineAccess.summary.method === "webauthn-prf") {
      await offlineAccess.onUnlockBiometrics();
      return;
    }

    setPatternDialogMode("unlock");
  };

  const handlePatternSubmit = async (pattern: PatternSequence) => {
    if (patternDialogMode === "setup") {
      await offlineAccess.onEnableGrid(pattern);
    } else if (patternDialogMode === "unlock") {
      await offlineAccess.onUnlockGrid(pattern);
    }

    setPatternDialogMode(null);
  };

  const isVaultLocked =
    offlineAccess.usingOfflineEntries && offlineAccess.state !== "unlocked";
  const currentMethod = offlineAccess.summary.method ?? offlineAccess.support.method;
  const lastSynced = offlineAccess.summary.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(offlineAccess.summary.updatedAt))
    : null;

  return (
    <div
      className="animate-slide-up mx-auto flex w-full max-w-full flex-col items-center gap-6 p-4 lg:max-w-[56rem] lg:gap-8 lg:p-8 xl:max-w-[64rem] xl:gap-10 xl:p-12 2xl:max-w-[72rem] 2xl:p-16"
      style={{ viewTransitionName: "page-content" }}
    >
      <section className="glass flex w-full flex-col gap-4 rounded-2xl p-4 lg:gap-5 lg:p-6 xl:gap-6 xl:p-8 2xl:p-10">
        <div className="flex flex-col gap-2 text-center lg:text-left">
          <h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
            Stored Domains
          </h3>
          <p className="text-sm text-white/60">
            {readOnly
              ? "Search and generate passwords from read-only offline entries."
              : "Manage your password configurations securely"}
          </p>
        </div>

        {readOnly && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <FaLock className="shrink-0 text-amber-300" />
            <span>Editing requires a network connection.</span>
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/60 uppercase">
                <FaWifi className="text-violet-300" />
                <span>Offline access</span>
              </div>
              <h4 className="text-lg font-bold text-white">
                Enable offline access on this device
              </h4>
              <p className="text-sm leading-relaxed text-white/60">
                Store an encrypted copy of your domain settings so you can search offline
                and generate passwords after entering your master password.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  offlineAccess.state === "error"
                    ? "bg-red-500/15 text-red-200"
                    : offlineAccess.state === "unlocked"
                      ? "bg-green-500/15 text-green-200"
                      : "bg-white/10 text-white/70"
                }`}
              >
                {formatStatusLabel(offlineAccess.state)}
              </span>
              {offlineAccess.summary.hasVault && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                  {currentMethod === "webauthn-prf"
                    ? "This device uses biometrics"
                    : "This device uses grid unlock"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-white/60">
            {lastSynced && (
              <p>
                <span className="text-white/80">Last synced:</span> {lastSynced}
              </p>
            )}
            {!offlineAccess.support.available && <p>{offlineAccess.support.reason}</p>}
            {offlineAccess.support.available && !offlineAccess.summary.hasVault && (
              <p>
                {offlineAccess.support.method === "webauthn-prf"
                  ? "This browser supports biometrics with WebAuthn PRF, so offline access will use device unlock."
                  : "This browser will use the 3x3 sound grid for offline unlock because WebAuthn PRF is unavailable."}
              </p>
            )}
            {!offlineAccess.isOnline && !offlineAccess.summary.hasVault && (
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
                Offline access is not enabled on this device.
              </p>
            )}
            {offlineAccess.ownerMismatch && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
                This device already has offline data for a different account. Reset
                offline access before enabling it for the current account.
              </p>
            )}
            {offlineAccess.errorMessage && !offlineAccess.ownerMismatch && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
                {offlineAccess.errorMessage}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {!offlineAccess.summary.hasVault && offlineAccess.support.available && (
              <button
                type="button"
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!offlineAccess.isOnline || readOnly}
                onClick={() => {
                  handleOpenOfflineSetup().catch(() => undefined);
                }}
              >
                Enable offline access
              </button>
            )}
            {offlineAccess.summary.hasVault &&
              !offlineAccess.isOnline &&
              !offlineAccess.ownerMismatch &&
              offlineAccess.state !== "unlocking" &&
              offlineAccess.state !== "unlocked" && (
                <button
                  type="button"
                  className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500"
                  onClick={() => {
                    handleUnlockOffline().catch(() => undefined);
                  }}
                >
                  Unlock offline access
                </button>
              )}
            {offlineAccess.summary.hasVault && (
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                onClick={() => {
                  offlineAccess.onDisable().catch(() => undefined);
                }}
              >
                Disable offline access
              </button>
            )}
            {offlineAccess.summary.hasVault && (
              <button
                type="button"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition-all hover:bg-red-500/20"
                onClick={() => {
                  offlineAccess.onReset().catch(() => undefined);
                }}
              >
                Reset offline access
              </button>
            )}
          </div>
        </section>

        {!isVaultLocked && (
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <PasswordInput
                onChange={onMasterPasswordChange}
                value={masterPassword}
                placeholder="Master Password"
                className="min-h-[44px] lg:min-h-[48px] xl:min-h-[52px] 2xl:min-h-[56px]"
              />
            </div>
            <span className="group relative flex-1">
              <input
                className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 text-sm text-white placeholder-white/40 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10 lg:min-h-[48px] lg:text-[15px] xl:min-h-[52px] xl:text-base 2xl:min-h-[56px] 2xl:text-[17px]"
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSearchQuery(newValue);
                  debouncedUpdateSearchParams(newValue);
                }}
              />
              <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-violet-400" />
            </span>
            {!readOnly && (
              <button
                className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-95 lg:min-h-[48px] lg:px-5 lg:text-[15px] xl:min-h-[52px] xl:px-6 xl:text-base 2xl:min-h-[56px]"
                onClick={() => {
                  setDialogState(initialDialogState);
                  setDialogMode(ActionType.add);
                  openDialog();
                }}
                type="button"
              >
                <FaPlus className="text-sm" />
                <span>Add New</span>
              </button>
            )}
          </div>
        )}
      </section>

      {!isVaultLocked && (
        <ul
          className="grid w-full grid-cols-1 gap-4 transition-opacity duration-200 md:grid-cols-2 lg:grid-cols-2"
          style={{ opacity: searchQuery === deferredSearchQuery ? 1 : 0.72 }}
        >
          {filteredPairs.map((pair) => (
            <StoredCard
              key={pair.id}
              pair={pair}
              editEntry={() => {
                setDialogState(pair);
                setDialogMode(ActionType.edit);
                openDialog();
              }}
              removeEntry={() => handleRemove(pair)}
              isCopied={clipboardText === pair.password}
              copyToClipboard={copyToClipboard}
              allowMutations={!readOnly}
            />
          ))}
        </ul>
      )}
      {(filteredPairs.length === 0 || isVaultLocked) && (
        <div className="glass animate-fade-in col-span-full w-full rounded-xl py-12 text-center text-white/40">
          {isVaultLocked
            ? "Unlock offline access to view stored domains."
            : searchQuery
              ? "No domains found matching your search."
              : readOnly
                ? "No offline entries are available on this device."
                : "No stored domains yet. Add one above!"}
        </div>
      )}

      {!readOnly && (
        <EntryDialog
          ref={dialogRef}
          onConfirm={handleConfirm}
          onCancel={closeDialog}
          dialogMode={dialogMode}
          dialogState={dialogState}
          setDialogState={setDialogState}
        />
      )}

      {patternDialogMode && (
        <OfflinePatternDialog
          pending={
            offlineAccess.state === "setup" || offlineAccess.state === "unlocking"
          }
          purpose={patternDialogMode}
          errorMessage={offlineAccess.errorMessage}
          onClose={() => setPatternDialogMode(null)}
          onSubmit={handlePatternSubmit}
        />
      )}
    </div>
  );
};
