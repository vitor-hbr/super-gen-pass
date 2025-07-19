export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};
