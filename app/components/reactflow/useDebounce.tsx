import { useState, useEffect, useRef } from "react";

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handler = useRef<any>(null);
  useEffect(() => {
    if (handler.current) {
      clearTimeout(handler.current);
    }
    handler.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler.current);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
