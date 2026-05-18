import { supabase } from "@/integrations/supabase/client";
import type { ContentItem, ContentAsset } from "./types";

export async function listContentItems(includeUnpublished = false) {
  let q = supabase.from("content_items").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (!includeUnpublished) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ContentItem[];
}

export async function getItemBySlug(slug: string, allowUnpublished = false) {
  let q = supabase.from("content_items").select("*").eq("slug", slug).maybeSingle();
  const { data, error } = await q;
  if (error) throw error;
  if (!data) return null;
  if (!allowUnpublished && !data.published) return null;
  return data as ContentItem;
}

export async function getItemById(id: string) {
  const { data, error } = await supabase.from("content_items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ContentItem | null;
}

export async function createItem(input: Partial<ContentItem>) {
  const { data, error } = await supabase.from("content_items").insert(input as any).select().single();
  if (error) throw error;
  return data as ContentItem;
}

export async function updateItem(id: string, patch: Partial<ContentItem>) {
  const { data, error } = await supabase.from("content_items").update(patch as any).eq("id", id).select().single();
  if (error) throw error;
  return data as ContentItem;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) throw error;
}

export async function listAssets(itemId: string) {
  const { data, error } = await supabase
    .from("content_assets")
    .select("*")
    .eq("content_item_id", itemId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentAsset[];
}

export async function insertAssets(rows: Partial<ContentAsset>[]) {
  if (!rows.length) return [];
  const { data, error } = await supabase.from("content_assets").insert(rows as any).select();
  if (error) throw error;
  return data as ContentAsset[];
}

export async function deleteAssetsByItem(itemId: string) {
  const { error } = await supabase.from("content_assets").delete().eq("content_item_id", itemId);
  if (error) throw error;
}
