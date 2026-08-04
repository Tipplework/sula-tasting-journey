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

  if (categories.length < 2) return null;

  return (
    <nav aria-label="Menu sections">
      <div
        ref={scroller}
        className="tr-hide-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2.5"
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
              className={`font-tr-display shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.13em] transition-colors ${
                active
                  ? "bg-tr-olive text-tr-cream"
                  : "bg-tr-olive/8 text-tr-black/65"
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
