import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getItemBySlug, listAssets } from "@/lib/content/api";
import type { ContentAsset, ContentItem } from "@/lib/content/types";
import { detectVideoProvider, youtubePoster } from "@/lib/content/slug";
import { track } from "@/lib/content/analytics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ContentViewer() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const it = await getItemBySlug(slug);
        if (!it) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setItem(it);
        const a = await listAssets(it.id);
        setAssets(a);
        track({ contentItemId: it.id, eventType: "view", pageSlug: slug });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (notFound || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-light">Not found</h1>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Return home</Link>
      </div>
    );
  }

  const seoTitle = item.seo_title || item.title;
  const seoDesc = item.seo_description || item.description || "";
  const ogImage = item.og_image_url || item.cover_image_url || "";

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <ViewerShell item={item}>
        {item.content_type === "pdf" && <PdfViewer item={item} assets={assets} />}
        {item.content_type === "video" && <VideoViewer item={item} />}
        {item.content_type === "gallery" && <GalleryViewer item={item} assets={assets} />}
      </ViewerShell>
    </>
  );
}

function ViewerShell({ item, children }: { item: ContentItem; children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0;
      setProgress(p);
      if (p > 90 && !completedRef.current) {
        completedRef.current = true;
        track({ contentItemId: item.id, eventType: "complete", pageSlug: item.slug });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [item.id, item.slug]);

  async function share() {
    const url = window.location.href;
    track({ contentItemId: item.id, eventType: "share", pageSlug: item.slug });
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  function fullscreen() {
    track({ contentItemId: item.id, eventType: "fullscreen", pageSlug: item.slug });
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  function ctaClick() {
    track({ contentItemId: item.id, eventType: "cta_click", pageSlug: item.slug, metadata: { url: item.cta_url } });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground shrink-0">← Sula</Link>
          <div className="text-xs sm:text-sm font-light truncate">{item.title}</div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={share}>Share</Button>
            <Button size="sm" variant="ghost" onClick={fullscreen} className="hidden sm:inline-flex">Fullscreen</Button>
          </div>
        </div>
        <div className="h-0.5 bg-muted">
          <div className="h-full bg-foreground transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {item.cover_image_url && (
        <section className="relative w-full aspect-[16/10] sm:aspect-[21/9] overflow-hidden bg-muted">
          <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            {item.category && <div className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">{item.category}</div>}
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight max-w-3xl">{item.title}</h1>
            {item.description && <p className="mt-3 text-sm sm:text-base opacity-90 max-w-2xl">{item.description}</p>}
          </div>
        </section>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {item.cta_label && item.cta_url && (
        <div className="sticky bottom-0 z-40 backdrop-blur bg-background/90 border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-end">
            <a href={item.cta_url} target="_blank" rel="noreferrer" onClick={ctaClick}>
              <Button size="sm">{item.cta_label}</Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- PDF Viewer ---------- */
function PdfViewer({ item, assets }: { item: ContentItem; assets: ContentAsset[] }) {
  const pages = assets.filter((a) => a.asset_type === "page_image").sort((a, b) => a.sort_order - b.sort_order);
  const [zoomPage, setZoomPage] = useState<number | null>(null);
  const seen = useRef<Set<number>>(new Set());

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!seen.current.has(idx)) {
              seen.current.add(idx);
              track({ contentItemId: item.id, eventType: "page_view", pageIndex: idx, pageSlug: item.slug });
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll("[data-pdf-page]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [item.id, item.slug, pages.length]);

  if (!pages.length) return <p className="text-muted-foreground text-center py-12">PDF still processing…</p>;

  return (
    <>
      <div className="space-y-4">
        {pages.map((p, i) => (
          <button
            key={p.id}
            data-pdf-page
            data-idx={i}
            onClick={() => setZoomPage(i)}
            className="block w-full bg-muted rounded shadow-sm overflow-hidden"
            style={{ aspectRatio: p.width && p.height ? `${p.width}/${p.height}` : "1/1.414" }}
          >
            <img
              src={p.file_url}
              alt={`Page ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      <Dialog open={zoomPage !== null} onOpenChange={(o) => !o && setZoomPage(null)}>
        <DialogContent className="max-w-screen-lg p-0 bg-black border-0">
          {zoomPage !== null && (
            <div className="overflow-auto max-h-[90vh] touch-pan-x touch-pan-y">
              <img src={pages[zoomPage].file_url} alt={`Page ${zoomPage + 1}`} className="w-auto min-w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- Video Viewer ---------- */
function VideoViewer({ item }: { item: ContentItem }) {
  if (!item.video_url) return <p className="text-muted-foreground text-center py-12">Video coming soon.</p>;
  const det = useMemo(() => detectVideoProvider(item.video_url!), [item.video_url]);
  const [active, setActive] = useState(false);

  if (det.provider === "youtube" && det.embedId) {
    if (!active) {
      return (
        <button
          onClick={() => setActive(true)}
          className="relative block w-full aspect-video bg-black rounded overflow-hidden group"
        >
          <img src={youtubePoster(det.embedId)} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-black ml-1" />
            </div>
          </div>
        </button>
      );
    }
    return (
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${det.embedId}?autoplay=1`}
          title={item.title}
          className="w-full h-full rounded"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (det.provider === "vimeo" && det.embedId) {
    return (
      <div className="aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${det.embedId}`}
          title={item.title}
          className="w-full h-full rounded"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      src={item.video_url}
      controls
      playsInline
      poster={item.cover_image_url ?? undefined}
      className="w-full rounded bg-black"
    />
  );
}

/* ---------- Gallery Viewer ---------- */
function GalleryViewer({ item, assets }: { item: ContentItem; assets: ContentAsset[] }) {
  const images = assets.filter((a) => a.asset_type === "gallery_image").sort((a, b) => a.sort_order - b.sort_order);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return <p className="text-muted-foreground text-center py-12">No images yet.</p>;

  return (
    <>
      <div className="space-y-6">
        {images.map((img, i) => (
          <figure key={img.id} className="space-y-2">
            <button onClick={() => setLightbox(i)} className="block w-full bg-muted rounded overflow-hidden">
              <img
                src={img.file_url}
                alt={img.alt_text ?? ""}
                loading={i < 2 ? "eager" : "lazy"}
                className="w-full h-auto"
              />
            </button>
            {img.caption && <figcaption className="text-sm text-muted-foreground">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-screen-lg p-0 bg-black border-0">
          {lightbox !== null && (
            <div className="flex flex-col">
              <img src={images[lightbox].file_url} alt={images[lightbox].alt_text ?? ""} className="w-full max-h-[85vh] object-contain" />
              <div className="flex items-center justify-between p-3 text-white text-sm">
                <Button variant="ghost" size="sm" disabled={lightbox === 0} onClick={() => setLightbox(lightbox - 1)}>← Prev</Button>
                <span>{lightbox + 1} / {images.length}</span>
                <Button variant="ghost" size="sm" disabled={lightbox === images.length - 1} onClick={() => setLightbox(lightbox + 1)}>Next →</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
