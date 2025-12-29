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
      <Modal
        ref={ref}
        className={
          "top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1025] p-0 text-white shadow-2xl shadow-black/50"
        }
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white">
              {dialogMode === ActionType.add ? "Add New Domain" : "Edit Domain"}
            </h3>
            <p className="text-sm text-white/50">
              Configure your password settings for this domain.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                Domain URL
              </label>
              <input
                type="text"
                placeholder="e.g. google.com"
                value={dialogState.url}
                onChange={(e) => {
                  setDialogState({
                    ...dialogState,
                    url: e.target.value,
                  });
                }}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder-white/20 transition-all outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="domainToggle"
                  className="cursor-pointer text-sm font-medium text-white/80"
                >
                  Use Only Domain
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
              </div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="specialCharacterToggle"
                  className="cursor-pointer text-sm font-medium text-white/80"
                >
                  Convert Last Char to @
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
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Password Length
                </label>
                <span className="rounded bg-violet-500/10 px-2 py-1 text-xs font-bold text-violet-400">
                  {dialogState.length} chars
                </span>
              </div>
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
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              className="flex-1 rounded-xl bg-violet-600 p-3 font-semibold text-white transition-all hover:bg-violet-500 active:scale-95"
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
              {dialogMode === ActionType.add ? "Create Entry" : "Save Changes"}
            </button>
            <button
              className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
              type="button"
              id="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  },
);

EntryDialog.displayName = "EntryDialog";

export default EntryDialog;
