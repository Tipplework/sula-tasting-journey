import type { DietaryTag } from "@/data/tasting-room-menu";
import { DIETARY_LABELS } from "@/data/tasting-room-menu";
import icVeg from "@/assets/menu/ic-veg.webp";
import icNonVeg from "@/assets/menu/ic-nonveg.webp";
import icSeafood from "@/assets/menu/ic-seafood.webp";
import icGlutenFree from "@/assets/menu/ic-glutenfree.webp";
import icDairy from "@/assets/menu/ic-dairy.webp";
import icVegan from "@/assets/menu/ic-vegan.webp";
import icNuts from "@/assets/menu/ic-nuts.webp";

/** Exact approved markers lifted from the printed menu artwork. */
export const DIETARY_ICONS: Record<DietaryTag, string> = {
  vegetarian: icVeg,
  non_vegetarian: icNonVeg,
  seafood: icSeafood,
  gluten_free: icGlutenFree,
  contains_dairy: icDairy,
  vegan: icVegan,
  contains_nuts: icNuts,
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
