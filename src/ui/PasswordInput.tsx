"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const PasswordInput = ({ onChange, value, placeholder }: Props) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <span className="mb-4 flex w-full max-w-xs rounded-lg bg-white p-3 outline outline-0 outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
      <input
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm w-full text-slate-900 outline-none"
      />
      <button
        onClick={() => setIsVisible((s) => !s)}
        className="ml-3 flex items-center justify-center"
      >
        {!isVisible ? (
          <FaEyeSlash
            width={32}
            height={32}
            className="text-violet-600 transition-all hover:text-slate-900"
          />
        ) : (
          <FaEye
            width={32}
            height={32}
            className="text-violet-600 transition-all hover:text-slate-900"
          />
        )}
      </button>
    </span>
  );
};
