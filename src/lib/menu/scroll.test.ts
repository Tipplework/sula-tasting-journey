import { describe, expect, it, vi, beforeEach } from "vitest";
import { scrollToSection, sectionId, stickyOffset } from "@/lib/menu/scroll";
import { FOOD_SLUGS, WINE_SLUGS } from "@/lib/menu/groups";

describe("sectionId", () => {
  it("produces the approved stable ids for every food category", () => {
    expect(FOOD_SLUGS.map((s) => sectionId(s, "food"))).toEqual([
      "food-cocktails",
      "food-drinks",
      "food-small-plates",
      "food-quick-bites",
      "food-salad",
      "food-bread-box",
      "food-pizza",
      "food-dessert",
    ]);
  });

  it("produces the approved stable ids for every wine category", () => {
    expect(WINE_SLUGS.map((s) => sectionId(s, "wine"))).toEqual([
      "wine-sparkling",
      "wine-white",
      "wine-rose",
      "wine-red",
      "wine-dessert",
    ]);
  });

  it("keeps ids unique on the complete menu", () => {
    const ids = [
      ...WINE_SLUGS.map((s) => sectionId(s, "all")),
      ...FOOD_SLUGS.map((s) => sectionId(s, "all")),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("scrollToSection", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header data-menu-sticky-shell></header>
      <section id="food-pizza"></section>`;
    const shell = document.querySelector("[data-menu-sticky-shell]")!;
    shell.getBoundingClientRect = () => ({ height: 100 }) as DOMRect;
    document.getElementById("food-pizza")!.getBoundingClientRect = () =>
      ({ top: 600 }) as DOMRect;
    window.scrollY = 200;
  });

  it("includes the measured sticky shell height in the offset", () => {
    expect(stickyOffset()).toBe(112);
  });

  it("scrolls so the heading clears the sticky navigation", () => {
    const spy = vi.fn();
    window.scrollTo = spy as unknown as typeof window.scrollTo;
    scrollToSection("food-pizza");
    // 600 (rect top) + 200 (scrollY) - 112 (shell + gap)
    expect(spy).toHaveBeenCalledWith({ top: 688, behavior: "smooth" });
  });

  it("ignores unknown sections instead of scrolling to the top", () => {
    const spy = vi.fn();
    window.scrollTo = spy as unknown as typeof window.scrollTo;
    scrollToSection("food-nope");
    expect(spy).not.toHaveBeenCalled();
  });
});
