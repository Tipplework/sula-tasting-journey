import { useEffect, useRef } from "react";

interface SwipeNavOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Horizontal swipe gesture hook.
 * - Ignores gestures that are primarily vertical (preserves scroll).
 * - Ignores swipes starting on interactive elements (buttons, inputs, links).
 * - Default threshold 60px to avoid accidental triggers.
 */
export function useSwipeNav({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  enabled = true,
}: SwipeNavOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const blocked = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const isInteractive = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false;
      return !!el.closest(
        'button, a, input, textarea, select, [role="button"], [data-no-swipe]'
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX.current = t.clientX;
      startY.current = t.clientY;
      blocked.current = isInteractive(e.target);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (blocked.current) return;
      const t = e.changedTouches[0];
      const dx = startX.current - t.clientX;
      const dy = Math.abs(startY.current - t.clientY);

      // must be primarily horizontal
      if (Math.abs(dx) < threshold) return;
      if (dy > Math.abs(dx) * 0.6) return;

      if (dx > 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, enabled]);
}
