"use client";

import { useRef, useState, useEffect, useTransition, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PasswordInput } from "./PasswordInput";
import { PasswordConfigEntry } from "../utils/models";
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
} from "../hooks";
import { StoredCard } from "./StoredCard";
import { EntryDialog, initialDialogState } from "./EntryDialog";
import { FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useViewTransition } from "../hooks/useViewTransition";

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
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("q") ?? "";

  const { generatePasswords, masterPassword, setMasterPassword } =
    usePasswordGenerator();

  let [pairs, setPairs] = useState<Pair[]>(entries);
  const isMutatingRef = useRef(false);

  useEffect(() => {
    // Skip sync if we're in the middle of a local mutation
    if (isMutatingRef.current) {
      isMutatingRef.current = false;
      return;
    }
    const update = async () => {
      const newPairs = await generatePasswords(entries, true);
      startViewTransition(() => {
        setPairs(newPairs);
      });
    };
    update();
  }, [entries]);

  const debouncedUpdatePairsWithPasswords = useDebounce(async () => {
    const newPairs = await generatePasswords(entries, true);
    setPairs(newPairs);
  }, 150);

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
    debouncedUpdatePairsWithPasswords();
  };

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  const filteredPairs = pairs.filter((pair) =>
    pair.url.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = async () => {
    closeDialog();
    const optimisticEntry = { ...dialogState };

    if (masterPassword) {
      const [entryWithPassword] = await generatePasswords(
        [optimisticEntry],
        true,
      );
      if (entryWithPassword) Object.assign(optimisticEntry, entryWithPassword);
    }

    // Update local state immediately for instant feedback
    if (dialogMode === ActionType.add) {
      setPairs((prev) => [...prev, optimisticEntry]);
    } else {
      setPairs((prev) =>
        prev.map((p) => (p.id === optimisticEntry.id ? optimisticEntry : p)),
      );
    }
    isMutatingRef.current = true;

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
        // Revert on error
        if (dialogMode === ActionType.add) {
          setPairs((prev) => prev.filter((p) => p.id !== optimisticEntry.id));
        } else {
          // Revert edit by restoring from entries prop
          const original = entries.find((e) => e.id === optimisticEntry.id);
          if (original) {
            const [originalWithPassword] = await generatePasswords(
              [original],
              true,
            );
            if (originalWithPassword) {
              setPairs((prev) =>
                prev.map((p) =>
                  p.id === optimisticEntry.id ? originalWithPassword : p,
                ),
              );
            }
          }
        }
      }
      setDialogState(initialDialogState);
    });
  };

  const handleRemove = async (pair: Pair) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to remove the entry for "${pair.url}"?`,
    );

    if (!isConfirmed) {
      return;
    }

    // Update local state immediately for instant feedback
    setPairs((prev) => prev.filter((p) => p.id !== pair.id));
    isMutatingRef.current = true;

    startTransition(async () => {
      try {
        await removeConfigEntry(pair.id);
      } catch (error) {
        toast.error("Failed to remove entry");
        // Revert on error by adding the pair back
        setPairs((prev) => [...prev, pair]);
      }
    });
  };

  return (
    <div className="animate-slide-up mx-auto flex w-full max-w-4xl flex-col items-center gap-8 p-6 lg:p-12">
      <section className="glass flex w-full flex-col gap-6 rounded-2xl p-6 lg:p-8">
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
              className="h-12"
            />
          </div>
          <span className="group relative flex-1">
            <input
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 text-white placeholder-white/40 transition-all outline-none focus:border-violet-500/50 focus:bg-white/10"
              placeholder="Search domains..."
              defaultValue={search}
              onChange={(e) => {
                debouncedUpdateSearchParams(e.target.value);
              }}
            />
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-violet-400" />
          </span>
          <button
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 font-semibold text-white transition-all hover:scale-105 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-95"
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

      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
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
          />
        ))}
      </ul>
      {filteredPairs.length === 0 && (
        <div className="glass animate-fade-in col-span-full w-full rounded-xl py-12 text-center text-white/40">
          {search
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
