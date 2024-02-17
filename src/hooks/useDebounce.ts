import { useEffect, useCallback } from 'react';

type CallbackFunction = () => void;

export default function useDebounce(effect: CallbackFunction, dependencies: any[], delay: number) {
  const callback = useCallback(effect, dependencies);

  useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [callback, delay]);
}
