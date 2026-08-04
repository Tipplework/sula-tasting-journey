import type { MenuCategoryView } from "./api";

/** Wine list — the pours poured by bottle, half bottle and glass. */
export const WINE_SLUGS = [
  "sparkling",
  "white",
  "rose",
  "red",
  "dessert-wine",
] as const;

/** Wine-led signature cocktails — a top-level menu of its own. */
export const COCKTAIL_SLUGS = ["cocktails"] as const;

/** Coffee, tea, juices, aerated drinks and water — a top-level menu of its own. */
export const DRINK_SLUGS = ["drinks"] as const;

/** Everything from the kitchen. Cocktails and drinks are deliberately absent. */
export const FOOD_SLUGS = [
  "small-plates",
  "quick-bites",
  "salad",
  "from-the-bread-box",
  "pizza",
  "dessert",
] as const;

export type MenuMode = "wine" | "cocktails" | "drinks" | "food" | "all";

const order = (slugs: readonly string[]) =>
  new Map(slugs.map((s, i) => [s, i] as const));

const WINE_ORDER = order(WINE_SLUGS);
const COCKTAIL_ORDER = order(COCKTAIL_SLUGS);
const DRINK_ORDER = order(DRINK_SLUGS);
const FOOD_ORDER = order(FOOD_SLUGS);

const ORDERS: Record<Exclude<MenuMode, "all">, Map<string, number>> = {
  wine: WINE_ORDER,
  cocktails: COCKTAIL_ORDER,
  drinks: DRINK_ORDER,
  food: FOOD_ORDER,
};

/** Which top-level menu a category belongs to. */
export function familyForSlug(
  slug: string,
  headingStyle: "wine" | "default" = "default",
): Exclude<MenuMode, "all"> {
  if (WINE_ORDER.has(slug)) return "wine";
  if (COCKTAIL_ORDER.has(slug)) return "cocktails";
  if (DRINK_ORDER.has(slug)) return "drinks";
  if (FOOD_ORDER.has(slug)) return "food";
  // Categories the team adds later never disappear: wine-styled headings join
  // the wine list, everything else joins the food menu.
  return headingStyle === "wine" ? "wine" : "food";
}

/**
 * Splits the approved menu into the four guest-facing menus. Categories the
 * team adds later fall back to their heading style, so nothing is ever hidden.
 */
export function categoriesForMode(
  categories: MenuCategoryView[],
  mode: MenuMode,
): MenuCategoryView[] {
  if (mode === "all") return categories;

  const wanted = categories.filter(
    (c) => familyForSlug(c.slug, c.headingStyle) === mode,
  );
  const rank = ORDERS[mode];
  return [...wanted].sort(
    (a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99),
  );
}

export const MODE_META: Record<
  MenuMode,
  { title: string; short: string; kicker: string; path: string }
> = {
  wine: {
    title: "Wine Menu",
    short: "Wine",
    kicker:
      "Sparkling, white, rosé, red and dessert wines by bottle, 375 ml and glass.",
    path: "/menu/wine",
  },
  cocktails: {
    title: "Cocktails",
    short: "Cocktails",
    kicker:
      "Wine-led signature cocktails, sparkling serves and refreshing house favourites.",
    path: "/menu/cocktails",
  },
  drinks: {
    title: "Drinks",
    short: "Drinks",
    kicker: "Coffee, tea, juices, aerated beverages and bottled water.",
    path: "/menu/drinks",
  },
  food: {
    title: "Food Menu",
    short: "Food",
    kicker:
      "Small plates, quick bites, salads, breads, pizzas and desserts.",
    path: "/menu/food",
  },
  all: {
    title: "Complete Menu",
    short: "All",
    kicker: "Everything we pour and plate.",
    path: "/menu/all",
  },
};

export const SWITCHER_MODES: Exclude<MenuMode, "all">[] = [
  "wine",
  "cocktails",
  "drinks",
  "food",
];
