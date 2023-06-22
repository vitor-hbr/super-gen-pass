import { useState } from "react";
import toast from "react-hot-toast";
import { generate } from "supergenpass-lib";
import { TOAST_MESSAGES } from "../utils/constants";
import { replaceAt } from "../utils/replaceAt";

export type usePasswordGeneratorProps = {
    initialPairs?: Pair[];
};

export type Pair = {
    id: string;
    url: string;
    password: string;
    onlyDomain: boolean;
    length: number;
    forceSpecialCharacter: boolean;
};

export const usePasswordGenerator = ({
    initialPairs,
}: usePasswordGeneratorProps) => {
    const [masterPassword, setMasterPassword] = useState("");
    const [pairs, setPairs] = useState<Pair[]>(initialPairs || []);

    const maskPassword = (password: string) => {
        return password.replace(/./g, "*");
    };

    const generatePasswords = async () => {
        if (!masterPassword || !pairs.length)
            onMissingInputToast(TOAST_MESSAGES.missingInput);

        const newPairs = [];
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
                    }
                );
            });

            newPairs.push({ ...pair, password: password });
        }
        setPairs(newPairs);
        onCreatedPasswordToast();

        (document.activeElement as HTMLElement).blur();
    };

    const onCreatedPasswordToast = () =>
        toast.success(TOAST_MESSAGES.success, {
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

    return {
        masterPassword,
        setMasterPassword,
        pairs,
        setPairs,
        maskPassword,
        generatePasswords,
    };
};
