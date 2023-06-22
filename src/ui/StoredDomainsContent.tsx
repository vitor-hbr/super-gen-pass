"use client";

import {
    useRef,
    useState,
    experimental_useOptimistic as useOptimistic,
    useEffect,
} from "react";
import { PasswordInput } from "./PasswordInput";
import { Modal } from "./Modal";
import { Checkbox } from "./Checkbox";
import { DialogFormData } from "../utils/models";
import {
    onDialogSubmit,
    removeConfigEntry,
} from "../app/stored-domains/actions";
import { ActionType } from "../utils/constants";
import { useClipboard, usePasswordGenerator } from "../hooks";
import { StoredCard } from "./StoredCard";
import autoAnimate from "@formkit/auto-animate";

type Props = {
    entries: DialogFormData[];
};

type ActionParams = DialogFormData | { url: string };

function checkActionParamsIsFormData(
    params: ActionParams
): params is DialogFormData {
    return (params as DialogFormData).id !== undefined;
}

const initialDialogState: DialogFormData = {
    id: "",
    url: "",
    length: 14,
    forceSpecialCharacter: true,
    onlyDomain: false,
};

export const StoredDomainsContent = ({ entries }: Props) => {
    const { clipboardText, copyToClipboard } = useClipboard();

    const [dialogState, setDialogState] =
        useState<DialogFormData>(initialDialogState);
    const [dialogMode, setDialogMode] = useState<
        ActionType.add | ActionType.edit
    >();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [optimisticEntries, setOptimisticEntries] = useOptimistic(
        entries,
        (
            entries,
            {
                action,
                params,
            }: {
                action: ActionType;
                params: ActionParams;
            }
        ) => {
            const hasState = checkActionParamsIsFormData(params);

            if (action === ActionType.add) {
                if (!hasState) return entries;

                return [...entries, params];
            }
            if (action === ActionType.edit) {
                if (!hasState) return entries;

                return entries.map((item) => {
                    if (item.id === params.id) {
                        return params;
                    }
                    return item;
                });
            }
            if (action === ActionType.remove) {
                if (hasState) return entries;

                return entries.filter((item) => item.url !== params.url);
            }
        }
    );
    const { generatePasswords, masterPassword, setMasterPassword, pairs } =
        usePasswordGenerator({
            initialPairs: optimisticEntries.map((item) => ({
                ...item,
                password: "",
            })),
        });

    const containerRef = useRef<HTMLUListElement>(null);

    function openDialog() {
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        dialogRef.current?.close();
    }

    useEffect(() => {
        containerRef.current && autoAnimate(containerRef.current);
    }, [containerRef]);

    return (
        <div className="mx-auto flex w-full flex-col items-center gap-11 p-4 text-white lg:w-auto lg:p-8">
            <section className="flex w-full flex-col gap-2">
                <h3 className="mx-auto pb-5">Stored Domains</h3>
                <PasswordInput
                    onChange={(value) => setMasterPassword(value)}
                    value={masterPassword}
                    placeholder="Enter your master password"
                />
                <button
                    className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:hover:text-white"
                    disabled={!masterPassword.length}
                    onClick={generatePasswords}
                >
                    Generate Passwords
                </button>
                <button
                    className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600"
                    onClick={() => {
                        setDialogMode(ActionType.add);
                        openDialog();
                    }}
                >
                    Add New Domain
                </button>
            </section>
            <ul className="flex w-full flex-col gap-4" ref={containerRef}>
                {pairs.map((pair) => (
                    <StoredCard
                        pair={pair}
                        editEntry={() => {
                            setDialogState(pair);
                            setDialogMode(ActionType.edit);
                            openDialog();
                        }}
                        removeEntry={async () => {
                            setOptimisticEntries({
                                action: ActionType.remove,
                                params: { url: pair.url },
                            });
                            await removeConfigEntry(pair.url);
                        }}
                        isCopied={clipboardText === pair.password}
                        copyToClipboard={copyToClipboard}
                    />
                ))}
            </ul>
            <Modal ref={dialogRef} className={"rounded-xl bg-gray-100 p-5"}>
                <span className="mb-4 flex w-full max-w-xs rounded-lg bg-white p-3 outline outline-0 outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
                    <input
                        type="text"
                        placeholder="Enter the address of the site"
                        value={dialogState.url}
                        onChange={(e) => {
                            setDialogState({
                                ...dialogState,
                                url: e.target.value,
                            });
                        }}
                        className="text-sm w-full text-slate-900 outline-none"
                    />
                </span>
                <span className="flex items-center pb-5">
                    <label
                        htmlFor="domainToggle"
                        className="cursor-pointer pr-3"
                    >
                        Use Only Domain?
                    </label>
                    <Checkbox
                        onChange={(checked) =>
                            setDialogState({
                                ...dialogState,
                                onlyDomain: checked,
                            })
                        }
                        checked={dialogState.onlyDomain}
                        uuid="domainToggle"
                    />
                </span>
                <span className="flex items-center pb-5">
                    <label
                        htmlFor="specialCharacterToggle"
                        className="cursor-pointer pr-3"
                    >
                        Convert Last Character to @?
                    </label>
                    <Checkbox
                        onChange={(checked) =>
                            setDialogState({
                                ...dialogState,
                                forceSpecialCharacter: checked,
                            })
                        }
                        checked={dialogState.forceSpecialCharacter}
                        uuid="specialCharacterToggle"
                    />
                </span>
                <span className="flex">
                    <label className="pr-3">Length of Password</label>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <input
                            type="range"
                            id="generatedLength"
                            onChange={(e) =>
                                setDialogState({
                                    ...dialogState,
                                    length: Number(e.target.value),
                                })
                            }
                            min={4}
                            max={24}
                            step={1}
                            value={dialogState.length}
                            className="h-2 w-[115px] cursor-pointer appearance-none rounded bg-white transition-all md:w-[180px]"
                        />
                        <span>{dialogState.length}</span>
                    </div>
                </span>
                <span className="flex w-full flex-col gap-2">
                    <button
                        className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-gray-900"
                        type="button"
                        onClick={async (e) => {
                            closeDialog();
                            setOptimisticEntries({
                                action: dialogMode,
                                params: dialogState,
                            });
                            await onDialogSubmit(dialogMode, dialogState);
                            setDialogState(initialDialogState);
                        }}
                    >
                        {dialogMode === ActionType.add
                            ? "Create New Entry"
                            : "Update Entry"}
                    </button>
                    <button
                        className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-gray-900 "
                        type="button"
                        id="cancel-button"
                        onClick={closeDialog}
                    >
                        Cancel
                    </button>
                </span>
            </Modal>
        </div>
    );
};
