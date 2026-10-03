import { useEffect, useState } from "react";

// Subscribes to a media query so layout decisions can live in JS, not only CSS
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(
    function () {
      const list = window.matchMedia(query);
      const onChange = (e) => setMatches(e.matches);

      setMatches(list.matches);
      list.addEventListener("change", onChange);

      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return matches;
}
