import { useEffect, useMemo, useRef } from "react";
import { debounce } from "../utils/debounce";

export const useDebounce = (
    callback: (...args: any[]) => any,
    waitFor: number = 250
) => {
    const ref = useRef<Function>();

    useEffect(() => {
        ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        const func = () => {
            ref.current?.();
        };

        return debounce(func, waitFor);
    }, [waitFor]);

    return debouncedCallback;
};
