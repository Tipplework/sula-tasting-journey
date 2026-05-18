export type ContentType = "pdf" | "video" | "gallery";
export type AssetType = "page_image" | "gallery_image" | "thumbnail" | "download";

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  content_type: ContentType;
  category: string | null;
  description: string | null;
  cover_image_url: string | null;
  primary_file_url: string | null;
  video_url: string | null;
  video_provider: string | null;
  cta_label: string | null;
  cta_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  page_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentAsset {
  id: string;
  content_item_id: string;
  asset_type: AssetType;
  file_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  created_at: string;
}
