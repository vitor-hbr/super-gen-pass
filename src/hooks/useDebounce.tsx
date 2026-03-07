import { useCallback, useEffect, useRef } from "react";
import { debounce } from "../utils/debounce";

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number = 250,
) => {
  const callbackRef = useRef(callback);
  const debouncedFnRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const debouncedFn = debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, waitFor);

    debouncedFnRef.current = debouncedFn;

    return () => {
      debouncedFn.cancel();
      if (debouncedFnRef.current === debouncedFn) {
        debouncedFnRef.current = null;
      }
    };
  }, [waitFor]);

  return useCallback((...args: Parameters<T>) => {
    debouncedFnRef.current?.(...args);
  }, []) as (...args: Parameters<T>) => void;
};
