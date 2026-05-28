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
import { PasswordInput } from "./PasswordInput";
import { PasswordConfigEntry } from "../utils/models";
import {
  addNewConfigEntry,
  removeConfigEntry,
  updateConfigEntry,
} from "../app/actions";
import { ActionType, TOAST_MESSAGES } from "../utils/constants";
import {
  useClipboard,
  usePasswordGenerator,
  useDebounce,
  Pair,
  useViewTransition,
} from "../hooks";
import { StoredCard } from "./StoredCard";
import { EntryDialog, initialDialogState } from "./EntryDialog";
import { FaPlus, FaSearch } from "./icons";
import { toast } from "./toast";

type Props = {
  entries: PasswordConfigEntry[];
};

export const StoredDomainsContent = ({ entries }: Props) => {
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

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

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
    const previousEntries = localEntries;
    const previousPairs = pairs;

    const optimisticEntry: PasswordConfigEntry = {
      ...dialogState,
      id:
        dialogMode === ActionType.add
          ? `optimistic-${crypto.randomUUID()}`
          : dialogState.id,
    };
    const optimisticPair: Pair = optimisticEntry;

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

  const handleGenerateAndCopy = async (pair: Pair) => {
    if (!masterPassword) {
      toast.error(TOAST_MESSAGES.missingInput);
      return;
    }

    const [pairWithPassword] = await generatePasswords([pair], true);
    if (!pairWithPassword?.password) {
      return;
    }

    startViewTransition(() => {
      setPairs((prev) =>
        prev.map((currentPair) =>
          currentPair.id === pair.id ? pairWithPassword : currentPair,
        ),
      );
    });
    copyToClipboard(pairWithPassword.password);
  };

  const handleRemove = async (pair: Pair) => {
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
            Manage your password configurations securely
          </p>
        </div>

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
          <button
            className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-95 lg:min-h-[48px] lg:px-5 lg:text-[15px] xl:min-h-[52px] xl:px-6 xl:text-base 2xl:min-h-[56px]"
            onClick={() => {
              setDialogState(initialDialogState);
              setDialogMode(ActionType.add);
              openDialog();
            }}
          >
            <FaPlus className="text-sm" />
            <span>Add New</span>
          </button>
        </div>
      </section>

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
            generateAndCopyPassword={() => handleGenerateAndCopy(pair)}
          />
        ))}
      </ul>
      {filteredPairs.length === 0 && (
        <div className="glass animate-fade-in col-span-full w-full rounded-xl py-12 text-center text-white/40">
          {searchQuery
            ? "No domains found matching your search."
            : "No stored domains yet. Add one above!"}
        </div>
      )}

      <EntryDialog
        ref={dialogRef}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
        dialogMode={dialogMode}
        dialogState={dialogState}
        setDialogState={setDialogState}
      />
    </div>
  );
};
