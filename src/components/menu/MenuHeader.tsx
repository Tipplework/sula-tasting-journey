import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";
import type { MenuMode } from "@/lib/menu/groups";

export function MenuHeader({
  mode,
  query,
  onQuery,
  searchOpen,
  onToggleSearch,
  onOpenFilters,
  activeFilterCount,
  children,
}: {
  mode: MenuMode;
  query: string;
  onQuery: (v: string) => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  children?: React.ReactNode;
}) {
  const nav = useNavigate();

  const tab = (m: MenuMode, label: string, to: string) => (
    <Link
      key={m}
      to={to}
      aria-current={mode === m ? "page" : undefined}
      className={`font-tr-display rounded-full px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] transition-colors ${
        mode === m ? "bg-tr-black text-tr-cream" : "text-tr-black/60"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-tr-rule/50 bg-tr-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => nav("/menu/select")}
          aria-label="Back to menu selection"
          className="-ml-1.5 rounded-full p-1.5 text-tr-black/70 active:bg-tr-olive/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <img
          src={trLogo.url}
          alt="The Tasting Room at Sula Vineyards"
          className="h-8 w-auto"
        />

        <div className="ml-auto flex items-center gap-0.5">
          <div className="mr-1 hidden rounded-full bg-tr-olive/8 p-0.5 sm:flex">
            {tab("wine", "Wine", "/menu/wine")}
            {tab("food", "Food", "/menu/food")}
          </div>
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search the menu"}
            onClick={onToggleSearch}
            className="rounded-full p-2 text-tr-black/70 active:bg-tr-olive/10"
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
            onClick={onOpenFilters}
            className="relative rounded-full p-2 text-tr-black/70 active:bg-tr-olive/10"
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

      <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-1.5 sm:hidden">
        <div className="flex rounded-full bg-tr-olive/8 p-0.5">
          {tab("wine", "Wine", "/menu/wine")}
          {tab("food", "Food", "/menu/food")}
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search dishes, wines, pairings"
            aria-label="Search the menu"
            className="font-tr-body w-full rounded-full border border-tr-rule bg-white/60 px-4 py-2.5 text-[0.88rem] text-tr-ink outline-none placeholder:text-tr-body/50 focus:border-tr-gold"
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl">{children}</div>
    </header>
  );
}
