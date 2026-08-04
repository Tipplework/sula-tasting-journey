import type { MenuCategoryView } from "./api";

/** Wine list — the pours poured by bottle, half bottle and glass. */
export const WINE_SLUGS = [
  "sparkling",
  "white",
  "rose",
  "red",
  "dessert-wine",
] as const;

/** Everything from the kitchen and the bar. */
export const FOOD_SLUGS = [
  "cocktails",
  "drinks",
  "small-plates",
  "quick-bites",
  "salad",
  "from-the-bread-box",
  "pizza",
  "dessert",
] as const;

export type MenuMode = "wine" | "food" | "all";

const order = (slugs: readonly string[]) =>
  new Map(slugs.map((s, i) => [s, i] as const));

const WINE_ORDER = order(WINE_SLUGS);
const FOOD_ORDER = order(FOOD_SLUGS);

/**
 * Splits the approved menu into the wine list and the food list. Categories the
 * team adds later fall back to their heading style, so nothing is ever hidden.
 */
export function categoriesForMode(
  categories: MenuCategoryView[],
  mode: MenuMode,
): MenuCategoryView[] {
  if (mode === "all") return categories;

  const isWine = (c: MenuCategoryView) =>
    WINE_ORDER.has(c.slug) ||
    (!FOOD_ORDER.has(c.slug) && c.headingStyle === "wine");

  const wanted = categories.filter((c) =>
    mode === "wine" ? isWine(c) : !isWine(c),
  );

  const rank = mode === "wine" ? WINE_ORDER : FOOD_ORDER;
  return [...wanted].sort(
    (a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99),
  );
}

export const MODE_META: Record<
  MenuMode,
  { title: string; kicker: string; path: string }
> = {
  wine: { title: "Wine Menu", kicker: "Wines by the bottle & glass", path: "/menu/wine" },
  food: { title: "Food Menu", kicker: "Cocktails, plates & desserts", path: "/menu/food" },
  all: { title: "Complete Menu", kicker: "Everything we pour and plate", path: "/menu/all" },
};
