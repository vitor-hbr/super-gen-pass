"use client";

import React, { useState } from "react";
import {
  FaKey,
  FaEyeSlash,
  FaEye,
  FaClipboard,
  FaClipboardCheck,
  FaCog,
} from "react-icons/fa";
import { Toaster } from "react-hot-toast";

import { Checkbox } from "./checkbox";
import { usePasswordGenerator } from "../hooks/usePasswordGenerator";

export const PasswordGenerator = () => {
  const {
    masterPassword,
    setMasterPassword,
    hasGenerated,
    setHasGenerated,
    pairs,
    setPairs,
    onlyDomain,
    setOnlyDomain,
    generatedSize,
    setGeneratedSize,
    lastCopiedIndex,
    maskPassword,
    generatePasswords,
    copyToClipboard,
  } = usePasswordGenerator({});
  const [isMasterPasswordVisible, setIsMasterPasswordVisible] = useState(false);
  const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center bg-gradient-to-b from-violet-500 via-violet-700 to-violet-900 text-white w-full rounded-lg p-6 max-w-sm select-none">
      <Toaster />
      <span className="flex rounded-lg bg-white p-3 outline outline-offset-4 outline-0 focus-within:outline-1 w-full max-w-xs mb-4 outline-gray-900 drop-shadow-sm">
        <input
          type={isMasterPasswordVisible ? "text" : "password"}
          placeholder="Enter your master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          className="text-sm w-full outline-none text-slate-900"
        />
        <button
          onClick={() => setIsMasterPasswordVisible((s) => !s)}
          className="ml-3 flex items-center justify-center"
        >
          {!isMasterPasswordVisible ? (
            <FaEyeSlash
              width={32}
              height={32}
              className="text-violet-600 hover:text-slate-900 transition-all"
            />
          ) : (
            <FaEye
              width={32}
              height={32}
              className="text-violet-600 hover:text-slate-900 transition-all"
            />
          )}
        </button>
      </span>

      <span className="flex rounded-lg bg-white p-3 outline outline-offset-4 outline-0 focus-within:outline-1 w-full max-w-xs mb-4 outline-gray-900 drop-shadow-sm">
        <input
          type="text"
          placeholder="Enter the address of the site"
          value={pairs[0]?.url ?? ""}
          onChange={(e) => {
            setPairs([{ url: e.target.value, password: "" }]);
            setHasGenerated(false);
          }}
          className="text-sm w-full outline-none text-slate-900"
        />
      </span>
      <span className="flex drop-shadow-sm">
        {!hasGenerated ? (
          <button
            onClick={() => generatePasswords()}
            className="bg-white hover:bg-slate-900 p-3 rounded-lg text-violet-600 hover:text-white flex flex-row items-center justify-center transition-all"
          >
            <label className="pr-3 cursor-pointer">Generate Password</label>
            {<FaKey width={32} height={32} />}
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsGeneratedPasswordVisible((prev) => !prev)}
              className="bg-white hover:bg-slate-900 p-3 rounded-lg rounded-r-none text-violet-600 hover:text-white transition-all"
            >
              {isGeneratedPasswordVisible
                ? pairs[0]?.password
                : maskPassword(pairs[0]?.password)}
            </button>
            <button
              onClick={() => copyToClipboard(0)}
              className="bg-white hover:bg-slate-900 p-3 rounded-lg rounded-l-none text-violet-600 hover:text-white"
            >
              {lastCopiedIndex === 0 ? (
                <FaClipboardCheck width={32} height={32} />
              ) : (
                <FaClipboard width={32} height={32} />
              )}
            </button>
          </>
        )}
        <button onClick={() => setShowSettings((s) => !s)} className="p-3">
          <FaCog
            width={32}
            height={32}
            className="hover:text-slate-900 transition-all"
          />
        </button>
      </span>

      {showSettings && (
        <section className="flex flex-col pt-5 w-full">
          <span className="pb-5">
            <label htmlFor="domainToggle" className="pr-3 cursor-pointer">
              Use Only Domain?
            </label>
            <Checkbox
              setChecked={setOnlyDomain}
              checked={onlyDomain}
              uuid="domainToggle"
            />
          </span>
          <span className="flex">
            <label className="pr-3">Length of Password</label>
            <div className="flex flex-col justify-center items-center ">
              <input
                type="range"
                id="generatedLength"
                onChange={(e) => setGeneratedSize(parseInt(e.target.value))}
                min={4}
                max={24}
                step={0.1}
                value={generatedSize}
                className="cursor-pointer w-[115px] md:w-[180px] bg-white appearance-none rounded h-2 transition-all"
              />
              <span>{generatedSize}</span>
            </div>
          </span>
        </section>
      )}
    </main>
  );
};
