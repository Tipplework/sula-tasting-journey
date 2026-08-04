import { useEffect, useRef } from "react";
import type { MenuCategoryView } from "@/lib/menu/api";

export function CategoryNav({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: MenuCategoryView[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeSlug || !scroller.current) return;
    const el = scroller.current.querySelector<HTMLElement>(
      `[data-slug="${activeSlug}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSlug]);

  return (
    <nav aria-label="Menu sections" className="border-b border-tr-rule/60">
      <div
        ref={scroller}
        className="tr-hide-scrollbar flex gap-1 overflow-x-auto px-3 py-2"
      >
        {categories.map((c) => {
          const active = c.slug === activeSlug;
          return (
            <button
              key={c.slug}
              type="button"
              data-slug={c.slug}
              onClick={() => onSelect(c.slug)}
              aria-current={active ? "true" : undefined}
              className={`font-tr-display shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? "bg-tr-olive text-tr-cream"
                  : "text-tr-black/70 hover:bg-tr-olive/10"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
