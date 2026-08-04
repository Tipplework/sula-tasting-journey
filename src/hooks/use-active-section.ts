import { useEffect, useState } from "react";
import { stickyOffset } from "@/lib/menu/scroll";

/**
 * Tracks which menu section the guest is reading. rAF-throttled passive scroll
 * reads (a handful of getBoundingClientRect calls) rather than per-pixel state
 * updates, with an explicit bottom-of-page rule so the final short section can
 * always become active.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (!ids.length) {
      setActive(null);
      return;
    }

    let frame = 0;
    let last: string | null = null;

    const measure = () => {
      frame = 0;
      const threshold = stickyOffset() + 4;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      let current = ids[0];
      if (atBottom) {
        current = ids[ids.length - 1];
      } else {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= threshold) current = id;
        }
      }
      if (current !== last) {
        last = current;
        setActive(current);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids.join("|")]);

  return active;
}
