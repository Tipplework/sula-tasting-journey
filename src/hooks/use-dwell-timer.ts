import { useEffect, useRef } from "react";
import { logTastingEvent, type TastingEventInput } from "@/lib/tasting-events";

/**
 * Fires a tasting event with `durationMs` set to the time the component was
 * mounted and visible. Emits on unmount, tab hide, or beforeunload — whichever
 * happens first — so we still capture time when the guest closes the tab.
 *
 * `buildEvent` is called lazily at emit-time so it reads the latest guest
 * context (name/email/phone) rather than the values at mount.
 */
export function useDwellTimer(
  buildEvent: () => TastingEventInput | null,
  deps: unknown[] = []
) {
  const startRef = useRef<number>(Date.now());
  const firedRef = useRef(false);
  const totalRef = useRef(0);
  const buildRef = useRef(buildEvent);
  buildRef.current = buildEvent;

  useEffect(() => {
    startRef.current = Date.now();
    firedRef.current = false;
    totalRef.current = 0;

    const flush = () => {
      if (firedRef.current) return;
      const now = Date.now();
      totalRef.current += Math.max(0, now - startRef.current);
      startRef.current = now;
      const evt = buildRef.current();
      if (!evt) return;
      firedRef.current = true;
      logTastingEvent({ ...evt, durationMs: totalRef.current });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Accumulate but do not fire yet — could come back
        const now = Date.now();
        totalRef.current += Math.max(0, now - startRef.current);
      } else {
        startRef.current = Date.now();
      }
    };
    const onBeforeUnload = () => flush();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onBeforeUnload);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onBeforeUnload);
      window.removeEventListener("beforeunload", onBeforeUnload);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
