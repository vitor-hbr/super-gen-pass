"use client";

import React, { useEffect, useState } from "react";
import { FaKey, FaClipboard, FaClipboardCheck, FaCog } from "react-icons/fa";
import autoAnimate from "@formkit/auto-animate";

import { Checkbox } from "./Checkbox";
import { PasswordInput } from "./PasswordInput";
import { usePasswordGenerator, useClipboard } from "../hooks";
import { Pair } from "../hooks/usePasswordGenerator";

export const SinglePasswordGenerator = () => {
    const [pairs, setPairs] = useState<Pair[]>([
        {
            id: "1",
            url: "",
            password: "",
            onlyDomain: false,
            length: 14,
            forceSpecialCharacter: true,
        },
    ]);
    const {
        masterPassword,
        setMasterPassword,
        generatePasswords,
        maskPassword,
    } = usePasswordGenerator();
    const { clipboardText, copyToClipboard } = useClipboard();
    const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
        useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const containerRef = React.useRef(null);

    const currentPair = pairs[0];

    useEffect(() => {
        containerRef.current && autoAnimate(containerRef.current);
    }, [containerRef]);

    return (
        <main
            className="flex w-full max-w-sm select-none flex-col items-center justify-center rounded-lg bg-gradient-to-b from-violet-500 via-violet-700 to-violet-900 p-6 text-white"
            ref={containerRef}
        >
            <PasswordInput
                onChange={(value) => setMasterPassword(value)}
                value={masterPassword}
                placeholder="Enter your master password"
                className="mb-4 max-w-xs"
            />

            <span className="mb-4 flex w-full max-w-xs rounded-lg bg-white p-3 outline outline-0 outline-offset-4 outline-gray-900 drop-shadow-sm focus-within:outline-1">
                <input
                    type="text"
                    placeholder="Enter the address of the site"
                    value={currentPair?.url ?? ""}
                    onChange={(e) => {
                        setPairs([
                            {
                                ...currentPair,
                                url: e.target.value,
                                password: "",
                            },
                        ]);
                    }}
                    className="text-sm w-full text-slate-900 outline-none"
                />
            </span>
            <span className="flex drop-shadow-sm">
                {!currentPair.password ? (
                    <button
                        onClick={() => {
                            generatePasswords(pairs);

                            (document.activeElement as HTMLElement).blur();
                        }}
                        className="flex flex-row items-center justify-center rounded-lg bg-white p-3 text-violet-600 transition-all hover:bg-slate-900 hover:text-white"
                    >
                        <label className="cursor-pointer pr-3">
                            Generate Password
                        </label>
                        {<FaKey width={32} height={32} />}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() =>
                                setIsGeneratedPasswordVisible((prev) => !prev)
                            }
                            className="rounded-lg rounded-r-none bg-white p-3 text-violet-600 transition-all hover:bg-slate-900 hover:text-white"
                        >
                            {isGeneratedPasswordVisible
                                ? currentPair?.password
                                : maskPassword(currentPair?.password)}
                        </button>
                        <button
                            onClick={() =>
                                copyToClipboard(currentPair.password)
                            }
                            className="rounded-lg rounded-l-none bg-white p-3 text-violet-600 hover:bg-slate-900 hover:text-white"
                        >
                            {clipboardText === currentPair.password ? (
                                <FaClipboardCheck width={32} height={32} />
                            ) : (
                                <FaClipboard width={32} height={32} />
                            )}
                        </button>
                    </>
                )}
                <button
                    onClick={() => setShowSettings((s) => !s)}
                    className="p-3"
                >
                    <FaCog
                        width={32}
                        height={32}
                        className="transition-all hover:text-slate-900"
                    />
                </button>
            </span>

            {showSettings && (
                <section className="flex w-full flex-col pt-5">
                    <span className="flex items-center pb-5">
                        <label
                            htmlFor="domainToggle"
                            className="cursor-pointer pr-3"
                        >
                            Use Only Domain?
                        </label>
                        <Checkbox
                            onChange={(checked) =>
                                setPairs([
                                    {
                                        ...currentPair,

                                        onlyDomain: checked,
                                    },
                                ])
                            }
                            checked={currentPair.onlyDomain}
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
                                setPairs([
                                    {
                                        ...currentPair,

                                        forceSpecialCharacter: checked,
                                    },
                                ])
                            }
                            checked={currentPair.forceSpecialCharacter}
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
                                    setPairs([
                                        {
                                            ...currentPair,

                                            length: parseInt(e.target.value),
                                        },
                                    ])
                                }
                                min={4}
                                max={24}
                                step={1}
                                value={currentPair.length}
                                className="h-2 w-[115px] cursor-pointer appearance-none rounded bg-white transition-all md:w-[180px]"
                            />
                            <span>{currentPair.length}</span>
                        </div>
                    </span>
                </section>
            )}
        </main>
    );
};
