import { supabase } from "@/integrations/supabase/client";
import {
  TASTING_ROOM_MENU,
  type DietaryTag,
  type SeedCategory,
} from "@/data/tasting-room-menu";
import { foodImageFor } from "./food-images";

export const VENUE_SLUG = "tasting-room";

export interface MenuItemView {
  id: string;
  name: string;
  description: string | null;
  calories: number | null;
  standardPrice: number | null;
  bottlePrice: number | null;
  smallerBottlePrice: number | null;
  glassPrice: number | null;
  pairing: string | null;
  unavailable: boolean;
  tags: DietaryTag[];
  /**
   * Future-ready fields. Nothing is stored for these yet — the detail panel
   * simply omits any field without approved data, so the schema can grow later
   * without touching the presentation layer.
   */
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageFocalPoint?: string | null;
  extendedDescription?: string | null;
  ingredients?: string | null;
  allergenNotes?: string | null;
  servingSize?: string | null;
  abv?: string | null;
  varietal?: string | null;
  region?: string | null;
  tastingNotes?: string | null;
  chefNote?: string | null;
  recommendedDishes?: string | null;
}

export interface MenuCategoryView {
  id: string;
  slug: string;
  name: string;
  headingStyle: "wine" | "default";
  items: MenuItemView[];
}

/** Deterministic, shareable slug for a single item (used by ?item=…). */
export function itemSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/** Converts the approved PDF seed content into the shape the UI renders. */
function fromSeed(categories: SeedCategory[]): MenuCategoryView[] {
  return categories.map((c) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    headingStyle: c.headingStyle,
    items: c.items.map((i, idx) => ({
      id: `${c.slug}-${idx}`,
      name: i.name,
      description: i.description ?? null,
      calories: i.calories ?? null,
      standardPrice: i.standardPrice ?? null,
      bottlePrice: i.bottlePrice ?? null,
      smallerBottlePrice: i.smallerBottlePrice ?? null,
      glassPrice: i.glassPrice ?? null,
      pairing: i.pairing ?? null,
      unavailable: false,
      tags: i.tags ?? [],
      imageUrl: foodImageFor(i.name, itemSlug(i.name)),
    })),
  }));
}

export const SEED_MENU: MenuCategoryView[] = fromSeed(TASTING_ROOM_MENU);

/**
 * Reads the live menu. Falls back to the approved PDF content whenever the
 * database has not been seeded yet, so the QR code never shows an empty menu.
 */
export async function fetchMenu(): Promise<{
  categories: MenuCategoryView[];
  source: "live" | "approved";
}> {
  try {
    const { data: venue } = await supabase
      .from("menu_venues")
      .select("id")
      .eq("slug", VENUE_SLUG)
      .maybeSingle();
    if (!venue) return { categories: SEED_MENU, source: "approved" };

    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase
        .from("menu_categories")
        .select("id, slug, name, heading_style, display_order")
        .eq("venue_id", venue.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select(
          "id, category_id, name, description, calories, standard_price, bottle_price, smaller_bottle_price, glass_price, pairing_text, unavailable, display_order, menu_item_dietary_tags(tag)",
        )
        .order("display_order", { ascending: true }),
    ]);

    if (!cats?.length || !items?.length) {
      return { categories: SEED_MENU, source: "approved" };
    }

    const byCat = new Map<string, MenuItemView[]>();
    for (const row of items) {
      const list = byCat.get(row.category_id) ?? [];
      list.push({
        id: row.id,
        name: row.name,
        description: row.description,
        calories: row.calories,
        standardPrice: row.standard_price,
        bottlePrice: row.bottle_price,
        smallerBottlePrice: row.smaller_bottle_price,
        glassPrice: row.glass_price,
        pairing: row.pairing_text,
        unavailable: row.unavailable,
        tags: ((row.menu_item_dietary_tags ?? []) as { tag: DietaryTag }[]).map(
          (t) => t.tag,
        ),
        imageUrl: foodImageFor(row.name, itemSlug(row.name)),
      });
      byCat.set(row.category_id, list);
    }

    const categories = cats
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        headingStyle: (c.heading_style === "wine" ? "wine" : "default") as
          | "wine"
          | "default",
        items: byCat.get(c.id) ?? [],
      }))
      .filter((c) => c.items.length > 0);

    return categories.length
      ? { categories, source: "live" }
      : { categories: SEED_MENU, source: "approved" };
  } catch {
    return { categories: SEED_MENU, source: "approved" };
  }
}

export interface GuestRegistrationInput {
  fullName: string;
  mobile: string;
  birthDay: number | null;
  birthMonth: number | null;
  marketingConsent: boolean;
}

function sessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "trMenuSessionId";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid =
      (crypto?.randomUUID?.() as string | undefined) ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

export async function submitGuestRegistration(input: GuestRegistrationInput) {
  const params =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);

  // PII is written server-side (validated + rate limited) — never inserted
  // straight into the table from the browser.
  const { data, error } = await supabase.functions.invoke("log-guest", {
    body: {
      kind: "registration",
      fullName: input.fullName.trim(),
      mobile: input.mobile,
      birthDay: input.birthDay,
      birthMonth: input.birthMonth,
      marketingConsent: input.marketingConsent,
      venueSlug: VENUE_SLUG,
      source: "qr_digital_menu",
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      sessionId: sessionId(),
    },
  });
  if (error) throw error;
  if (data && typeof data === "object" && "error" in (data as Record<string, unknown>)) {
    throw new Error(String((data as Record<string, unknown>).error));
  }
}

