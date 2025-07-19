import { useEffect, useRef, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import toast from "react-hot-toast";

import {
    FaClipboard,
    FaClipboardCheck,
    FaEye,
    FaEyeSlash,
    FaPencilAlt,
    FaTrash,
} from "react-icons/fa";
import { Pair } from "../hooks/usePasswordGenerator";

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
    const containerRef = useRef<HTMLButtonElement>(null);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
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

    useEffect(() => {
        containerRef.current && autoAnimate(containerRef.current);
    }, [containerRef]);

    return (
        <li className="flex w-full items-center gap-2 rounded-md bg-gray-50 p-4 outline-2 outline-offset-1 outline-violet-600">
            <button
                onClick={togglePasswordVisibility}
                className="flex w-full items-center gap-2 text-gray-500 hover:text-gray-700"
                ref={containerRef}
            >
                {!isPasswordVisible && <FaEye className="h-5 w-5" />}
                {isPasswordVisible && <FaEyeSlash className="h-5 w-5" />}
                <span className="text-sm w-full overflow-clip text-ellipsis text-left outline-none">
                    {!isPasswordVisible && pair.url}
                    {isPasswordVisible &&
                        (pair.password || "No password generated")}
                </span>
            </button>

            <div className="flex gap-2 text-violet-600">
                <FaPencilAlt
                    onClick={editEntry}
                    className="h-5 w-5 cursor-pointer hover:text-violet-800"
                />
                <FaTrash
                    onClick={removeEntry}
                    className="h-5 w-5 cursor-pointer hover:text-violet-800"
                />
                {isCopied ? (
                    <FaClipboardCheck className="h-5 w-5 cursor-pointer hover:text-violet-800" />
                ) : (
                    <FaClipboard
                        className="h-5 w-5 cursor-pointer hover:text-violet-800"
                        onClick={copyPassword}
                    />
                )}
            </div>
        </li>
    );
};
