import { supabase } from "@/integrations/supabase/client";

export async function uploadImage(itemId: string, file: File, folder = "covers") {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${itemId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("content-images")
    .upload(key, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from("content-images").getPublicUrl(key).data.publicUrl;
}

export async function uploadVideo(itemId: string, file: File) {
  const ext = file.name.split(".").pop() || "mp4";
  const key = `${itemId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("content-videos")
    .upload(key, file, { upsert: true, contentType: file.type || "video/mp4" });
  if (error) throw error;
  return supabase.storage.from("content-videos").getPublicUrl(key).data.publicUrl;
}
