import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { DietaryTag } from "@/data/tasting-room-menu";
import type { MenuCategoryView } from "@/lib/menu/api";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";
import vineyardFooter from "@/assets/menu/art-vineyard-footer.webp.asset.json";
import icBottle from "@/assets/menu/ic-bottle.webp.asset.json";
import icHalfBottle from "@/assets/menu/ic-halfbottle.webp.asset.json";
import icGlass from "@/assets/menu/ic-glass.webp.asset.json";
import { CategoryNav } from "./CategoryNav";
import { SectionHeading } from "./SectionHeading";
import { PlateRow, WineRow } from "./MenuRows";
import { DietaryFilterSheet } from "./DietaryFilterSheet";
import { MenuClosing } from "./MenuClosing";

function ServingHeader() {
  const cols = [
    { src: icBottle.url, label: "750 ml" },
    { src: icHalfBottle.url, label: "375 ml" },
    { src: icGlass.url, label: "Glass" },
  ];
  return (
    <div className="mb-1 flex items-end justify-end gap-x-2 border-b border-tr-rule pb-2">
      {cols.map((c) => (
        <div key={c.label} className="w-11 text-center">
          <img
            src={c.src}
            alt=""
            aria-hidden="true"
            className="mx-auto h-6 w-auto object-contain"
          />
          <span className="font-tr-display mt-1 block text-[0.55rem] uppercase tracking-[0.1em] text-tr-body">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MenuScreen({ categories }: { categories: MenuCategoryView[] }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnly, setShowOnly] = useState<DietaryTag[]>([]);
  const [hideIf, setHideIf] = useState<DietaryTag[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    categories[0]?.slug ?? null,
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggle = (
    list: DietaryTag[],
    set: (v: DietaryTag[]) => void,
    tag: DietaryTag,
  ) => set(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => {
          if (q) {
            const hay = `${i.name} ${i.description ?? ""}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (showOnly.length && !showOnly.some((t) => i.tags.includes(t)))
            return false;
          if (hideIf.length && hideIf.some((t) => i.tags.includes(t))) return false;
          return true;
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, query, showOnly, hideIf]);

  const activeFilterCount = showOnly.length + hideIf.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const slug = visible?.target.getAttribute("data-section");
        if (slug) setActiveSlug(slug);
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filtered.length]);

  const jumpTo = (slug: string) => {
    setActiveSlug(slug);
    // The document body is the scroll container in this app, so rely on
    // scrollIntoView rather than window.scrollTo.
    sectionRefs.current[slug]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  return (
    <div className="min-h-[100svh] bg-tr-cream pb-2">
      <div className="tr-frame mx-auto min-h-[100svh] max-w-2xl bg-tr-cream">
        <header className="sticky top-0 z-30 bg-tr-cream/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <img
              src={trLogo.url}
              alt="The Tasting Room at Sula Vineyards"
              className="h-9 w-auto"
            />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-label={searchOpen ? "Close search" : "Search the menu"}
                onClick={() => {
                  setSearchOpen((v) => !v);
                  if (searchOpen) setQuery("");
                }}
                className="rounded-full p-2 text-tr-black/70 hover:bg-tr-olive/10"
              >
                {searchOpen ? (
                  <X className="h-[1.15rem] w-[1.15rem]" />
                ) : (
                  <Search className="h-[1.15rem] w-[1.15rem]" />
                )}
              </button>
              <button
                type="button"
                aria-label="Dietary filters"
                onClick={() => setFiltersOpen(true)}
                className="relative rounded-full p-2 text-tr-black/70 hover:bg-tr-olive/10"
              >
                <SlidersHorizontal className="h-[1.15rem] w-[1.15rem]" />
                {activeFilterCount > 0 && (
                  <span className="font-tr-display absolute -right-0.5 -top-0.5 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-tr-olive px-1 text-[0.6rem] text-tr-cream">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="px-4 pb-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search wines and plates"
                aria-label="Search the menu"
                className="font-tr-body w-full rounded-full border border-tr-rule bg-transparent px-4 py-2 text-[0.85rem] text-tr-ink outline-none placeholder:text-tr-body/50 focus:border-tr-gold"
              />
            </div>
          )}

          <CategoryNav
            categories={filtered}
            activeSlug={activeSlug}
            onSelect={jumpTo}
          />
        </header>

        <main className="px-5 pt-7">
          {filtered.length === 0 && (
            <p className="font-tr-body py-16 text-center text-[0.85rem] text-tr-body">
              Nothing matches that just yet. Try another search or clear your
              filters.
            </p>
          )}

          {filtered.map((c, idx) => (
            <section
              key={c.slug}
              data-section={c.slug}
              ref={(el) => {
                sectionRefs.current[c.slug] = el;
              }}
              className="scroll-mt-36 pb-9"
            >
              <SectionHeading>{c.name}</SectionHeading>
              {c.headingStyle === "wine" && <ServingHeader />}
              <ul>
                {c.items.map((item) =>
                  c.headingStyle === "wine" ? (
                    <WineRow key={item.id} item={item} />
                  ) : (
                    <PlateRow key={item.id} item={item} />
                  ),
                )}
              </ul>
              {idx < filtered.length - 1 && (
                <img
                  src={vineyardFooter.url}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="mt-7 w-full opacity-90"
                />
              )}
            </section>
          ))}
        </main>

        <MenuClosing />
      </div>

      {filtersOpen && (
        <DietaryFilterSheet
          showOnly={showOnly}
          hideIf={hideIf}
          onToggleShowOnly={(t) => toggle(showOnly, setShowOnly, t)}
          onToggleHideIf={(t) => toggle(hideIf, setHideIf, t)}
          onClear={() => {
            setShowOnly([]);
            setHideIf([]);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
}
