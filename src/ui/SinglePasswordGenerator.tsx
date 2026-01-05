"use client";

import React, { useEffect, useState } from "react";
import { FaKey, FaClipboard, FaClipboardCheck, FaCog } from "react-icons/fa";

import { Checkbox } from "./Checkbox";
import { PasswordInput } from "./PasswordInput";
import { usePasswordGenerator, useClipboard, useDebounce } from "../hooks";
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
  const { masterPassword, setMasterPassword, generatePasswords, maskPassword } =
    usePasswordGenerator();
  const { clipboardText, copyToClipboard } = useClipboard();
  const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentPair = pairs[0]!;

  const handleGenerate = useDebounce(async (currentPairs: Pair[]) => {
    const newPairs = await generatePasswords(currentPairs);
    setPairs(newPairs);
  }, 150);

  return (
    <main className="glass flex w-full max-w-[400px] flex-col items-center justify-center rounded-2xl p-5 text-white transition-all duration-300 select-none hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] lg:max-w-[480px] lg:p-6 xl:max-w-[560px] xl:p-8 2xl:max-w-[640px] 2xl:p-10">
      <PasswordInput
        onChange={(value) => setMasterPassword(value)}
        value={masterPassword}
        placeholder="Enter your master password"
        className="mb-6 w-full"
      />

      <div className="mb-4 w-full rounded-xl bg-white/5 p-1 ring-1 ring-white/10 transition-all focus-within:bg-white/10 focus-within:ring-violet-500/50 lg:mb-5 xl:mb-6">
        <input
          type="text"
          placeholder="Enter the address of the site"
          value={currentPair?.url ?? ""}
          onChange={(e) => {
            setPairs([
              {
                ...currentPair,
                id: currentPair.id,
                url: e.target.value,
                password: "",
              },
            ]);
          }}
          className="min-h-[44px] w-full bg-transparent p-3 text-sm text-white placeholder-white/50 outline-none lg:min-h-[48px] lg:text-[15px] xl:min-h-[52px] xl:text-base 2xl:min-h-[56px] 2xl:text-[17px]"
        />
      </div>

      <div className="flex w-full gap-2">
        {!currentPair?.password ? (
          <button
            onClick={() => {
              handleGenerate(pairs);
              (document.activeElement as HTMLElement).blur();
            }}
            className="group flex min-h-[44px] flex-1 items-center justify-center gap-3 rounded-xl bg-violet-600 p-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98] lg:min-h-[48px] lg:text-[15px] xl:min-h-[52px] xl:text-base 2xl:min-h-[56px] 2xl:text-[17px]"
          >
            Generate Password
            <FaKey className="transition-transform group-hover:rotate-12" />
          </button>
        ) : (
          <div className="flex flex-1 rounded-xl bg-white/5 ring-1 ring-white/10">
            <button
              onClick={() => setIsGeneratedPasswordVisible((prev) => !prev)}
              className="min-h-[44px] flex-1 truncate rounded-l-xl p-3 text-left text-sm text-violet-200 transition-colors hover:bg-white/5 hover:text-white lg:min-h-[48px] lg:text-[15px] xl:min-h-[52px] xl:text-base 2xl:min-h-[56px] 2xl:text-[17px]"
            >
              {isGeneratedPasswordVisible
                ? currentPair?.password
                : maskPassword(currentPair?.password)}
            </button>
            <div className="h-full w-px bg-white/10" />
            <button
              onClick={() => copyToClipboard(currentPair.password ?? "")}
              className="px-4 text-violet-400 transition-colors hover:text-white"
            >
              {clipboardText === currentPair.password ? (
                <FaClipboardCheck size={20} />
              ) : (
                <FaClipboard size={20} />
              )}
            </button>
          </div>
        )}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className={`rounded-xl p-3 transition-all ${
            showSettings
              ? "bg-white/10 text-white"
              : "text-white/50 hover:bg-white/5 hover:text-white"
          }`}
        >
          <FaCog
            size={20}
            className={`transition-transform duration-500 ${showSettings ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${showSettings ? "grid-rows-[1fr] pt-6 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <label
                htmlFor="domainToggle"
                className="cursor-pointer text-sm text-indigo-100"
              >
                Use Only Domain
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
            </div>

            <div className="flex items-center justify-between">
              <label
                htmlFor="specialCharacterToggle"
                className="cursor-pointer text-sm text-indigo-100"
              >
                End with @
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
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-indigo-100">
                <label>Password Length</label>
                <span className="font-mono text-violet-300">
                  {currentPair.length}
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={24}
                step={1}
                value={currentPair.length}
                onChange={(e) =>
                  setPairs([
                    {
                      ...currentPair,
                      length: parseInt(e.target.value),
                    },
                  ])
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
