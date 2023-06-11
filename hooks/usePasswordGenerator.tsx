import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { generate } from "supergenpass-lib";

export type usePasswordGeneratorProps = {
  missingInputMessage?: string;
  successMessage?: string;
  copiedMessage?: string;
  initialOnlyDomain?: boolean;
  initialGeneratedSize?: number;
};

export type Pair = {
  url: string;
  password: string;
};

export const usePasswordGenerator = ({
  successMessage = "Password generated!",
  missingInputMessage = "Please, fill the 'Master Password' and 'Address' fields",
  copiedMessage = "Copied to clipboard!",
  initialOnlyDomain,
  initialGeneratedSize,
}: usePasswordGeneratorProps) => {
  const [masterPassword, setMasterPassword] = useState("");
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [onlyDomain, setOnlyDomain] = useState(initialOnlyDomain ?? false);
  const [generatedSize, setGeneratedSize] = useState(
    initialGeneratedSize ?? 14
  );
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lastCopiedIndex, setLastCopiedIndex] = useState<number>(null);

  const maskPassword = (password: string) => {
    return password.replace(/./g, "*");
  };

  const generatePasswords = async () => {
    if (masterPassword && pairs.length) {
      const newPairs = [];
      for (const pair of pairs) {
        const password = await new Promise<string>((resolve) => {
          generate(
            masterPassword,
            pair.url,
            { length: generatedSize, onlyDomain },
            (password) => {
              resolve(password);
            }
          );
        });

        newPairs.push({ ...pair, password: password });
      }
      setPairs(newPairs);
      onCreatedPasswordToast();
      setHasGenerated(true);
    } else {
      onMissingInputToast(missingInputMessage);
    }
    (document.activeElement as HTMLElement).blur();
  };

  const copyToClipboard = async (urlIndex: number) => {
    navigator.clipboard.writeText(pairs[urlIndex].password);
    setLastCopiedIndex(urlIndex);
    onCopiedToast();
  };

  const onCreatedPasswordToast = () =>
    toast.success("Password(s) created!", {
      iconTheme: {
        primary: "#7c3aed",
        secondary: "#fff",
      },
    });

  const onMissingInputToast = (message: string) =>
    toast.error(message, {
      iconTheme: {
        primary: "#7c3aed",
        secondary: "#fff",
      },
    });

  const onCopiedToast = () => toast(copiedMessage, { icon: "📋" });

  useEffect(() => {
    setLastCopiedIndex(null);
    setHasGenerated(false);
  }, [masterPassword, generatedSize, onlyDomain]);

  return {
    masterPassword,
    setMasterPassword,
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
    hasGenerated,
    setHasGenerated,
  };
};
