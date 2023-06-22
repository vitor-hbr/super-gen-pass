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
    const [isVisible, setIsVisible] = useState(true);

    return (
        <span
            className={clsx(
                "flex w-full rounded-lg bg-white p-3 outline outline-0 outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1",
                className
            )}
        >
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
                {isVisible && (
                    <FaEye className="h-5 w-5 text-violet-600 hover:text-violet-800" />
                )}
                {!isVisible && (
                    <FaEyeSlash className="h-5 w-5 text-violet-600 hover:text-violet-800" />
                )}
            </button>
        </span>
    );
};
