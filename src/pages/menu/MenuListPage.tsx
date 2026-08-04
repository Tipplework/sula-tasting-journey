import { useEffect, useMemo, useState } from "react";
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
import { scrollToSection, sectionId } from "@/lib/menu/scroll";
import { useStickyOffset } from "@/hooks/use-sticky-offset";
import { useActiveSection } from "@/hooks/use-active-section";
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
  useStickyOffset();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnly, setShowOnly] = useState<DietaryTag[]>([]);
  const [hideIf, setHideIf] = useState<DietaryTag[]>([]);

  useEffect(() => {
    if (!menuSession.introComplete()) nav("/menu", { replace: true });
  }, [nav]);

  // Entering a menu (or switching food <-> wine) always starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [mode]);

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
        domId: sectionId(c.slug, mode),
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
  }, [scoped, mode, query, showOnly, hideIf]);

  const ids = useMemo(() => filtered.map((c) => c.domId), [filtered]);
  const trackedActive = useActiveSection(ids);
  const [pinned, setPinned] = useState<string | null>(null);
  const activeId = pinned ?? trackedActive;

  const jumpTo = (id: string) => {
    setPinned(id);
    scrollToSection(id);
    window.setTimeout(() => setPinned(null), 700);
  };

  const activeFilterCount = showOnly.length + hideIf.length;

  return (
    <MenuCanvas>
      <div className="tr-menu-page">
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
          showFilters={mode !== "wine"}
        >
          <CategoryNav
            tabs={filtered.map((c) => ({ id: c.domId, name: c.name }))}
            activeId={activeId}
            onSelect={jumpTo}
          />
        </MenuHeader>

        <main className="mx-auto w-full max-w-[900px] px-5 pt-7">
          <h1 className="font-tr-display text-[1.15rem] uppercase tracking-[0.18em] text-tr-black">
            {meta.title}
          </h1>
          <p className="font-tr-body mt-1 text-[0.78rem] text-tr-body">
            {meta.kicker}
          </p>

          {filtered.length === 0 && (
            <p className="font-tr-body py-16 text-center text-[0.85rem] text-tr-body">
              {query.trim()
                ? `Nothing matches “${query.trim()}”. Try another search or clear your filters.`
                : "Nothing matches those filters just yet. Try clearing them."}
            </p>
          )}

          <div className="mt-7">
            {filtered.map((c) => (
              <section
                key={c.domId}
                id={c.domId}
                role="tabpanel"
                aria-labelledby={`tab-${c.domId}`}
                data-section={c.domId}
                className="tr-menu-section pb-9"
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
