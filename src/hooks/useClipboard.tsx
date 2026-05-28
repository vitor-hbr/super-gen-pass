import { useCallback, useState } from "react";
import toast from "../ui/toast";

import { TOAST_MESSAGES } from "../utils/constants";

export const useClipboard = () => {
  const [clipboardText, setClipboardText] = useState("");

  const onCopiedToast = useCallback(() => toast(TOAST_MESSAGES.copied, { icon: "📋" }), []);

  const copyToClipboard = useCallback(async (text: string) => {
    navigator.clipboard.writeText(text);
    setClipboardText(text);
    onCopiedToast();

    setTimeout(() => {
      setClipboardText("");
    }, 1000);
  }, [onCopiedToast]);

  return { clipboardText, copyToClipboard };
};
