"use client";

import clsx from "clsx";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const PasswordInput = ({
  onChange,
  value,
  placeholder,
  className,
}: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className={clsx(
        "group relative flex w-full rounded-xl border border-white/10 bg-white/5 transition-all focus-within:border-violet-500/50 focus-within:bg-white/10",
        className,
      )}
    >
      <input
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full rounded-xl bg-transparent px-4 py-3 pr-12 text-white placeholder-white/40 outline-none"
      />
      <button
        onClick={() => setIsVisible((s) => !s)}
        className="absolute top-0 right-0 flex h-full cursor-pointer items-center justify-center px-4 text-white/40 transition-colors hover:text-white"
      >
        {isVisible && <FaEyeSlash className="h-5 w-5" />}
        {!isVisible && <FaEye className="h-5 w-5" />}
      </button>
    </span>
  );
};
