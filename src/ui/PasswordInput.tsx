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
        className="h-full min-h-[44px] w-full rounded-xl bg-transparent px-4 py-3 pr-10 text-sm text-white placeholder-white/40 outline-none lg:min-h-[48px] lg:text-[15px] xl:min-h-[52px] xl:text-base 2xl:min-h-[56px] 2xl:text-[17px]"
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
