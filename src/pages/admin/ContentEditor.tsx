import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createItem,
  deleteAssetsByItem,
  getItemById,
  insertAssets,
  listAssets,
  updateItem,
} from "@/lib/content/api";
import type { ContentItem, ContentType } from "@/lib/content/types";
import { detectVideoProvider, ensureUniqueSlug, slugify } from "@/lib/content/slug";
import { uploadImage, uploadVideo } from "@/lib/content/upload";
import { processPdf } from "@/lib/content/pdf-processor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContentEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [currentId, setCurrentId] = useState<string | undefined>(id);
  const isNew = !currentId;

  const [item, setItem] = useState<Partial<ContentItem>>({
    content_type: "pdf",
    published: false,
    featured: false,
    sort_order: 0,
    page_count: 0,
    slug: "",
    title: "",
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [assetCount, setAssetCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    setCurrentId(id);
    (async () => {
      try {
        const it = await getItemById(id);
        if (it) setItem(it);
        const assets = await listAssets(id);
        setAssetCount(assets.length);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const previewUrl = useMemo(() => (item.slug ? `/c/${item.slug}` : ""), [item.slug]);

  function patch<K extends keyof ContentItem>(k: K, v: ContentItem[K]) {
    setItem((p) => ({ ...p, [k]: v }));
  }

  async function save(): Promise<string> {
    // Strip server-managed fields so we never send id/timestamps on insert.
    const { id: _omitId, created_at: _omitCreated, updated_at: _omitUpdated, ...rest } = item as ContentItem;
    const payload: Partial<ContentItem> = {
      ...rest,
      slug: item.slug || slugify(item.title || ""),
    };
    if (!payload.title) {
      throw new Error("Title is required");
    }
    payload.slug = await ensureUniqueSlug(payload.slug as string, currentId);
    if (!currentId) {
      const created = await createItem(payload);
      setItem(created);
      setCurrentId(created.id);
      window.history.replaceState(null, "", `/content-center/${created.id}/edit`);
      return created.id;
    }
    const updated = await updateItem(currentId, payload);
    setItem(updated);
    return updated.id;
  }

  async function handleSave() {
    setSaving(true);
    try {
      await save();
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  async function handleCoverUpload(file: File) {
    setSaving(true);
    try {
      const itemId = await save();
      const url = await uploadImage(itemId, file, "covers");
      const updated = await updateItem(itemId, { cover_image_url: url, og_image_url: item.og_image_url || url });
      setItem(updated);
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  async function handlePdfUpload(file: File) {
    setSaving(true);
    setProgress("Saving item…");
    try {
      const itemId = await save();
      setProgress("Uploading PDF…");
      const result = await processPdf(itemId, file, (p) =>
        setProgress(`${p.stage} ${p.current}/${p.total}`),
      );
      await deleteAssetsByItem(itemId);
      await insertAssets(
        result.pages.map((p, i) => ({
          content_item_id: itemId,
          asset_type: "page_image",
          file_url: p.fullUrl,
          thumbnail_url: p.thumbUrl,
          sort_order: i,
          width: p.width,
          height: p.height,
        })),
      );
      const updated = await updateItem(itemId, {
        page_count: result.pageCount,
        cover_image_url: item.cover_image_url || result.coverUrl,
        og_image_url: item.og_image_url || result.coverUrl,
      });
      setItem(updated);
      setAssetCount(result.pageCount);
      toast.success(`Processed ${result.pageCount} pages`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setProgress("");
    setSaving(false);
  }

  async function handleVideoUpload(file: File) {
    setSaving(true);
    try {
      const itemId = await save();
      const url = await uploadVideo(itemId, file);
      const updated = await updateItem(itemId, {
        video_url: url,
        video_provider: "file",
      });
      setItem(updated);
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  async function handleVideoUrl(url: string) {
    const det = detectVideoProvider(url);
    patch("video_url", url);
    patch("video_provider", det.provider);
  }

  async function handleGalleryUpload(files: FileList) {
    setSaving(true);
    setProgress("Saving item…");
    try {
      const itemId = await save();
      const rows = [];
      let i = 0;
      for (const f of Array.from(files)) {
        setProgress(`Uploading ${++i}/${files.length}`);
        const url = await uploadImage(itemId, f, "gallery");
        rows.push({
          content_item_id: itemId,
          asset_type: "gallery_image" as const,
          file_url: url,
          sort_order: assetCount + i - 1,
        });
      }
      const inserted = await insertAssets(rows);
      setAssetCount((c) => c + inserted.length);
      if (!item.cover_image_url && inserted[0]) {
        await updateItem(itemId, { cover_image_url: inserted[0].file_url });
        setItem((p) => ({ ...p, cover_image_url: inserted[0].file_url }));
      }
      toast.success(`Added ${inserted.length} images`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setProgress("");
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/content-center" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="text-xl font-light tracking-tight">{isNew ? "New content" : "Edit content"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {previewUrl && !isNew && (
              <a href={previewUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">Preview</Button></a>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={item.title ?? ""}
                onChange={(e) => {
                  patch("title", e.target.value);
                  if (isNew && !item.slug) patch("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={item.slug ?? ""}
                onChange={(e) => patch("slug", slugify(e.target.value))}
                placeholder="my-story"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={item.content_type ?? "pdf"} onValueChange={(v) => patch("content_type", v as ContentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={item.category ?? ""} onChange={(e) => patch("category", e.target.value)} placeholder="Brochure, Story…" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} value={item.description ?? ""} onChange={(e) => patch("description", e.target.value)} />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!item.published} onCheckedChange={(v) => patch("published", v)} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!item.featured} onCheckedChange={(v) => patch("featured", v)} />
              Featured
            </label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Cover & Sharing</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 bg-muted rounded overflow-hidden">
              {item.cover_image_url && <img src={item.cover_image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
              />
              <span className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-accent">Upload cover</span>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input value={item.seo_title ?? ""} onChange={(e) => patch("seo_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SEO description</Label>
              <Input value={item.seo_description ?? ""} onChange={(e) => patch("seo_description", e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input value={item.cta_label ?? ""} onChange={(e) => patch("cta_label", e.target.value)} placeholder="Book a tasting" />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input value={item.cta_url ?? ""} onChange={(e) => patch("cta_url", e.target.value)} placeholder="https://…" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {item.content_type === "pdf" ? "PDF source" : item.content_type === "video" ? "Video source" : "Gallery images"}
          </h2>

          {item.content_type === "pdf" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload a PDF. Pages render to mobile-optimized images automatically.
                {item.page_count ? ` ${item.page_count} pages stored.` : ""}
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
                  {item.page_count ? "Replace PDF" : "Upload PDF"}
                </span>
              </label>
            </div>
          )}

          {item.content_type === "video" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>YouTube / Vimeo URL</Label>
                <Input
                  value={item.video_url ?? ""}
                  onChange={(e) => handleVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=…"
                />
                {item.video_provider && <p className="text-xs text-muted-foreground">Detected: {item.video_provider}</p>}
              </div>
              <div className="text-xs text-muted-foreground">— or —</div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-accent">Upload video file</span>
              </label>
            </div>
          )}

          {item.content_type === "gallery" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{assetCount} images in this gallery.</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files?.length && handleGalleryUpload(e.target.files)}
                />
                <span className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-accent">Add images</span>
              </label>
            </div>
          )}

          {progress && <p className="text-xs text-muted-foreground">{progress}</p>}
        </Card>
      </main>
    </div>
  );
}
