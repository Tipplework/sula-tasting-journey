import { useEffect, useState } from "react";
import { fetchMenu, SEED_MENU, type MenuCategoryView } from "./api";

/**
 * Module-level cache so moving between the wine and food routes never refetches
 * the menu (and never re-flashes the seed content).
 */
let cache: MenuCategoryView[] | null = null;
let inflight: Promise<MenuCategoryView[]> | null = null;

function load() {
  if (!inflight) {
    inflight = fetchMenu()
      .then((res) => {
        cache = res.categories;
        return res.categories;
      })
      .catch(() => SEED_MENU);
  }
  return inflight;
}

export function useMenu(): MenuCategoryView[] {
  const [categories, setCategories] = useState<MenuCategoryView[]>(
    cache ?? SEED_MENU,
  );

  useEffect(() => {
    let live = true;
    load().then((next) => {
      if (live) setCategories(next);
    });
    return () => {
      live = false;
    };
  }, []);

  return categories;
}

/** Warms the cache while the guest is still on the landing screen. */
export function prefetchMenu() {
  void load();
}
