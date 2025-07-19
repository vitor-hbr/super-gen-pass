import { forwardRef } from "react";
import { Modal } from "./Modal";
import { PasswordConfigEntry } from "../utils/models";
import { ActionType } from "../utils/constants";
import { Checkbox } from "./Checkbox";
import { toast } from "react-hot-toast";

export const initialDialogState: PasswordConfigEntry = {
    id: "",
    url: "",
    length: 14,
    forceSpecialCharacter: true,
    onlyDomain: false,
};

type Props = {
    dialogState: PasswordConfigEntry;
    setDialogState: (state: PasswordConfigEntry) => void;
    dialogMode: ActionType.add | ActionType.edit;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
};

export const EntryDialog = forwardRef<HTMLDialogElement, Props>(
    ({ dialogMode, dialogState, setDialogState, onConfirm, onCancel }, ref) => {
        return (
            <Modal ref={ref} className={"rounded-xl bg-gray-100 p-5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}>
                <span className="mb-4 flex w-full max-w-xs rounded-lg bg-white p-3 outline outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
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
                        onClick={() => {
                            if (dialogState.url.length > 0) onConfirm();
                            else
                                toast.error("Please enter an url", {
                                    iconTheme: {
                                        primary: "#7c3aed",
                                        secondary: "#fff",
                                    },
                                });
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
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </span>
            </Modal>
        );
    }
);

EntryDialog.displayName = "EntryDialog";

export default EntryDialog;
