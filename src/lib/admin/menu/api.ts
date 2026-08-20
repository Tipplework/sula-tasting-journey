/**
 * Food & drink menu CMS data layer.
 *
 * Deliberately isolated from the Wine Flight admin (`src/lib/catalogue`,
 * `src/data/wines.ts`): this module only ever touches the menu_* tables and the
 * `menu/tasting-room/items/` folder of the shared public content-images bucket.
 * Every write is audited automatically by the existing menu_change_log triggers.
 */
import { supabase } from "@/integrations/supabase/client";
import type { DietaryTag } from "@/data/tasting-room-menu";

export const MENU_VENUE_SLUG = "tasting-room";
export const MENU_IMAGE_BUCKET = "content-images";
export const MENU_IMAGE_PREFIX = "menu/tasting-room/items";

export const DIETARY_TAGS: DietaryTag[] = [
  "vegetarian",
  "non_vegetarian",
  "vegan",
  "seafood",
  "gluten_free",
  "contains_dairy",
  "contains_nuts",
];

export interface AdminCategory {
  id: string;
  venue_id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  heading_style: "wine" | "default";
  updated_at: string;
}

export interface AdminItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  calories: number | null;
  standard_price: number | null;
  bottle_price: number | null;
  smaller_bottle_price: number | null;
  glass_price: number | null;
  pairing_text: string | null;
  active: boolean;
  unavailable: boolean;
  display_order: number;
  image_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  updated_at: string;
  tags: DietaryTag[];
}

export interface ChangeLogRow {
  id: string;
  table_name: string;
  record_id: string | null;
  action: string;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  created_at: string;
}

const ITEM_COLUMNS =
  "id, category_id, name, description, calories, standard_price, bottle_price, smaller_bottle_price, glass_price, pairing_text, active, unavailable, display_order, image_url, image_path, image_alt, updated_at, menu_item_dietary_tags(tag)";

export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function venueId(): Promise<string> {
  const { data, error } = await supabase
    .from("menu_venues")
    .select("id")
    .eq("slug", MENU_VENUE_SLUG)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("The Tasting Room venue is missing.");
  return data.id;
}

/** Every category, including hidden ones (admins see the full truth). */
export async function listCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, venue_id, name, slug, display_order, active, heading_style, updated_at")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    heading_style: c.heading_style === "wine" ? "wine" : "default",
  })) as AdminCategory[];
}

export async function listItems(): Promise<AdminItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select(ITEM_COLUMNS)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const { menu_item_dietary_tags, ...rest } = row as typeof row & {
      menu_item_dietary_tags: { tag: DietaryTag }[] | null;
    };
    return {
      ...(rest as unknown as Omit<AdminItem, "tags">),
      tags: (menu_item_dietary_tags ?? []).map((t) => t.tag),
    };
  });
}

export interface ItemDraft {
  name: string;
  description: string | null;
  calories: number | null;
  standard_price: number | null;
  bottle_price: number | null;
  smaller_bottle_price: number | null;
  glass_price: number | null;
  pairing_text: string | null;
  category_id: string;
  active: boolean;
  unavailable: boolean;
  image_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  tags: DietaryTag[];
}

async function syncTags(itemId: string, tags: DietaryTag[]) {
  const { error: delErr } = await supabase
    .from("menu_item_dietary_tags")
    .delete()
    .eq("menu_item_id", itemId);
  if (delErr) throw delErr;
  if (!tags.length) return;
  const { error } = await supabase
    .from("menu_item_dietary_tags")
    .insert(tags.map((tag) => ({ menu_item_id: itemId, tag })));
  if (error) throw error;
}

export async function saveItem(id: string | null, draft: ItemDraft) {
  const { tags, ...fields } = draft;
  if (id) {
    const { error } = await supabase.from("menu_items").update(fields).eq("id", id);
    if (error) throw error;
    await syncTags(id, tags);
    return id;
  }
  // New dishes land at the end of their category.
  const { data: last } = await supabase
    .from("menu_items")
    .select("display_order")
    .eq("category_id", draft.category_id)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = ((last?.[0]?.display_order as number | undefined) ?? -10) + 10;
  const { data, error } = await supabase
    .from("menu_items")
    .insert({ ...fields, display_order: nextOrder })
    .select("id")
    .single();
  if (error) throw error;
  await syncTags(data.id, tags);
  return data.id as string;
}

export async function setItemFlags(
  id: string,
  patch: { active?: boolean; unavailable?: boolean },
) {
  const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
  if (error) throw error;
}

/** Persists an explicit dish order inside one category. */
export async function reorderItems(ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("menu_items")
      .update({ display_order: i * 10 })
      .eq("id", ids[i]);
    if (error) throw error;
  }
}

export async function createCategory(name: string, headingStyle: "wine" | "default") {
  const vid = await venueId();
  const cats = await listCategories();
  const order = (cats.at(-1)?.display_order ?? -10) + 10;
  const { error } = await supabase.from("menu_categories").insert({
    venue_id: vid,
    name: name.trim(),
    slug: slugify(name),
    display_order: order,
    active: true,
    heading_style: headingStyle,
  });
  if (error) throw error;
}

export async function updateCategory(
  id: string,
  patch: { name?: string; active?: boolean; display_order?: number },
) {
  const { error } = await supabase.from("menu_categories").update(patch).eq("id", id);
  if (error) throw error;
}

export async function reorderCategories(ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("menu_categories")
      .update({ display_order: i * 10 })
      .eq("id", ids[i]);
    if (error) throw error;
  }
}

/** Uploads a dish photo into the isolated menu folder and returns its URLs. */
export async function uploadItemImage(file: File, itemHint: string) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${MENU_IMAGE_PREFIX}/${slugify(itemHint) || "dish"}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(MENU_IMAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from(MENU_IMAGE_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeStoredImage(path: string | null) {
  if (!path) return;
  await supabase.storage.from(MENU_IMAGE_BUCKET).remove([path]);
}

export async function listChangeLog(limit = 100): Promise<ChangeLogRow[]> {
  const { data, error } = await supabase
    .from("menu_change_log")
    .select("id, table_name, record_id, action, previous_data, new_data, changed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ChangeLogRow[];
}
