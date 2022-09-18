import React, { useEffect, useState } from "react";
import { generate } from "supergenpass-lib";

import {
  FaKey,
  FaEyeSlash,
  FaEye,
  FaEnvelope,
  FaLock,
  FaLockOpen,
  FaCompressAlt,
  FaClipboard,
  FaClipboardCheck,
  FaCog,
} from "react-icons/fa";

export const PasswordGenerator = () => {
  const [masterPassword, setMasterPassword] = useState("");
  const [url, setUrl] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [onlyDomain, setOnlyDomain] = useState(true);
  const [isMasterPasswordVisible, setIsMasterPasswordVisible] = useState(false);
  const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
    useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [generatedSize, setGeneratedSize] = useState(14);

  const generatePassword = () => {
    if (masterPassword && url) {
      generate(masterPassword, url, {}, (password) =>
        setGeneratedPassword(password)
      );
    }
    (document.activeElement as HTMLElement).blur();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
  };

  const maskPassword = (password: string) => {
    return password.replace(/./g, "*");
  };

  useEffect(() => {
    setGeneratedPassword("");
    setCopied(false);
  }, [masterPassword, url]);

  return (
    <main className="flex flex-col items-center justify-center bg-gradient-to-b from-violet-600 via-purple-500  text-white w-10/12 rounded-lg p-4">
      <span className="flex rounded-lg bg-white p-3 outline outline-offset-2 outline-0 focus-within:outline-1 w-full max-w-xs mb-4 outline-violet-900">
        <input
          type={isMasterPasswordVisible ? "text" : "password"}
          placeholder="Enter your master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          className="text-sm w-full outline-none text-black"
        />
        <button
          onClick={() => setIsMasterPasswordVisible((s) => !s)}
          className="pl-3"
        >
          {!isMasterPasswordVisible ? (
            <FaEyeSlash width={32} height={32} className="text-violet-600" />
          ) : (
            <FaEye width={32} height={32} />
          )}
        </button>
      </span>

      <span className="flex rounded-lg bg-white p-3 outline outline-offset-2 outline-0 focus-within:outline-1 w-full max-w-xs">
        <input
          type="text"
          placeholder="Enter the address of the site"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="text-sm w-full outline-none text-black"
        />
      </span>

      <button onClick={() => setShowSettings((s) => !s)}>
        <FaCog width={32} height={32} />
      </button>

      {showSettings && (
        <>
          <span>
            <label htmlFor="domainToggle">Use only domain?</label>
            <input
              type="checkbox"
              id="domainToggle"
              defaultChecked={onlyDomain}
              onChange={() => setOnlyDomain((s) => !s)}
            />
          </span>
          <span>
            <label htmlFor="generatedLength">
              Length of generated password
            </label>
            <input
              type="range"
              id="generatedLength"
              onChange={(e) => setGeneratedSize(parseInt(e.target.value))}
              min={4}
              max={24}
              step={0.1}
              value={generatedSize}
            />
            <span>{generatedSize}</span>
          </span>
        </>
      )}
      <span>
        {generatedPassword ? (
          <>
            <button
              onFocus={() => setIsGeneratedPasswordVisible(true)}
              onBlur={() => setIsGeneratedPasswordVisible(false)}
            >
              {isGeneratedPasswordVisible
                ? generatedPassword
                : maskPassword(generatedPassword)}
            </button>
            <button onClick={() => copyToClipboard()}>
              {copied ? (
                <FaClipboardCheck width={32} height={32} />
              ) : (
                <FaClipboard width={32} height={32} />
              )}
            </button>
          </>
        ) : (
          <button onClick={() => generatePassword()}>
            Generate password
            {<FaKey width={32} height={32} />}
          </button>
        )}
      </span>
    </main>
  );
};
