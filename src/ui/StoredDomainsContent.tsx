"use client";

import { useRef, useState, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";

import { PasswordInput } from "./PasswordInput";
import { PasswordConfigEntry } from "../utils/models";
import {
    onDialogSubmit,
    removeConfigEntry,
} from "../app/stored-domains/actions";
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

type Props = {
    entries: PasswordConfigEntry[];
};

export const StoredDomainsContent = ({ entries }: Props) => {
    const { clipboardText, copyToClipboard } = useClipboard();
    const [dialogState, setDialogState] =
        useState<PasswordConfigEntry>(initialDialogState);
    const [dialogMode, setDialogMode] = useState<
        ActionType.add | ActionType.edit
    >();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const { generatePasswords, masterPassword, setMasterPassword } =
        usePasswordGenerator();
    const [search, setSearch] = useState<string>("");

    let [pairs, setPairs] = useState<Pair[]>(entries);

    const containerRef = useRef<HTMLUListElement>(null);

    const debouncedUpdatePairsWithPasswords = useDebounce(async () => {
        setPairs(await generatePasswords(entries));
    });

    const onMasterPasswordChange = (value: string) => {
        setMasterPassword(value);
        debouncedUpdatePairsWithPasswords();
    };

    useEffect(() => {
        containerRef.current && autoAnimate(containerRef.current);
        dialogRef.current && autoAnimate(dialogRef.current);
    }, [containerRef, dialogRef]);

    useEffect(() => {
        async function updatePairsWithPasswords() {
            setPairs(await generatePasswords(entries, true));
        }

        updatePairsWithPasswords();
    }, [entries]);

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
                <span className="mt-4 flex w-full items-center rounded-lg bg-white p-3 text-slate-900 outline outline-0 outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
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
                            await removeConfigEntry(pair.id);
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
                    await onDialogSubmit(dialogMode, dialogState);
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
