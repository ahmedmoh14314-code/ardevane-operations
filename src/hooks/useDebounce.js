import { useEffect, useState } from "react";

// Waits until typing pauses, so one request goes out instead of one per key
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(
    function () {
      const id = setTimeout(() => setDebounced(value), delay);

      return () => clearTimeout(id);
    },
    [value, delay]
  );

  return debounced;
}
