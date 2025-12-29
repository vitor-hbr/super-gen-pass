import { useCallback, useEffect, useRef } from "react";
import { debounce } from "../utils/debounce";

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number = 250,
) => {
  const callbackRef = useRef(callback);

  // Always keep the ref up to date with the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function once, stable reference
  const debouncedFnRef = useRef<ReturnType<typeof debounce> | null>(null);

  if (!debouncedFnRef.current) {
    debouncedFnRef.current = debounce((...args: any[]) => {
      callbackRef.current(...args);
    }, waitFor);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFnRef.current?.cancel();
    };
  }, []);

  // Return a stable callback that calls the debounced function
  return useCallback((...args: Parameters<T>) => {
    debouncedFnRef.current?.(...args);
  }, []) as (...args: Parameters<T>) => void;
};
