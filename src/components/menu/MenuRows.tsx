import type { MenuItemView } from "@/lib/menu/api";
import { DietaryIconRow } from "./DietaryIcon";

function price(v: number | null) {
  return v == null ? "—" : `${Math.round(v)}`;
}

/** Wine rows carry three pours: 750ml bottle, 375ml bottle and a 125ml glass. */
export function WineRow({ item }: { item: MenuItemView }) {
  return (
    <li className="border-b border-tr-rule/50 py-3 last:border-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-tr-display text-[0.92rem] uppercase leading-snug tracking-[0.05em] text-tr-ink">
            {item.name}
            <DietaryIconRow tags={item.tags} />
            {item.unavailable && (
              <span className="font-tr-body ml-2 text-[0.65rem] normal-case tracking-normal text-tr-body/70">
                (currently unavailable)
              </span>
            )}
          </p>
          {item.description && (
            <p className="font-tr-body mt-1 text-[0.76rem] leading-relaxed text-tr-body">
              {item.description}
            </p>
          )}
          {item.pairing && (
            <p className="font-tr-body mt-1 text-[0.72rem] italic leading-relaxed text-tr-gold-deep">
              {item.pairing}
            </p>
          )}
        </div>
        <div className="font-tr-display grid shrink-0 grid-cols-3 gap-x-2 text-right text-[0.82rem] tabular-nums text-tr-ink">
          <span className="w-11">{price(item.bottlePrice)}</span>
          <span className="w-11">{price(item.smallerBottlePrice)}</span>
          <span className="w-11">{price(item.glassPrice)}</span>
        </div>
      </div>
    </li>
  );
}

/** Food, cocktails and drinks carry a single price and a kcal figure. */
export function PlateRow({ item }: { item: MenuItemView }) {
  return (
    <li className="border-b border-tr-rule/50 py-3 last:border-0">
      <div className="flex items-baseline gap-3">
        <p className="font-tr-display min-w-0 flex-1 text-[0.92rem] uppercase leading-snug tracking-[0.05em] text-tr-ink">
          {item.name}
          <DietaryIconRow tags={item.tags} />
          {item.calories != null && (
            <span className="font-tr-body ml-2 text-[0.68rem] normal-case tracking-normal text-tr-body/80">
              {Math.round(item.calories)} kcal
            </span>
          )}
          {item.unavailable && (
            <span className="font-tr-body ml-2 text-[0.65rem] normal-case tracking-normal text-tr-body/70">
              (currently unavailable)
            </span>
          )}
        </p>
        <span className="font-tr-display shrink-0 text-[0.85rem] tabular-nums text-tr-ink">
          {price(item.standardPrice)}
        </span>
      </div>
      {item.description && (
        <p className="font-tr-body mt-1 max-w-prose text-[0.76rem] leading-relaxed text-tr-body">
          {item.description}
        </p>
      )}
      {item.pairing && (
        <p className="font-tr-body mt-1 text-[0.72rem] italic leading-relaxed text-tr-gold-deep">
          {item.pairing}
        </p>
      )}
    </li>
  );
}
