import { useCallback, useEffect, useRef } from "react";
import { debounce } from "../utils/debounce";

type DebouncedCallback<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number = 250,
) => {
  const callbackRef = useRef(callback);
  const debouncedFnRef = useRef<DebouncedCallback<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const debounced = debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, waitFor) as DebouncedCallback<T>;

    debouncedFnRef.current = debounced;

    return () => {
      debounced.cancel();
      if (debouncedFnRef.current === debounced) {
        debouncedFnRef.current = null;
      }
    };
  }, [waitFor]);

  return useCallback((...args: Parameters<T>) => {
    debouncedFnRef.current?.(...args);
  }, []);
};
