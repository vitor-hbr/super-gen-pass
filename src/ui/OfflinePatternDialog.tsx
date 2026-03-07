"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { PatternSequence } from "../utils/models";
import { playGridTone } from "../utils/audio/gridTones";

type Props = {
  pending: boolean;
  purpose: "setup" | "unlock";
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (pattern: PatternSequence) => Promise<void>;
};

const GRID_CELLS = Array.from({ length: 9 }, (_, index) => index);

function isSequenceComplete(sequence: number[]): sequence is PatternSequence {
  return sequence.length === 5;
}

function isInvalidPattern(sequence: number[]) {
  return sequence.length === 5 && sequence.every((value) => value === sequence[0]);
}

export const OfflinePatternDialog = ({
  pending,
  purpose,
  errorMessage,
  onClose,
  onSubmit,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [firstPattern, setFirstPattern] = useState<PatternSequence | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSetupConfirmation = purpose === "setup" && firstPattern !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();
  }, []);

  const onDialogClose = () => {
    onClose();
  };

  const appendCell = async (cell: number) => {
    if (pending || sequence.length >= 5) {
      return;
    }

    await playGridTone(cell);
    setLocalError(null);
    setSequence((current) => [...current, cell]);
  };

  const resetSequence = () => {
    setSequence([]);
    setLocalError(null);
  };

  const handleSubmit = async () => {
    if (!isSequenceComplete(sequence)) {
      return;
    }

    if (isInvalidPattern(sequence)) {
      setLocalError("Use at least two different cells in your five taps.");
      return;
    }

    if (purpose === "setup" && !isSetupConfirmation) {
      setFirstPattern(sequence);
      setSequence([]);
      setLocalError(null);
      return;
    }

    if (
      purpose === "setup" &&
      isSetupConfirmation &&
      firstPattern?.join("-") !== sequence.join("-")
    ) {
      setLocalError("Patterns did not match. Start again.");
      setSequence([]);
      setFirstPattern(null);
      return;
    }

    await onSubmit(sequence);
  };

  const helperText =
    purpose === "setup"
      ? isSetupConfirmation
        ? "Repeat the same five taps to confirm."
        : "Choose five taps on the 3x3 grid. Repeats are allowed."
      : "Enter your saved five-tap pattern to unlock offline access.";

  return (
    <Modal
      ref={dialogRef}
      onClose={onDialogClose}
      className="top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1025] p-0 text-white shadow-2xl shadow-black/50"
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-white">
            {purpose === "setup" ? "Set up sound-grid unlock" : "Unlock offline access"}
          </h3>
          <p className="text-sm text-white/60">{helperText}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {GRID_CELLS.map((cell) => (
            <button
              key={cell}
              type="button"
              className="aspect-square rounded-xl border border-white/10 bg-white/5 text-lg font-semibold text-white/80 transition-all hover:border-violet-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pending || sequence.length >= 5}
              onClick={() => appendCell(cell)}
            >
              {cell + 1}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-white/60">
            <span>{isSetupConfirmation ? "Confirm pattern" : "Current pattern"}</span>
            <span>{sequence.length}/5 taps</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`h-3 flex-1 rounded-full ${
                  sequence[index] === undefined ? "bg-white/10" : "bg-violet-400"
                }`}
              />
            ))}
          </div>
        </div>

        {(localError || errorMessage) && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {localError || errorMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={resetSequence}
            disabled={pending || sequence.length === 0}
          >
            Clear
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-violet-600 p-3 font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleSubmit}
            disabled={!isSequenceComplete(sequence) || pending}
          >
            {pending
              ? "Working..."
              : purpose === "setup"
                ? isSetupConfirmation
                  ? "Save Pattern"
                  : "Continue"
                : "Unlock"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
