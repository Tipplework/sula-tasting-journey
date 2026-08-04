import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";
import { MODE_META, SWITCHER_MODES, type MenuMode } from "@/lib/menu/groups";

export function MenuHeader({
  mode,
  query,
  onQuery,
  searchOpen,
  onToggleSearch,
  searchAll,
  onToggleSearchAll,
  onOpenFilters,
  activeFilterCount,
  showFilters = true,
  children,
}: {
  mode: MenuMode;
  query: string;
  onQuery: (v: string) => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  searchAll: boolean;
  onToggleSearchAll: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  showFilters?: boolean;
  children?: React.ReactNode;
}) {
  const nav = useNavigate();
  const searchBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleSearch();
        searchBtn.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, onToggleSearch]);

  /** Compact four-option menu switcher: segmented on desktop, swipeable rail on mobile. */
  const switcher = (
    <div
      className="tr-hide-scrollbar flex gap-1 overflow-x-auto rounded-full bg-tr-olive/[0.08] p-0.5"
      role="navigation"
      aria-label="Menu type"
    >
      {SWITCHER_MODES.map((m) => (
        <Link
          key={m}
          to={MODE_META[m].path}
          aria-current={mode === m ? "page" : undefined}
          className={`font-tr-display flex min-h-9 shrink-0 items-center rounded-full px-3 text-[0.62rem] uppercase tracking-[0.12em] transition-colors active:scale-[0.97] ${
            mode === m
              ? "bg-tr-black text-tr-cream"
              : "text-tr-black/60 hover:text-tr-black"
          }`}
        >
          {MODE_META[m].short}
        </Link>
      ))}
    </div>
  );

  return (
    <header
      data-menu-sticky-shell
      className="tr-sticky-shell border-b border-tr-rule/50 bg-tr-cream"
    >
      <div className="mx-auto flex w-full max-w-[900px] items-center gap-2 px-4 py-1.5">
        <button
          type="button"
          onClick={() => nav("/menu/select")}
          aria-label="Back to menu selection"
          className="-ml-1.5 flex h-11 w-11 items-center justify-center rounded-full text-tr-black/70 hover:bg-tr-olive/10 active:bg-tr-olive/15"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <img
          src={trLogo.url}
          alt="The Tasting Room at Sula Vineyards"
          className="h-8 w-auto"
        />

        <div className="ml-auto flex items-center gap-0.5">
          <div className="mr-1 hidden sm:block">{switcher}</div>
          <button
            ref={searchBtn}
            type="button"
            aria-label={searchOpen ? "Close search" : "Search the menu"}
            aria-expanded={searchOpen}
            onClick={onToggleSearch}
            className="flex h-11 w-11 items-center justify-center rounded-full text-tr-black/70 hover:bg-tr-olive/10 active:bg-tr-olive/15"
          >
            {searchOpen ? (
              <X className="h-[1.15rem] w-[1.15rem]" />
            ) : (
              <Search className="h-[1.15rem] w-[1.15rem]" />
            )}
          </button>
          {showFilters && (
            <button
              type="button"
              aria-label="Dietary filters"
              onClick={onOpenFilters}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-tr-black/70 hover:bg-tr-olive/10 active:bg-tr-olive/15"
            >
              <SlidersHorizontal className="h-[1.15rem] w-[1.15rem]" />
              {activeFilterCount > 0 && (
                <span className="font-tr-display absolute right-1 top-1 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-tr-olive px-1 text-[0.6rem] text-tr-cream">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[900px] px-4 pb-1.5 sm:hidden">
        {switcher}
      </div>

      {searchOpen && (
        <div className="mx-auto w-full max-w-[900px] px-4 pb-2">
          <div className="relative">
            <input
              autoFocus
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={`Search ${MODE_META[mode].short.toLowerCase()}`}
              aria-label="Search the menu"
              className="font-tr-body w-full rounded-full border border-tr-rule bg-white/60 px-4 py-3 pr-11 text-[1rem] text-tr-ink outline-none placeholder:text-tr-body/50 focus:border-tr-gold"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onQuery("")}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-tr-body"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleSearchAll}
            aria-pressed={searchAll}
            className={`font-tr-display mt-2 inline-flex min-h-9 items-center rounded-full border px-3 text-[0.6rem] uppercase tracking-[0.14em] ${
              searchAll
                ? "border-tr-olive bg-tr-olive/15 text-tr-olive"
                : "border-tr-rule text-tr-body"
            }`}
          >
            Search all menus
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-[900px]">{children}</div>
    </header>
  );
}
