import { useCallback, useTransition } from "react";
import { flushSync } from "react-dom";

type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type ViewTransitionCapableDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
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

      try {
        transitionDocument.startViewTransition(() => {
          flushSync(() => {
            update();
          });
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          startReactTransition(() => {
            update();
          });
          return;
        }

        throw error;
      }
    },
    [startReactTransition],
  );

  return {
    isPending,
    startViewTransition,
  };
};
