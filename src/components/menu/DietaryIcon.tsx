import type { DietaryTag } from "@/data/tasting-room-menu";
import { DIETARY_LABELS } from "@/data/tasting-room-menu";
import icVeg from "@/assets/menu/ic-veg.webp.asset.json";
import icNonVeg from "@/assets/menu/ic-nonveg.webp.asset.json";
import icSeafood from "@/assets/menu/ic-seafood.webp.asset.json";
import icGlutenFree from "@/assets/menu/ic-glutenfree.webp.asset.json";
import icDairy from "@/assets/menu/ic-dairy.webp.asset.json";
import icVegan from "@/assets/menu/ic-vegan.webp.asset.json";
import icNuts from "@/assets/menu/ic-nuts.webp.asset.json";

/** Exact approved markers lifted from the printed menu artwork. */
export const DIETARY_ICONS: Record<DietaryTag, string> = {
  vegetarian: icVeg.url,
  non_vegetarian: icNonVeg.url,
  seafood: icSeafood.url,
  gluten_free: icGlutenFree.url,
  contains_dairy: icDairy.url,
  vegan: icVegan.url,
  contains_nuts: icNuts.url,
};

export const DIETARY_ORDER: DietaryTag[] = [
  "vegetarian",
  "non_vegetarian",
  "seafood",
  "gluten_free",
  "contains_dairy",
  "vegan",
  "contains_nuts",
];

export function DietaryIcon({
  tag,
  size = 14,
}: {
  tag: DietaryTag;
  size?: number;
}) {
  return (
    <img
      src={DIETARY_ICONS[tag]}
      alt={DIETARY_LABELS[tag]}
      title={DIETARY_LABELS[tag]}
      width={size}
      height={size}
      loading="lazy"
      className="inline-block shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function DietaryIconRow({
  tags,
  size = 14,
}: {
  tags: DietaryTag[];
  size?: number;
}) {
  if (!tags.length) return null;
  return (
    <span className="ml-1.5 inline-flex items-center gap-1 align-middle">
      {DIETARY_ORDER.filter((t) => tags.includes(t)).map((t) => (
        <DietaryIcon key={t} tag={t} size={size} />
      ))}
    </span>
  );
}
