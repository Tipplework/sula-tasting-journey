import { useEffect, useRef, useState } from "react";

export type CategoryTab = { id: string; name: string };

/**
 * Mobile-app style horizontal tab rail: the only permitted horizontal scroll
 * area on the menu. Keyboard accessible, active tab auto-centred, edge fades
 * hint at more categories.
 */
export function CategoryNav({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: CategoryTab[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const userScrolledAt = useRef(0);
  const [edges, setEdges] = useState({ left: false, right: false });

  const readEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    readEdges();
  }, [tabs.length]);

  /**
   * Centres a tab by writing `scrollLeft` directly. `scrollIntoView` is
   * deliberately avoided here: because the rail lives inside a sticky shell,
   * the browser also scrolls the document to satisfy it, which used to yank the
   * page back up while the guest was reading.
   */
  const centre = (id: string, smooth = true) => {
    const rail = scroller.current;
    const el = rail?.querySelector<HTMLElement>(`[data-tab-id="${id}"]`);
    if (!rail || !el) return;
    const left = el.offsetLeft - (rail.clientWidth - el.clientWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, left),
      behavior:
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "smooth"
          : "auto",
    });
  };

  useEffect(() => {
    if (!activeId) return;
    // Don't fight the guest while they are dragging the rail themselves.
    if (Date.now() - userScrolledAt.current < 900) return;
    centre(activeId);
  }, [activeId]);

  if (tabs.length < 2) return null;

  const move = (dir: 1 | -1, index: number) => {
    const next = tabs[index + dir];
    if (!next) return;
    const el = scroller.current?.querySelector<HTMLElement>(
      `[data-tab-id="${next.id}"]`,
    );
    el?.focus({ preventScroll: true });
    centre(next.id);
  };

  return (
    <div className="relative" data-category-nav>
      {edges.left && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-tr-cream to-transparent"
        />
      )}
      {edges.right && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-tr-cream to-transparent"
        />
      )}
      <div
        ref={scroller}
        role="tablist"
        aria-label="Menu sections"
        onScroll={() => {
          readEdges();
        }}
        onPointerDown={() => {
          userScrolledAt.current = Date.now();
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            userScrolledAt.current = Date.now();
          }
        }}
        className="tr-hide-scrollbar tr-category-nav px-4 pb-2.5"
      >
        {tabs.map((t, i) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={t.id}
              tabIndex={active ? 0 : -1}
              data-tab-id={t.id}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  move(1, i);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  move(-1, i);
                }
              }}
              className={`font-tr-display flex min-h-11 shrink-0 select-none items-center whitespace-nowrap rounded-full px-3.5 text-[0.68rem] uppercase tracking-[0.13em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tr-olive active:scale-[0.97] ${
                active
                  ? "bg-tr-olive text-tr-cream"
                  : "bg-tr-olive/8 text-tr-black/65"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
