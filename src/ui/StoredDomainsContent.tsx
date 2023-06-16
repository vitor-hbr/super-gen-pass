"use client";

import { useRef, useState, useTransition } from "react";
import { PasswordInput } from "./PasswordInput";
import { Modal } from "./Modal";
import { Checkbox } from "./Checkbox";
import { DialogFormData } from "../utils/models";

type Props = {
    add: (data: DialogFormData) => Promise<void>;
    remove: (url: string) => Promise<void>;
    update: (data: DialogFormData) => Promise<void>;
    data: DialogFormData[];
};

export const StoredDomainsContent = ({ data, add, remove, update }: Props) => {
    const [masterPassword, setMasterPassword] = useState("");
    const [dialogState, setDialogState] = useState<DialogFormData>({
        url: "",
        length: 14,
        forceSpecialCharacter: true,
        onlyDomain: false,
    });
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [Pending, startTransition] = useTransition();
    function openDialog() {
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        dialogRef.current?.close();
    }

    async function onDialogSubmit() {
        if (dialogMode === "add") {
            await add(dialogState);
        } else {
            await update(dialogState);
        }
        closeDialog();
    }

    return (
        <>
            <PasswordInput
                onChange={(value) => setMasterPassword(value)}
                value={masterPassword}
                placeholder="Enter your master password"
                className="mb-2"
            />
            <span className="flex w-full flex-col gap-2">
                <button
                    className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:hover:text-white"
                    disabled={!masterPassword.length}
                >
                    Generate Passwords
                </button>
                <button
                    className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600"
                    onClick={openDialog}
                >
                    Add New Domain
                </button>
            </span>
            <div className="flex flex-col gap-2">
                {data.map((item) => (
                    <div
                        key={item.url}
                        className="flex flex-row items-center justify-between rounded-lg bg-white p-3 text-slate-900"
                    >
                        <span>{item.url}</span>
                        <span className="flex flex-row gap-2">
                            <button
                                className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600"
                                onClick={() => {
                                    setDialogState(item);
                                    setDialogMode("edit");
                                    openDialog();
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="flex flex-row items-center justify-center rounded-lg bg-violet-600 p-3 text-white transition-all hover:bg-white hover:text-violet-600"
                                onClick={() => remove(item.url)}
                            >
                                Remove
                            </button>
                        </span>
                    </div>
                ))}
            </div>
            <Modal ref={dialogRef} className={"rounded-xl bg-gray-100 p-5"}>
                <form action={() => startTransition(() => onDialogSubmit())}>
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
                            type="submit"
                        >
                            Create New Entry
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
                </form>
            </Modal>
        </>
    );
};
