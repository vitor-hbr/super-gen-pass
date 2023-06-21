import { useState } from "react";
import toast from "react-hot-toast";

import { TOAST_MESSAGES } from "../utils/constants";

export const useClipboard = () => {
  const [clipboardText, setClipboardText] = useState("");

  const onCopiedToast = () => toast(TOAST_MESSAGES.copied, { icon: "📋" });

  const copyToClipboard = async (text: string) => {
    navigator.clipboard.writeText(text);
    setClipboardText(text);
    onCopiedToast();
  };

  return { clipboardText, copyToClipboard };
};
