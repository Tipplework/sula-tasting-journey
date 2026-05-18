import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

export interface HomepageSection {
  id: string;
  section_type: "featured" | "collection" | "editorial" | "cta" | string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  item_slugs: string[];
  sort_order: number;
  enabled: boolean;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as SiteSettings | null) ?? null;
}

export async function upsertSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const existing = await getSiteSettings();
  if (existing) {
    const { data, error } = await supabase
      .from("site_settings")
      .update(patch as any)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as SiteSettings;
  }
  const { data, error } = await supabase
    .from("site_settings")
    .insert({ singleton: true, ...patch } as any)
    .select()
    .single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function listSections(includeDisabled = false): Promise<HomepageSection[]> {
  let q = supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true });
  if (!includeDisabled) q = q.eq("enabled", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as HomepageSection[];
}

export async function createSection(input: Partial<HomepageSection>): Promise<HomepageSection> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .insert(input as any)
    .select()
    .single();
  if (error) throw error;
  return data as HomepageSection;
}

export async function updateSection(id: string, patch: Partial<HomepageSection>): Promise<HomepageSection> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .update(patch as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HomepageSection;
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
  if (error) throw error;
}
