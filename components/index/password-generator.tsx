import React, { useEffect, useState } from "react";
import Image from "next/image";
import { generate } from "supergenpass-lib";

export const PasswordGenerator = () => {
  const [masterPassword, setMasterPassword] = useState("");
  const [url, setUrl] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [onlyDomain, setOnlyDomain] = useState(true);
  const [isMasterPasswordVisible, setIsMasterPasswordVisible] = useState(false);
  const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
    useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    generate(masterPassword, url, {}, (password) =>
      setGeneratedPassword(password)
    );
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
    <main className="flex flex-col items-center justify-center bg-violet-600">
      <h1 className="">Get your hashed password!</h1>

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
        <input
          type={isMasterPasswordVisible ? "text" : "password"}
          placeholder="Enter your master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button onClick={() => setIsMasterPasswordVisible((s) => !s)}>
          <Image
            src={`/visibility${!isMasterPasswordVisible ? "_off" : ""}.svg`}
            width={32}
            height={32}
          />
        </button>
      </span>

      <span>
        <input
          type="text"
          placeholder="Enter the address of the site"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </span>

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
              <Image
                src={copied ? `/clipboard_copied.svg` : `/clipboard.svg`}
                width={32}
                height={32}
              />
            </button>
          </>
        ) : (
          <button onClick={() => generatePassword()}>
            Generate password
            <Image src={`/key.svg`} width={32} height={32} />
          </button>
        )}
      </span>
    </main>
  );
};
