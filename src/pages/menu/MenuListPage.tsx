import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { MenuHeader } from "@/components/menu/MenuHeader";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { SectionHeading } from "@/components/menu/SectionHeading";
import { MenuItemTile } from "@/components/menu/MenuItemTile";
import { MenuItemDetail } from "@/components/menu/MenuItemDetail";
import { DietaryFilterSheet } from "@/components/menu/DietaryFilterSheet";
import { MenuFooter } from "@/components/menu/MenuFooter";
import { useMenu } from "@/lib/menu/useMenu";
import { itemSlug } from "@/lib/menu/api";
import {
  categoriesForMode,
  familyForSlug,
  MODE_META,
  type MenuMode,
} from "@/lib/menu/groups";
import { scrollToSection, sectionId } from "@/lib/menu/scroll";
import { useStickyOffset } from "@/hooks/use-sticky-offset";
import { useActiveSection } from "@/hooks/use-active-section";
import { menuSession } from "@/lib/menu/session";
import type { DietaryTag } from "@/data/tasting-room-menu";

export default function MenuListPage({ mode }: { mode: MenuMode }) {
  const nav = useNavigate();
  const all = useMenu();
  const meta = MODE_META[mode];
  const [params, setParams] = useSearchParams();
  useMenuMeta(
    `${meta.title} | The Tasting Room, Sula Vineyards`,
    `${meta.kicker} The Tasting Room, Sula Vineyards, Nashik.`,
  );
  useStickyOffset();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAll, setSearchAll] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnly, setShowOnly] = useState<DietaryTag[]>([]);
  const [hideIf, setHideIf] = useState<DietaryTag[]>([]);

  useEffect(() => {
    if (!menuSession.introComplete()) nav("/menu", { replace: true });
  }, [nav]);

  const openSlug = params.get("item");

  // Entering a menu (or switching menu type) always starts at the top — unless
  // the guest arrived on a shareable item link.
  useEffect(() => {
    if (!openSlug) window.scrollTo({ top: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const scoped = useMemo(
    () => categoriesForMode(all, searchAll && query.trim() ? "all" : mode),
    [all, mode, searchAll, query],
  );

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
        family: familyForSlug(c.slug, c.headingStyle),
        domId: sectionId(c.slug, searchAll && q ? "all" : mode),
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
  }, [scoped, mode, query, searchAll, showOnly, hideIf]);

  const ids = useMemo(() => filtered.map((c) => c.domId), [filtered]);
  const trackedActive = useActiveSection(ids);
  const [pinned, setPinned] = useState<string | null>(null);
  const activeId = pinned ?? trackedActive;

  const jumpTo = (id: string) => {
    setPinned(id);
    scrollToSection(id);
    window.setTimeout(() => setPinned(null), 700);
  };

  // The open item is derived from the URL, so direct links and refreshes work
  // and browser Back closes the detail before leaving the menu.
  const open = useMemo(() => {
    if (!openSlug) return null;
    for (const c of categoriesForMode(all, "all")) {
      const item = c.items.find((i) => itemSlug(i.name) === openSlug);
      if (item)
        return {
          item,
          categoryName: c.name,
          family: familyForSlug(c.slug, c.headingStyle) as MenuMode,
        };
    }
    return null;
  }, [all, openSlug]);

  const openItem = (slug: string) => {
    // Remembered here so closing lands the guest exactly where they left off,
    // whichever way they close (button, backdrop, Escape or browser Back).
    returnY.current = window.scrollY;
    const next = new URLSearchParams(params);
    next.set("item", slug);
    setParams(next);
  };

  const closeItem = useCallback(() => {
    if (window.history.length > 1) {
      nav(-1);
      return;
    }
    const next = new URLSearchParams(params);
    next.delete("item");
    setParams(next, { replace: true });
  }, [nav, params, setParams]);

  // Restore the remembered offset once the detail has closed, after the browser
  // has finished its own history scroll restoration.
  useEffect(() => {
    if (openSlug || returnY.current == null) return;
    const y = returnY.current;
    returnY.current = null;
    const restore = () => window.scrollTo({ top: y, behavior: "auto" });
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
  }, [openSlug]);


  const activeFilterCount = showOnly.length + hideIf.length;
  const showFilters = mode === "food" || mode === "all";

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
            if (searchOpen) {
              setQuery("");
              setSearchAll(false);
            }
          }}
          searchAll={searchAll}
          onToggleSearchAll={() => setSearchAll((v) => !v)}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          showFilters={showFilters}
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
          <p className="font-tr-body mt-1 max-w-prose text-[0.78rem] text-tr-body">
            {meta.kicker}
          </p>

          {filtered.length === 0 && (
            <p className="font-tr-body py-16 text-center text-[0.85rem] text-tr-body">
              {query.trim()
                ? `Nothing matches “${query.trim()}”. Try another search${searchAll ? "" : " or search all menus"}.`
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
                <ul className="space-y-2.5">
                  {c.items.map((item) => (
                    <MenuItemTile
                      key={item.id}
                      item={item}
                      family={c.family}
                      categoryName={c.name}
                      onOpen={() => openItem(itemSlug(item.name))}
                    />
                  ))}
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

      {open && (
        <MenuItemDetail
          item={open.item}
          family={open.family}
          categoryName={open.categoryName}
          onClose={closeItem}
        />
      )}
    </MenuCanvas>
  );
}
