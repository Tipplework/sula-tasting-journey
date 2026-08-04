import { describe, expect, it } from "vitest";
import { SEED_MENU, itemSlug } from "@/lib/menu/api";
import { categoriesForMode } from "@/lib/menu/groups";

const names = (mode: Parameters<typeof categoriesForMode>[1]) =>
  categoriesForMode(SEED_MENU, mode).map((c) => c.name);

describe("top-level menu separation", () => {
  it("keeps the food menu to its six kitchen categories", () => {
    expect(names("food")).toEqual([
      "Small Plates",
      "Quick Bites",
      "Salad",
      "From The Bread Box",
      "Pizza",
      "Dessert",
    ]);
  });

  it("never shows cocktails or drinks inside food", () => {
    const food = names("food");
    expect(food).not.toContain("Cocktails");
    expect(food).not.toContain("Drinks");
  });

  it("keeps the wine menu to its five pouring categories", () => {
    expect(categoriesForMode(SEED_MENU, "wine")).toHaveLength(5);
    expect(names("wine")).toEqual([
      "Sparkling",
      "White",
      "Rosé",
      "Red",
      "Dessert",
    ]);
  });

  it("serves cocktails as their own menu with all six serves", () => {
    const cocktails = categoriesForMode(SEED_MENU, "cocktails");
    expect(cocktails).toHaveLength(1);
    expect(cocktails[0].items.map((i) => i.name)).toEqual([
      "Pears Impression",
      "Watermelon & Basil Bramble",
      "Strawberry Spritzer",
      "Sangria",
      "Bellini",
      "Mimosa",
    ]);
  });

  it("serves drinks as their own menu with all six pours", () => {
    const drinks = categoriesForMode(SEED_MENU, "drinks");
    expect(drinks).toHaveLength(1);
    expect(drinks[0].items).toHaveLength(6);
    const cappuccino = drinks[0].items.find((i) => i.name === "Cappuccino");
    expect(cappuccino?.tags).toContain("contains_dairy");
  });

  it("gives every item a unique shareable slug", () => {
    const slugs = SEED_MENU.flatMap((c) => c.items.map((i) => itemSlug(i.name)));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(itemSlug("Watermelon & Basil Bramble")).toBe(
      "watermelon-and-basil-bramble",
    );
  });
});
