"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import useSWR from "swr";

import { useAuth } from "../contexts/AuthContext";
import { SinglePasswordGenerator, StoredDomainsContent } from "../ui";
import { createClient } from "../utils/supabase/client";
import { DATABASE_TABLES } from "../utils/database.types";
import {
  OfflineAccessState,
  OfflineVaultSummary,
  PasswordConfigEntry,
  PatternSequence,
} from "../utils/models";
import {
  OfflineAccessError,
  clearOfflineAccessSession,
  disableOfflineAccess,
  enableOfflineAccessWithBiometrics,
  enableOfflineAccessWithGrid,
  getOfflineEnvironmentSupport,
  getOfflineVaultSummary,
  isOfflineAccessSupported,
  resetOfflineAccess,
  syncOfflineVault,
  unlockOfflineAccessWithBiometrics,
  unlockOfflineAccessWithGrid,
} from "../utils/offline-access";

interface HomePageClientProps {
  initialEntries: PasswordConfigEntry[];
}

type OfflineSupportState = {
  available: boolean;
  reason: string | null;
  platformAuthenticator: boolean;
  webauthnPrf: boolean;
  method: "webauthn-prf" | "grid";
};

const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from(DATABASE_TABLES.configs).select();

  if (error) {
    throw error;
  }

  return data as PasswordConfigEntry[];
};

export function HomePageClient({ initialEntries }: HomePageClientProps) {
  const { user, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [offlineSupport, setOfflineSupport] = useState<OfflineSupportState>({
    available: false,
    reason: null as string | null,
    platformAuthenticator: false,
    webauthnPrf: false,
    method: "grid" as const,
  });
  const [offlineSummary, setOfflineSummary] = useState<OfflineVaultSummary>({
    hasVault: false,
    method: null,
    userId: null,
    updatedAt: null,
  });
  const [offlineEntries, setOfflineEntries] = useState<PasswordConfigEntry[]>([]);
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [offlineTransientState, setOfflineTransientState] = useState<
    "idle" | "setup" | "unlocking" | "error"
  >("idle");

  const { data: entries, mutate: mutateEntries } = useSWR(
    user && isOnline ? "stored-domains" : null,
    fetcher,
    {
      fallbackData: initialEntries,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const supabase = createClient();

  const readOfflineSnapshot = useCallback(async () => {
    const environment = getOfflineEnvironmentSupport();

    if (!environment.available) {
      return {
        support: {
          available: false,
          reason: environment.reason,
          platformAuthenticator: false,
          webauthnPrf: false,
          method: "grid" as const,
        },
        summary: {
          hasVault: false,
          method: null,
          userId: null,
          updatedAt: null,
        } satisfies OfflineVaultSummary,
      };
    }

    const [support, summary] = await Promise.all([
      isOfflineAccessSupported(),
      getOfflineVaultSummary(),
    ]);

    return {
      support: {
        available: true,
        reason: null,
        ...support,
      },
      summary,
    };
  }, []);

  const applyOfflineSnapshot = useCallback(
    (snapshot: {
      support: {
        available: boolean;
        reason: string | null;
        platformAuthenticator: boolean;
        webauthnPrf: boolean;
        method: "webauthn-prf" | "grid";
      };
      summary: OfflineVaultSummary;
    }) => {
      startTransition(() => {
        setOfflineSupport(snapshot.support);
        setOfflineSummary(snapshot.summary);
      });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const loadSnapshot = async () => {
      const snapshot = await readOfflineSnapshot();
      if (!cancelled) {
        applyOfflineSnapshot(snapshot);
      }
    };

    loadSnapshot().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [applyOfflineSnapshot, readOfflineSnapshot]);

  useEffect(() => {
    const handleConnectionChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  }, []);

  useEffect(() => {
    if (!user || !isOnline) {
      return;
    }

    const channel = supabase
      .channel("stored-domains-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: DATABASE_TABLES.configs,
        },
        () => {
          mutateEntries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, mutateEntries, supabase, user]);

  useEffect(() => {
    if (!user || !isOnline || !entries || !offlineSummary.hasVault) {
      return;
    }

    syncOfflineVault(entries, user.id)
      .then(async () => {
        applyOfflineSnapshot(await readOfflineSnapshot());
      })
      .catch((error) => {
        if (error instanceof OfflineAccessError && error.code === "vault-locked") {
          return;
        }

        if (error instanceof OfflineAccessError && error.code === "user-mismatch") {
          setOfflineTransientState("error");
          setOfflineError(error.message);
        }
      });
  }, [applyOfflineSnapshot, entries, isOnline, offlineSummary.hasVault, readOfflineSnapshot, user]);

  const ownerMismatch = Boolean(
    user && offlineSummary.userId && offlineSummary.userId !== user.id,
  );
  const effectiveOfflineError = ownerMismatch
    ? "This device has offline data for a different account. Reset offline access to continue."
    : offlineError;

  const offlineAccessState: OfflineAccessState = useMemo(() => {
    if (ownerMismatch || offlineTransientState === "error") {
      return "error";
    }
    if (offlineTransientState === "setup") {
      return "setup";
    }
    if (offlineTransientState === "unlocking") {
      return "unlocking";
    }
    if (!offlineSummary.hasVault) {
      return "disabled";
    }
    if (!isOnline && offlineEntries.length > 0) {
      return "unlocked";
    }
    return isOnline ? "enabled" : "locked";
  }, [isOnline, offlineEntries.length, offlineSummary.hasVault, offlineTransientState, ownerMismatch]);

  const runOfflineAction = useCallback(
    async <T,>(state: "setup" | "unlocking", action: () => Promise<T>) => {
      setOfflineTransientState(state);
      setOfflineError(null);

      try {
        const result = await action();
        setOfflineTransientState("idle");
        applyOfflineSnapshot(await readOfflineSnapshot());
        return result;
      } catch (error) {
        const normalizedError =
          error instanceof OfflineAccessError
            ? error
            : new OfflineAccessError(
                "unlock-failed",
                error instanceof Error ? error.message : "Offline access failed.",
              );
        setOfflineTransientState("error");
        setOfflineError(normalizedError.message);
        throw normalizedError;
      }
    },
    [applyOfflineSnapshot, readOfflineSnapshot],
  );

  const handleEnableBiometrics = useCallback(async () => {
    if (!user || !isOnline) {
      throw new OfflineAccessError(
        "unsupported-environment",
        "Go online and sign in before enabling offline access.",
      );
    }

    await runOfflineAction("setup", async () => {
      await enableOfflineAccessWithBiometrics(entries ?? [], user.id);
      toast.success("Offline access enabled for this device.");
    });
  }, [entries, isOnline, runOfflineAction, user]);

  const handleEnableGrid = useCallback(
    async (pattern: PatternSequence) => {
      if (!user || !isOnline) {
        throw new OfflineAccessError(
          "unsupported-environment",
          "Go online and sign in before enabling offline access.",
        );
      }

      await runOfflineAction("setup", async () => {
        await enableOfflineAccessWithGrid(entries ?? [], user.id, pattern);
        toast.success("Offline access enabled for this device.");
      });
    },
    [entries, isOnline, runOfflineAction, user],
  );

  const handleUnlockBiometrics = useCallback(async () => {
    const payload = await runOfflineAction("unlocking", async () => {
      return unlockOfflineAccessWithBiometrics();
    });

    if (user && payload.userId !== user.id) {
      setOfflineTransientState("error");
      setOfflineError("The offline vault belongs to a different account.");
      throw new OfflineAccessError(
        "user-mismatch",
        "The offline vault belongs to a different account.",
      );
    }

    setOfflineEntries(payload.entries);
  }, [runOfflineAction, user]);

  const handleUnlockGrid = useCallback(
    async (pattern: PatternSequence) => {
      const payload = await runOfflineAction("unlocking", async () => {
        return unlockOfflineAccessWithGrid(pattern);
      });

      if (user && payload.userId !== user.id) {
        setOfflineTransientState("error");
        setOfflineError("The offline vault belongs to a different account.");
        throw new OfflineAccessError(
          "user-mismatch",
          "The offline vault belongs to a different account.",
        );
      }

      setOfflineEntries(payload.entries);
    },
    [runOfflineAction, user],
  );

  const handleDisableOfflineAccess = useCallback(async () => {
    await disableOfflineAccess();
    setOfflineEntries([]);
    setOfflineError(null);
    setOfflineTransientState("idle");
    applyOfflineSnapshot(await readOfflineSnapshot());
  }, [applyOfflineSnapshot, readOfflineSnapshot]);

  const handleResetOfflineAccess = useCallback(async () => {
    await resetOfflineAccess();
    setOfflineEntries([]);
    setOfflineError(null);
    setOfflineTransientState("idle");
    applyOfflineSnapshot(await readOfflineSnapshot());
  }, [applyOfflineSnapshot, readOfflineSnapshot]);

  const shouldRenderStoredDomains =
    Boolean(user) || !isOnline || offlineSummary.hasVault;
  const usingOfflineEntries = !isOnline && offlineSummary.hasVault && !ownerMismatch;
  const renderedEntries = !isOnline
    ? usingOfflineEntries && offlineAccessState === "unlocked"
      ? offlineEntries
      : []
    : entries || [];
  const readOnly = !isOnline || !user;

  if (loading && !shouldRenderStoredDomains) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ viewTransitionName: "page-content" }}
      >
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  if (shouldRenderStoredDomains) {
    return (
      <StoredDomainsContent
        entries={renderedEntries}
        readOnly={readOnly}
        offlineAccess={{
          errorMessage: effectiveOfflineError,
          isOnline,
          ownerMismatch,
          state: offlineAccessState,
          summary: offlineSummary,
          support: offlineSupport,
          usingOfflineEntries,
          onDisable: handleDisableOfflineAccess,
          onEnableBiometrics: handleEnableBiometrics,
          onEnableGrid: handleEnableGrid,
          onReset: handleResetOfflineAccess,
          onUnlockBiometrics: handleUnlockBiometrics,
          onUnlockGrid: handleUnlockGrid,
        }}
      />
    );
  }

  return (
    <div
      className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-6 font-sans md:flex-row md:gap-12 lg:gap-24"
      style={{ viewTransitionName: "page-content" }}
    >
      <div className="mb-12 flex w-full max-w-[500px] flex-col justify-center text-center md:mb-0 md:text-left">
        <div className="animate-slide-up [animation-duration:1s]">
          <h1 className="font-display animate-gradient-text bg-300% bg-gradient-to-r from-violet-400 via-fuchsia-300 to-violet-400 bg-clip-text pb-4 text-transparent">
            Super Gen Pass
          </h1>
        </div>
        <p className="animate-fade-in text-lg leading-relaxed text-indigo-100/80 [animation-delay:200ms]">
          A smarter way to manage passwords without a single point of failure.
          Generate unique, secure passwords for every domain using just one
          master key.
        </p>
      </div>

      <div className="animate-fade-in [animation-delay:400ms]">
        <SinglePasswordGenerator />
      </div>
    </div>
  );
}
