import { useEffect } from "react";

/**
 * Publishes the measured sticky-shell height as `--menu-sticky-offset` so that
 * `scroll-margin-top` and programmatic jumps always agree with the real layout.
 */
export function useStickyOffset() {
  useEffect(() => {
    const root = document.documentElement;
    const shell = document.querySelector<HTMLElement>(
      "[data-menu-sticky-shell]",
    );
    if (!shell) return;

    const write = () => {
      const h = shell.getBoundingClientRect().height;
      root.style.setProperty("--menu-sticky-offset", `${Math.round(h + 12)}px`);
    };

    write();
    const ro = new ResizeObserver(write);
    ro.observe(shell);
    window.addEventListener("orientationchange", write);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", write);
      root.style.removeProperty("--menu-sticky-offset");
    };
  }, []);
}
