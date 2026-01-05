import { useState } from "react";
import toast from "react-hot-toast";

import { FaEye, FaEyeSlash, FaPencilAlt, FaTrash } from "react-icons/fa";
import { Pair } from "../hooks/usePasswordGenerator";
import { useViewTransition } from "../hooks/useViewTransition";

export const StoredCard = ({
  pair,
  isCopied,
  editEntry,
  removeEntry,
  copyToClipboard,
}: {
  pair: Pair;
  isCopied: boolean;
  editEntry: () => void;
  removeEntry: () => void;
  copyToClipboard: (text: string) => void;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { startViewTransition } = useViewTransition();

  const togglePasswordVisibility = () => {
    startViewTransition(() => {
      setIsPasswordVisible(!isPasswordVisible);
    });
  };

  const copyPassword = () => {
    if (pair.password) copyToClipboard(pair.password);
    else
      toast.error("No password generated!", {
        iconTheme: {
          primary: "#7c3aed",
          secondary: "#fff",
        },
      });
  };

  return (
    <li
      onClick={copyPassword}
      className={`glass-hover group animate-fade-in flex w-full cursor-pointer flex-row items-center justify-between gap-4 rounded-xl border bg-white/5 p-3 transition-all duration-300 hover:bg-white/10 lg:p-4 xl:p-5 ${
        isCopied
          ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:border-green-500/50"
          : "border-white/5"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePasswordVisibility();
          }}
          className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-white/10 hover:bg-white/20"
        >
          {!isPasswordVisible && <FaEye className="h-4 w-4 text-violet-400" />}
          {isPasswordVisible && (
            <FaEyeSlash className="h-4 w-4 text-violet-400" />
          )}
        </button>
        <span className="w-full truncate text-base font-medium text-white/80 transition-colors group-hover:text-white">
          {!isPasswordVisible && pair.url}
          {isPasswordVisible && (pair.password || "No password generated")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            editEntry();
          }}
          className="rounded-lg p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white"
          title="Edit"
        >
          <FaPencilAlt className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeEntry();
          }}
          className="rounded-lg p-2 text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400"
          title="Delete"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};
