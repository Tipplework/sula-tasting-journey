import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { DIETARY_LABELS, type DietaryTag } from "@/data/tasting-room-menu";
import { DietaryIcon } from "./DietaryIcon";
import type { MenuItemView } from "@/lib/menu/api";
import type { MenuMode } from "@/lib/menu/groups";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { money, POUR_LABELS } from "./MenuItemTile";
import artBottle from "@/assets/menu/art-bottle.webp";
import artSwirl from "@/assets/menu/art-swirl.webp";
import artGrape from "@/assets/menu/art-grape-divider.webp";
import artBarrels from "@/assets/menu/art-barrels.webp";

const PLACEHOLDER_ART: Record<string, string> = {
  wine: artBottle,
  cocktails: artSwirl,
  drinks: artGrape,
  food: artBarrels,
};

/** Only ever renders fields that carry approved data. */
function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="border-t border-tr-rule/40 py-2.5">
      <dt className="font-tr-display text-[0.58rem] uppercase tracking-[0.16em] text-tr-body/70">
        {label}
      </dt>
      <dd className="font-tr-body mt-1 text-[0.82rem] leading-relaxed text-tr-ink">
        {value}
      </dd>
    </div>
  );
}

export function MenuItemDetail({
  item,
  family,
  categoryName,
  onClose,
}: {
  item: MenuItemView;
  family: MenuMode;
  categoryName: string;
  onClose: () => void;
}) {
  useScrollLock(true);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const isWine = family === "wine";
  const pours = [item.bottlePrice, item.smallerBottlePrice, item.glassPrice];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-tr-black/45"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} details`}
        className="tr-detail-panel relative flex max-h-[92svh] w-full flex-col rounded-t-3xl bg-tr-cream sm:max-h-[86svh] sm:max-w-[540px] sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 px-5 pb-2 pt-4">
          <span className="font-tr-display flex-1 text-[0.6rem] uppercase tracking-[0.2em] text-tr-body/70">
            {categoryName}
          </span>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close item details"
            className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full text-tr-black/70 hover:bg-tr-olive/10 active:bg-tr-olive/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="tr-detail-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Future-ready image area: real photography drops straight in here. */}
          <div className="relative mx-auto aspect-[4/5] w-full max-h-[46svh] max-w-[320px] overflow-hidden rounded-2xl border border-tr-rule/50 bg-tr-cover sm:max-h-[52vh]">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.imageAlt ?? item.name}
                loading="lazy"
                className="h-full w-full object-cover object-center"
                style={{ objectPosition: item.imageFocalPoint ?? "center" }}
              />
            ) : (
              <>
                <img
                  src={PLACEHOLDER_ART[family] ?? artSwirl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 m-auto h-[72%] w-auto opacity-25"
                />
                <span className="font-tr-script absolute bottom-3 left-4 text-[1.05rem] text-tr-gold-deep">
                  The Tasting Room
                </span>
              </>
            )}
          </div>

          <h2 className="font-tr-display mt-4 text-[1.15rem] uppercase leading-tight tracking-[0.08em] text-tr-black">
            {item.name}
          </h2>

          {isWine ? (
            <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
              {pours.map((p, i) =>
                p == null ? null : (
                  <span key={POUR_LABELS[i]} className="flex flex-col">
                    <span className="font-tr-display text-[0.55rem] uppercase tracking-[0.14em] text-tr-body/70">
                      {POUR_LABELS[i]}
                    </span>
                    <span className="font-tr-display text-[1rem] tabular-nums text-tr-ink">
                      {money(p)}
                    </span>
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="font-tr-display mt-2 text-[1rem] tabular-nums text-tr-ink">
              {money(item.standardPrice)}
            </p>
          )}

          {item.calories != null && (
            <p className="font-tr-body mt-2 text-[0.75rem] text-tr-body">
              {Math.round(item.calories)} kcal
            </p>
          )}

          {item.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((t: DietaryTag) => (
                <li
                  key={t}
                  className="font-tr-body inline-flex items-center gap-1.5 rounded-full border border-tr-rule/60 px-2.5 py-1 text-[0.7rem] text-tr-ink"
                >
                  <DietaryIcon tag={t} size={13} />
                  {DIETARY_LABELS[t]}
                </li>
              ))}
            </ul>
          )}

          {item.unavailable && (
            <p className="font-tr-body mt-3 text-[0.78rem] text-tr-red">
              Currently unavailable
            </p>
          )}

          {item.description && (
            <p className="font-tr-body mt-4 text-[0.85rem] leading-relaxed text-tr-body">
              {item.description}
            </p>
          )}

          <dl className="mt-4">
            <Fact label="More" value={item.extendedDescription} />
            <Fact label="Ingredients" value={item.ingredients} />
            <Fact label="Allergens" value={item.allergenNotes} />
            <Fact label="Serving" value={item.servingSize} />
            <Fact label="ABV" value={item.abv} />
            <Fact label="Varietal" value={item.varietal} />
            <Fact label="Region" value={item.region} />
            <Fact label="Tasting notes" value={item.tastingNotes} />
            <Fact label="Chef's note" value={item.chefNote} />
            <Fact label="Recommended dishes" value={item.recommendedDishes} />
            <Fact
              label="Pairs well with"
              value={
                item.pairing
                  ? item.pairing.replace(/^pairs?\s+well\s+with\s*/i, "")
                  : null
              }
            />
          </dl>
        </div>
      </div>
    </div>
  );
}
