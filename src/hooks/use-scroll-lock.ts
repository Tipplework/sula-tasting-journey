import { useEffect, useId } from "react";

/**
 * Central scroll lock for every menu overlay (registration, disclaimer, filter
 * sheet). The saved offset lives on the body's own inline style rather than in a
 * module counter, so the state can never drift out of sync with the DOM: any
 * overlay can lock, nested overlays share one lock, and the last one to close
 * restores the exact original offset.
 */
const owners = new Set<string>();

function isLocked() {
  return document.body.style.position === "fixed";
}

export function useScrollLock(active: boolean) {
  const id = useId();

  useEffect(() => {
    if (!active) return;

    if (!isLocked()) {
      const y = window.scrollY;
      const body = document.body;
      body.style.position = "fixed";
      body.style.top = `-${y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    }
    owners.add(id);

    return () => {
      owners.delete(id);
      if (owners.size > 0 || !isLocked()) return;
      const body = document.body;
      const y = Math.abs(parseInt(body.style.top || "0", 10)) || 0;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      window.scrollTo({ top: y, behavior: "auto" });
    };
  }, [active, id]);
}
