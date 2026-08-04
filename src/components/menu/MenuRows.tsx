import type { MenuItemView } from "@/lib/menu/api";
import { DietaryIconRow } from "./DietaryIcon";

function money(v: number | null) {
  return v == null ? "—" : `₹${Math.round(v)}`;
}

const POUR_LABELS = ["Bottle", "375 ml", "Glass"] as const;

/** Column header for the wine list, rendered once per wine section. */
export function WinePourHeader() {
  return (
    <div className="mb-1 hidden items-end justify-end gap-x-3 pb-1.5 sm:flex">
      {POUR_LABELS.map((l) => (
        <span
          key={l}
          className="font-tr-display w-16 text-right text-[0.55rem] uppercase tracking-[0.14em] text-tr-body/70"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

/** Wine rows carry three pours: 750ml bottle, 375ml bottle and a 125ml glass. */
export function WineRow({ item }: { item: MenuItemView }) {
  return (
    <li className="border-b border-tr-rule/40 py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-tr-display text-[0.95rem] uppercase leading-snug tracking-[0.05em] text-tr-ink">
            {item.name}
            <DietaryIconRow tags={item.tags} />
            {item.unavailable && (
              <span className="font-tr-body ml-2 text-[0.65rem] normal-case tracking-normal text-tr-body/70">
                (currently unavailable)
              </span>
            )}
          </p>
          {item.description && (
            <p className="font-tr-body mt-1.5 text-[0.8rem] leading-relaxed text-tr-body">
              {item.description}
            </p>
          )}
          {item.pairing && (
            <p className="font-tr-body mt-1.5 text-[0.75rem] leading-relaxed text-tr-gold-deep">
              Pairs well with {item.pairing.replace(/^pairs?\s+well\s+with\s*/i, "")}
            </p>
          )}

          {/* Mobile: pours read as labelled pills under the name */}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 sm:hidden">
            {[item.bottlePrice, item.smallerBottlePrice, item.glassPrice].map(
              (p, i) =>
                p == null ? null : (
                  <span key={POUR_LABELS[i]} className="inline-flex items-baseline gap-1.5">
                    <span className="font-tr-display text-[0.55rem] uppercase tracking-[0.12em] text-tr-body/70">
                      {POUR_LABELS[i]}
                    </span>
                    <span className="font-tr-display text-[0.85rem] tabular-nums text-tr-ink">
                      {money(p)}
                    </span>
                  </span>
                ),
            )}
          </div>
        </div>

        {/* Desktop / tablet: three aligned price columns */}
        <div className="font-tr-display hidden shrink-0 items-baseline gap-x-3 text-[0.88rem] tabular-nums text-tr-ink sm:flex">
          <span className="w-16 text-right">{money(item.bottlePrice)}</span>
          <span className="w-16 text-right">{money(item.smallerBottlePrice)}</span>
          <span className="w-16 text-right">{money(item.glassPrice)}</span>
        </div>
      </div>
    </li>
  );
}

/** Food, cocktails and drinks carry a single price and a kcal figure. */
export function PlateRow({ item }: { item: MenuItemView }) {
  return (
    <li className="border-b border-tr-rule/40 py-4 last:border-0">
      <div className="flex items-baseline gap-4">
        <p className="font-tr-display min-w-0 flex-1 text-[0.95rem] uppercase leading-snug tracking-[0.05em] text-tr-ink">
          {item.name}
          <DietaryIconRow tags={item.tags} />
          {item.calories != null && (
            <span className="font-tr-body ml-2 text-[0.68rem] normal-case tracking-normal text-tr-body/75">
              {Math.round(item.calories)} kcal
            </span>
          )}
          {item.unavailable && (
            <span className="font-tr-body ml-2 text-[0.65rem] normal-case tracking-normal text-tr-body/70">
              (currently unavailable)
            </span>
          )}
        </p>
        <span className="font-tr-display shrink-0 text-[0.88rem] tabular-nums text-tr-ink">
          {money(item.standardPrice)}
        </span>
      </div>
      {item.description && (
        <p className="font-tr-body mt-1.5 max-w-prose text-[0.8rem] leading-relaxed text-tr-body">
          {item.description}
        </p>
      )}
      {item.pairing && (
        <p className="font-tr-body mt-1.5 text-[0.75rem] leading-relaxed text-tr-gold-deep">
          Pairs well with {item.pairing.replace(/^pairs?\s+well\s+with\s*/i, "")}
        </p>
      )}
    </li>
  );
}
