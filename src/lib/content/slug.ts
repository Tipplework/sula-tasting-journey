import { supabase } from "@/integrations/supabase/client";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Ensure slug is unique in content_items. Appends -2, -3, … if needed.
 * Pass `excludeId` to ignore the current row when editing.
 */
export async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "untitled";
  let query = supabase.from("content_items").select("slug").like("slug", `${root}%`);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw error;
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export function detectVideoProvider(url: string): { provider: "youtube" | "vimeo" | "file"; embedId?: string } {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ?? "";
      return { provider: "youtube", embedId: id };
    }
    if (u.hostname.includes("vimeo.com")) {
      return { provider: "vimeo", embedId: u.pathname.replace(/^\//, "") };
    }
  } catch {/* not a url */}
  return { provider: "file" };
}

export function youtubePoster(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}
