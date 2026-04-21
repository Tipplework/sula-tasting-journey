import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets scroll to top whenever the route or provided key changes. */
export function useScrollTop(key?: unknown) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    // also reset any inner scroll containers we use
    document.querySelectorAll<HTMLElement>("[data-scroll-container]").forEach((el) => {
      el.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [location.pathname, key]);
}
