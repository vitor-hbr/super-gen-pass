import { startTransition, useTransition } from "react";
import { flushSync } from "react-dom";

/**
 * Enhanced hook for handling View Transitions in React 18/19.
 * Utilizes document.startViewTransition if available, with fallback to standard state updates.
 */
export const useViewTransition = () => {
  const [isPending, startReactTransition] = useTransition();

  const startViewTransition = (callback: () => void) => {
    if (!document.startViewTransition) {
      startReactTransition(() => {
        callback();
      });
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        startReactTransition(() => {
          callback();
        });
      });
    });
  };

  return {
    isPending,
    startViewTransition,
  };
};
