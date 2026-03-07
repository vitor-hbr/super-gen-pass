import { useCallback, useTransition } from "react";
import { flushSync } from "react-dom";

type ViewTransitionCapableDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getTransitionDocument = () =>
  typeof document !== "undefined"
    ? (document as ViewTransitionCapableDocument)
    : null;

/**
 * Enhanced hook for handling View Transitions in React 18/19.
 * Utilizes document.startViewTransition if available, with fallback to standard state updates.
 */
export const useViewTransition = () => {
  const [isPending, startReactTransition] = useTransition();

  const startViewTransition = useCallback(
    (update: () => void) => {
      const transitionDocument = getTransitionDocument();

      if (!transitionDocument?.startViewTransition || prefersReducedMotion()) {
        startReactTransition(() => {
          update();
        });
        return;
      }

      transitionDocument.startViewTransition(() => {
        flushSync(() => {
          update();
        });
      });
    },
    [startReactTransition],
  );

  return {
    isPending,
    startViewTransition,
  };
};
