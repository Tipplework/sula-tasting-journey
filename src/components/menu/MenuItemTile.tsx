import { ChevronRight, Wine } from "lucide-react";
import type { MenuItemView } from "@/lib/menu/api";
import type { MenuMode } from "@/lib/menu/groups";
import { DietaryIconRow } from "./DietaryIcon";

export function money(v: number | null | undefined) {
  return v == null ? "—" : `₹${Math.round(v)}`;
}

export const POUR_LABELS = ["Bottle", "375 ml", "Glass"] as const;

function pairingText(pairing: string) {
  return pairing.replace(/^pairs?\s+well\s+with\s*/i, "");
}

/**
 * The single presentation unit of the menu. Every item — wine, cocktail, drink
 * or plate — renders inside this soft rectangular tile and is a real button that
 * opens the item detail panel.
 */
export function MenuItemTile({
  item,
  family,
  categoryName,
  onOpen,
}: {
  item: MenuItemView;
  family: MenuMode;
  categoryName: string;
  onOpen: () => void;
}) {
  const isWine = family === "wine";
  const isCocktail = family === "cocktails";

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${item.name}, ${categoryName} — view details`}
        className="tr-tile group w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3">
              <h3 className="font-tr-display min-w-0 flex-1 text-[0.95rem] uppercase leading-snug tracking-[0.05em] text-tr-ink">
                {isCocktail && (
                  <Wine
                    aria-hidden="true"
                    className="mr-1.5 inline-block h-3.5 w-3.5 align-[-0.15em] text-tr-gold-deep"
                  />
                )}
                {item.name}
                <DietaryIconRow tags={item.tags} />
              </h3>
              {!isWine && (
                <span className="font-tr-display shrink-0 text-[0.9rem] tabular-nums text-tr-ink">
                  {money(item.standardPrice)}
                </span>
              )}
            </div>

            {(item.calories != null || item.unavailable) && (
              <p className="font-tr-body mt-1 text-[0.68rem] text-tr-body/80">
                {item.calories != null && `${Math.round(item.calories)} kcal`}
                {item.calories != null && item.unavailable && " · "}
                {item.unavailable && "Currently unavailable"}
              </p>
            )}

            {item.description && (
              <p className="font-tr-body mt-1.5 text-[0.8rem] leading-relaxed text-tr-body">
                {item.description}
              </p>
            )}

            {isWine && (
              <div className="mt-2.5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                {[item.bottlePrice, item.smallerBottlePrice, item.glassPrice].map(
                  (p, i) =>
                    p == null ? null : (
                      <span
                        key={POUR_LABELS[i]}
                        className="inline-flex items-baseline gap-1.5"
                      >
                        <span className="font-tr-display text-[0.55rem] uppercase tracking-[0.12em] text-tr-body/70">
                          {POUR_LABELS[i]}
                        </span>
                        <span className="font-tr-display text-[0.88rem] tabular-nums text-tr-ink">
                          {money(p)}
                        </span>
                      </span>
                    ),
                )}
              </div>
            )}

            {item.pairing && (
              <p className="font-tr-body mt-1.5 text-[0.75rem] leading-relaxed text-tr-gold-deep">
                Pairs well with {pairingText(item.pairing)}
              </p>
            )}
          </div>

          <ChevronRight
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 self-center text-tr-black/35 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </button>
    </li>
  );
}
