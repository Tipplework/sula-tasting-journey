import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { SectionHeading } from "@/components/menu/SectionHeading";
import { PlateRow, WinePourHeader, WineRow } from "@/components/menu/MenuRows";
import { DietaryFilterSheet } from "@/components/menu/DietaryFilterSheet";
import { MenuFooter } from "@/components/menu/MenuFooter";
import { useMenu } from "@/lib/menu/useMenu";
import { categoriesForMode, MODE_META, type MenuMode } from "@/lib/menu/groups";
import { menuSession } from "@/lib/menu/session";
import type { DietaryTag } from "@/data/tasting-room-menu";

export default function MenuListPage({ mode }: { mode: MenuMode }) {
  const nav = useNavigate();
  const all = useMenu();
  const meta = MODE_META[mode];
  useMenuMeta(
    `${meta.title} | The Tasting Room, Sula Vineyards`,
    `${meta.kicker} at The Tasting Room, Sula Vineyards, Nashik.`,
  );

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnly, setShowOnly] = useState<DietaryTag[]>([]);
  const [hideIf, setHideIf] = useState<DietaryTag[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!menuSession.introComplete()) nav("/menu", { replace: true });
  }, [nav]);

  const scoped = useMemo(() => categoriesForMode(all, mode), [all, mode]);

  const toggle = (
    list: DietaryTag[],
    set: (v: DietaryTag[]) => void,
    tag: DietaryTag,
  ) => set(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => {
          if (q) {
            const hay = `${i.name} ${i.description ?? ""} ${i.pairing ?? ""} ${c.name}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (showOnly.length && !showOnly.some((t) => i.tags.includes(t)))
            return false;
          if (hideIf.length && hideIf.some((t) => i.tags.includes(t))) return false;
          return true;
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [scoped, query, showOnly, hideIf]);

  useEffect(() => {
    if (!activeSlug && filtered.length) setActiveSlug(filtered[0].slug);
  }, [filtered, activeSlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const slug = visible?.target.getAttribute("data-section");
        if (slug) setActiveSlug(slug);
      },
      { rootMargin: "-160px 0px -70% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  const jumpTo = (slug: string) => {
    setActiveSlug(slug);
    sectionRefs.current[slug]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const activeFilterCount = showOnly.length + hideIf.length;

  return (
    <MenuCanvas>
      <div className="min-h-[100svh]">
        <MenuHeader
          mode={mode}
          query={query}
          onQuery={setQuery}
          searchOpen={searchOpen}
          onToggleSearch={() => {
            setSearchOpen((v) => !v);
            if (searchOpen) setQuery("");
          }}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        >
          <CategoryNav
            categories={filtered}
            activeSlug={activeSlug}
            onSelect={jumpTo}
          />
        </MenuHeader>

        <main className="mx-auto max-w-3xl px-5 pt-7">
          <h1 className="font-tr-display text-[1.15rem] uppercase tracking-[0.18em] text-tr-black">
            {meta.title}
          </h1>
          <p className="font-tr-body mt-1 text-[0.78rem] text-tr-body">
            {meta.kicker}
          </p>

          {filtered.length === 0 && (
            <p className="font-tr-body py-16 text-center text-[0.85rem] text-tr-body">
              Nothing matches that just yet. Try another search or clear your
              filters.
            </p>
          )}

          <div className="mt-7">
            {filtered.map((c) => (
              <section
                key={c.slug}
                data-section={c.slug}
                ref={(el) => {
                  sectionRefs.current[c.slug] = el;
                }}
                className="scroll-mt-40 pb-9"
              >
                <SectionHeading>{c.name}</SectionHeading>
                {c.headingStyle === "wine" && <WinePourHeader />}
                <ul>
                  {c.items.map((item) =>
                    c.headingStyle === "wine" ? (
                      <WineRow key={item.id} item={item} />
                    ) : (
                      <PlateRow key={item.id} item={item} />
                    ),
                  )}
                </ul>
              </section>
            ))}
          </div>
        </main>

        <MenuFooter />
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
    </MenuCanvas>
  );
}
