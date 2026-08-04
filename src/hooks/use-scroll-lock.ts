import { useEffect } from "react";

let locks = 0;
let savedY = 0;

/**
 * Locks the single page scroll container while a dialog is open, and restores
 * the exact scroll position on close. Reference counted, so nested sheets
 * (filter sheet opened over a drawer) never fight each other.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (locks === 0) {
      savedY = window.scrollY;
      const body = document.body;
      body.style.position = "fixed";
      body.style.top = `-${savedY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0) {
        const body = document.body;
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        window.scrollTo({ top: savedY, behavior: "auto" });
      }
    };
  }, [active]);
}
