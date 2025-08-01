"use client";

import { useRef, useState, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";

import { PasswordInput } from "./PasswordInput";
import { PasswordConfigEntry } from "../utils/models";
import { addNewConfigEntry, removeConfigEntry } from "../app/actions";
import { ActionType } from "../utils/constants";
import {
    useClipboard,
    usePasswordGenerator,
    useDebounce,
    Pair,
} from "../hooks";
import { StoredCard } from "./StoredCard";
import { EntryDialog, initialDialogState } from "./EntryDialog";
import { FaSearch } from "react-icons/fa";
import { mutate } from "swr";
import { toast } from "react-hot-toast";

type Props = {
    entries: PasswordConfigEntry[];
};

const confirmEntryEdit = async (entry: PasswordConfigEntry) => {
    mutate('stored-domains', (data: PasswordConfigEntry[] | undefined) => {
        if (!data) return [entry];
        return data.map((item) => {
            if (item.id === entry.id) {
                return entry;
            }
            return item;
        });
    });

    try {
        await addNewConfigEntry(entry);
        mutate('stored-domains');
    } catch (error) {
        toast.error('Failed to edit entry');
        mutate('stored-domains');
    }
}

const confirmEntryAdd = async (entry: PasswordConfigEntry) => {
    mutate('stored-domains', (data: PasswordConfigEntry[] | undefined) => {
        return [...(data || []), entry];
    });

    try {
        await addNewConfigEntry(entry);
        mutate('stored-domains');
    } catch (error) {
        toast.error('Failed to create entry');
        mutate('stored-domains');
    }
}

const handleRemoveEntry = async (entry: PasswordConfigEntry) => {
    const isConfirmed = window.confirm(
        `Are you sure you want to remove the entry for "${entry.url}"?`
    );
    
    if (!isConfirmed) {
        return;
    }

    mutate('stored-domains', (data: PasswordConfigEntry[] | undefined) => {
        return data ? data.filter((item) => item.id !== entry.id) : [];
    }, false);

    try {
        await removeConfigEntry(entry.id);
        mutate('stored-domains');
    } catch (error) {
        toast.error('Failed to remove entry');
        mutate('stored-domains');
    }
}

export const StoredDomainsContent = ({ entries }: Props) => {
    const { clipboardText, copyToClipboard } = useClipboard();
    const [dialogState, setDialogState] =
        useState<PasswordConfigEntry>(initialDialogState);
    const [dialogMode, setDialogMode] = useState<
        ActionType.add | ActionType.edit
    >(ActionType.add);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const { generatePasswords, masterPassword, setMasterPassword } =
        usePasswordGenerator();
    const [search, setSearch] = useState<string>("");

    let [pairs, setPairs] = useState<Pair[]>(entries);

    const containerRef = useRef<HTMLUListElement>(null);

    const debouncedUpdatePairsWithPasswords = useDebounce(async () => {
        setPairs(await generatePasswords(entries, true));
    });

    const onMasterPasswordChange = (value: string) => {
        setMasterPassword(value);
        debouncedUpdatePairsWithPasswords();
    };

    useEffect(() => {
        containerRef.current && autoAnimate(containerRef.current);
        dialogRef.current && autoAnimate(dialogRef.current);
    }, [containerRef, dialogRef]);

    function openDialog() {
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        dialogRef.current?.close();
    }

    const filteredPairs = pairs.filter((pair) =>
        pair.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="mx-auto flex w-full flex-col items-center gap-11 p-4 text-white lg:w-auto lg:p-8">
            <section className="flex w-full flex-col gap-2">
                <h3 className="mx-auto pb-5">Stored Domains</h3>
                <PasswordInput
                    onChange={onMasterPasswordChange}
                    value={masterPassword}
                    placeholder="Enter your master password"
                />
                <button
                    className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600"
                    onClick={() => {
                        setDialogMode(ActionType.add);
                        openDialog();
                    }}
                >
                    Add New Domain
                </button>
                <span className="mt-4 flex w-full items-center rounded-lg bg-white p-3 text-slate-900 outline outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
                    <input
                        className="w-full  outline-none"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <FaSearch className="text-violet-600" />
                </span>
            </section>
            <ul className="flex w-full flex-col gap-4" ref={containerRef}>
                {filteredPairs.map((pair) => (
                    <StoredCard
                        key={pair.id}
                        pair={pair}
                        editEntry={() => {
                            setDialogState(pair);
                            setDialogMode(ActionType.edit);
                            openDialog();
                        }}
                        removeEntry={async () => {
                            await handleRemoveEntry(pair);
                        }}
                        isCopied={clipboardText === pair.password}
                        copyToClipboard={copyToClipboard}
                    />
                ))}
            </ul>
            <EntryDialog
                ref={dialogRef}
                onConfirm={async () => {
                    closeDialog();
                    if (dialogMode === ActionType.add) {
                        await confirmEntryAdd(dialogState);
                    } else {
                        await confirmEntryEdit(dialogState);
                    }
                    setDialogState(initialDialogState);
                }}
                onCancel={closeDialog}
                dialogMode={dialogMode}
                dialogState={dialogState}
                setDialogState={setDialogState}
            />
        </div>
    );
};
