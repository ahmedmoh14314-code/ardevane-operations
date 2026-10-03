import { useEffect, useState } from "react";

// Counts from 0 up to the target over a short moment, so a figure arrives
// rather than just appearing. Ends on the exact target, cents included.
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(
    function () {
      let frame;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);

        // Quick at first, settling gently into the final number
        const eased = 1 - Math.pow(1 - progress, 3);

        setValue(progress === 1 ? target : Math.round(target * eased));

        if (progress < 1) frame = requestAnimationFrame(tick);
      }

      frame = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(frame);
    },
    [target, duration],
  );

  return value;
}
