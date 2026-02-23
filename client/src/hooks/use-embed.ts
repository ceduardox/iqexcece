import { useMemo } from "react";

export function useEmbed(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("embed") === "true";
  }, []);
}
