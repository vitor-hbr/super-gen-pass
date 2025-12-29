import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { generate } from "supergenpass-lib";
import { TOAST_MESSAGES } from "../utils/constants";
import { replaceAt } from "../utils/replaceAt";
import { PasswordConfigEntry } from "../utils/models";

export interface Pair extends PasswordConfigEntry {
  password?: string;
}

export const usePasswordGenerator = () => {
  const [masterPassword, setMasterPassword] = useState("");

  const maskPassword = (password: string) => {
    return password.replace(/./g, "*");
  };

  const generatePasswords = useCallback(
    async (pairs: Pair[], runOnBackground?: boolean) => {
      if (!masterPassword || !pairs.length) {
        if (!runOnBackground) onMissingInputToast(TOAST_MESSAGES.missingInput);
        return pairs || [];
      }

      const resultingPairs: Pair[] = [];
      for (const pair of pairs) {
        const password = await new Promise<string>((resolve) => {
          generate(
            masterPassword,
            pair.url,
            {
              length: pair.length,
              onlyDomain: pair.onlyDomain,
            },
            (password) => {
              if (!pair.forceSpecialCharacter) resolve(password);

              resolve(replaceAt(password, password.length - 1, "@"));
            },
          );
        });

        resultingPairs.push({ ...pair, password });
      }
      if (!runOnBackground) onCreatedPasswordToast();

      return resultingPairs;
    },
    [masterPassword],
  );

  const onCreatedPasswordToast = useCallback(
    () =>
      toast.success(TOAST_MESSAGES.success, {
        iconTheme: {
          primary: "#7c3aed",
          secondary: "#fff",
        },
      }),
    [],
  );

  const onMissingInputToast = useCallback(
    (message: string) =>
      toast.error(message, {
        iconTheme: {
          primary: "#7c3aed",
          secondary: "#fff",
        },
      }),
    [],
  );

  return {
    masterPassword,
    setMasterPassword,
    maskPassword,
    generatePasswords,
  };
};
