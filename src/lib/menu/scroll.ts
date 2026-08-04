import type { MenuMode } from "./groups";

/** Deterministic, stable DOM ids for every menu section. */
const SLUG_ALIAS: Record<string, string> = {
  "from-the-bread-box": "bread-box",
  "dessert-wine": "dessert",
};

const WINE = new Set(["sparkling", "white", "rose", "red", "dessert-wine"]);

export function sectionId(slug: string, mode: MenuMode) {
  const family = mode === "all" ? (WINE.has(slug) ? "wine" : "food") : mode;
  return `${family}-${SLUG_ALIAS[slug] ?? slug}`;
}

/** Live height of the whole sticky shell (compact header + category rail). */
export function stickyOffset() {
  const shell = document.querySelector<HTMLElement>("[data-menu-sticky-shell]");
  return (shell?.getBoundingClientRect().height ?? 0) + 12;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Single source of truth for jumping to a section. Accounts for the measured
 * sticky shell so headings are never hidden underneath the navigation.
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - stickyOffset(),
  );
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}
