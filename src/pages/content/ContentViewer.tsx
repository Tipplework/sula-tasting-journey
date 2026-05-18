import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getItemBySlug, listAssets } from "@/lib/content/api";
import type { ContentAsset, ContentItem } from "@/lib/content/types";
import { detectVideoProvider, youtubePoster } from "@/lib/content/slug";
import { track } from "@/lib/content/analytics";
import { getLibraryHref } from "@/lib/content/library-href";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Maximize2, Share2, Download, BookOpen, ScrollText, X } from "lucide-react";

const MODE_STORAGE_KEY = "sula:pdf:viewmode";

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
        if (!it) { setNotFound(true); setLoading(false); return; }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a1614] text-white/60 text-sm tracking-widest uppercase">Loading…</div>;
  if (notFound || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#1a1614] text-white">
        <h1 className="text-2xl font-light">Not found</h1>
        <Link to={getLibraryHref()} className="text-sm text-white/60 hover:text-white">← Library</Link>
      </div>
    );
  }

  const seoTitle = item.seo_title || item.title;
  const seoDesc = item.seo_description || item.description || "";
  const ogImage = item.og_image_url || item.cover_image_url || "";

  const isPdf = item.content_type === "pdf";

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

      {isPdf ? (
        <PdfExperience item={item} assets={assets} />
      ) : (
        <NonPdfShell item={item}>
          {item.content_type === "video" && <VideoViewer item={item} />}
          {item.content_type === "gallery" && <GalleryViewer item={item} assets={assets} />}
        </NonPdfShell>
      )}
    </>
  );
}

/* ============================================================
 * Shared viewer actions
 * ========================================================== */
function useViewerActions(item: ContentItem) {
  const share = useCallback(async () => {
    const url = window.location.href;
    track({ contentItemId: item.id, eventType: "share", pageSlug: item.slug });
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  }, [item.id, item.slug, item.title]);

  const fullscreen = useCallback(() => {
    track({ contentItemId: item.id, eventType: "fullscreen", pageSlug: item.slug });
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }, [item.id, item.slug]);

  const ctaClick = useCallback(() => {
    track({ contentItemId: item.id, eventType: "cta_click", pageSlug: item.slug, metadata: { url: item.cta_url } });
  }, [item.id, item.slug, item.cta_url]);

  return { share, fullscreen, ctaClick };
}

/* ============================================================
 * Non-PDF shell (video + gallery) — kept close to original
 * ========================================================== */
function NonPdfShell({ item, children }: { item: ContentItem; children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const { share, fullscreen, ctaClick } = useViewerActions(item);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to={getLibraryHref()} className="text-sm text-muted-foreground hover:text-foreground shrink-0">← Library</Link>
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

/* ============================================================
 * PDF — luxury book experience
 * ========================================================== */
type ViewMode = "book" | "scroll";

function PdfExperience({ item, assets }: { item: ContentItem; assets: ContentAsset[] }) {
  const pages = useMemo(
    () => assets.filter((a) => a.asset_type === "page_image").sort((a, b) => a.sort_order - b.sort_order),
    [assets],
  );
  const [mode, setMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "book";
    const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    return saved === "scroll" ? "scroll" : "book";
  });
  useEffect(() => {
    try { window.localStorage.setItem(MODE_STORAGE_KEY, mode); } catch {}
  }, [mode]);
  const [spread, setSpread] = useState(0); // index of left page of current spread
  const [zoom, setZoom] = useState<number | null>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const { share, fullscreen, ctaClick } = useViewerActions(item);

  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const [mobile, setMobile] = useState(isMobile);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  // Spread layout: mobile = 1 page per view; desktop = cover alone, then 2-up
  const pagesPerView = mobile ? 1 : 2;
  const totalSpreads = mobile
    ? pages.length
    : pages.length === 0 ? 0 : 1 + Math.ceil(Math.max(0, pages.length - 1) / 2);

  function spreadPages(idx: number): ContentAsset[] {
    if (mobile) return pages[idx] ? [pages[idx]] : [];
    if (idx === 0) return pages[0] ? [pages[0]] : [];
    const left = 1 + (idx - 1) * 2;
    return [pages[left], pages[left + 1]].filter(Boolean) as ContentAsset[];
  }

  const seenRef = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  useEffect(() => {
    spreadPages(spread).forEach((p) => {
      const i = pages.indexOf(p);
      if (i >= 0 && !seenRef.current.has(i)) {
        seenRef.current.add(i);
        track({ contentItemId: item.id, eventType: "page_view", pageIndex: i, pageSlug: item.slug });
      }
    });
    if (!completedRef.current && totalSpreads > 0 && spread >= totalSpreads - 1) {
      completedRef.current = true;
      track({ contentItemId: item.id, eventType: "complete", pageSlug: item.slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, mobile, pages.length]);

  const go = useCallback((delta: number) => {
    setSpread((s) => Math.min(totalSpreads - 1, Math.max(0, s + delta)));
  }, [totalSpreads]);

  // Keyboard nav (book mode only)
  useEffect(() => {
    if (mode !== "book") return;
    function onKey(e: KeyboardEvent) {
      if (zoom !== null) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      if (e.key === "Home") setSpread(0);
      if (e.key === "End") setSpread(totalSpreads - 1);
      if (e.key === "Escape") setZoom(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, go, totalSpreads, zoom]);

  // Touch swipe (book mobile)
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    touchRef.current = null;
  }

  // Auto-hide chrome after idle
  useEffect(() => {
    let t: number | undefined;
    function bump() {
      setChromeHidden(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setChromeHidden(true), 2800);
    }
    bump();
    window.addEventListener("mousemove", bump);
    window.addEventListener("touchstart", bump);
    window.addEventListener("keydown", bump);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("touchstart", bump);
      window.removeEventListener("keydown", bump);
    };
  }, []);

  // Preload neighbors
  useEffect(() => {
    const neighbors = [
      ...spreadPages(spread),
      ...spreadPages(spread + 1),
      ...spreadPages(spread + 2),
    ];
    neighbors.forEach((p) => {
      const img = new Image();
      img.src = p.file_url;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, mobile]);

  if (!pages.length) {
    return (
      <div className="min-h-screen bg-[#1a1614] text-white/70 flex items-center justify-center">
        <p>PDF still processing…</p>
      </div>
    );
  }

  const currentSpread = spreadPages(spread);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1815] via-[#221d19] to-[#1c1815] text-white/90 overflow-hidden">
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${chromeHidden ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link to={getLibraryHref()} className="text-xs sm:text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">
            ← Library
          </Link>
          <div className="hidden sm:block text-xs tracking-[0.25em] uppercase text-white/40 truncate max-w-md">
            {item.title}
          </div>
          <div className="flex items-center gap-1">
            <IconBtn title={mode === "book" ? "Scroll mode" : "Book mode"} onClick={() => setMode(mode === "book" ? "scroll" : "book")}>
              {mode === "book" ? <ScrollText size={16} /> : <BookOpen size={16} />}
            </IconBtn>
            <IconBtn title="Share" onClick={share}><Share2 size={16} /></IconBtn>
            {item.primary_file_url && (
              <a href={item.primary_file_url} target="_blank" rel="noreferrer" title="Download">
                <IconBtn><Download size={16} /></IconBtn>
              </a>
            )}
            <IconBtn title="Fullscreen" onClick={fullscreen}><Maximize2 size={16} /></IconBtn>
          </div>
        </div>
      </header>

      {/* Stage */}
      {mode === "book" ? (
        <div
          className="min-h-screen flex items-center justify-center px-4 sm:px-10 py-16 sm:py-20 select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full max-w-6xl flex items-center justify-center">
            {/* Prev */}
            <button
              onClick={() => go(-1)}
              disabled={spread === 0}
              aria-label="Previous"
              className={`hidden sm:flex absolute left-0 -translate-x-12 w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed ${chromeHidden ? "opacity-0" : ""}`}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Spread */}
            <div className="flex items-stretch gap-1 sm:gap-2 max-h-[78vh]">
              {currentSpread.map((p, i) => {
                const aspect = p.width && p.height ? `${p.width}/${p.height}` : "1/1.414";
                return (
                  <div
                    key={p.id}
                    onClick={() => setZoom(pages.indexOf(p))}
                    className="relative bg-[#f6f3ee] cursor-zoom-in overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7),0_18px_36px_-18px_rgba(0,0,0,0.4)]"
                    style={{
                      aspectRatio: aspect,
                      maxHeight: "78vh",
                      borderTopLeftRadius: pagesPerView === 2 && i === 0 ? 2 : 1,
                      borderBottomLeftRadius: pagesPerView === 2 && i === 0 ? 2 : 1,
                      borderTopRightRadius: pagesPerView === 2 && i === 1 ? 2 : 1,
                      borderBottomRightRadius: pagesPerView === 2 && i === 1 ? 2 : 1,
                    }}
                  >
                    <img
                      src={p.file_url}
                      alt={`Page ${pages.indexOf(p) + 1}`}
                      className="w-auto h-full max-h-[78vh] object-contain block"
                      draggable={false}
                    />
                    {/* Inner gutter shadow on 2-up */}
                    {pagesPerView === 2 && currentSpread.length === 2 && (
                      <div
                        className={`pointer-events-none absolute top-0 bottom-0 w-8 ${i === 0 ? "right-0 bg-gradient-to-l from-black/25 to-transparent" : "left-0 bg-gradient-to-r from-black/25 to-transparent"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={() => go(1)}
              disabled={spread >= totalSpreads - 1}
              aria-label="Next"
              className={`hidden sm:flex absolute right-0 translate-x-12 w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed ${chromeHidden ? "opacity-0" : ""}`}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      ) : (
        // Scroll fallback
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 space-y-5">
          {pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setZoom(i)}
              className="block w-full bg-[#f6f3ee] overflow-hidden cursor-zoom-in shadow-[0_24px_50px_-22px_rgba(0,0,0,0.7)]"
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
      )}

      {/* Bottom controls */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${chromeHidden ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}`}
      >
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-black/55 backdrop-blur-xl border border-white/10 shadow-2xl">
          {mode === "book" && (
            <>
              <IconBtn onClick={() => go(-1)} title="Previous"><ChevronLeft size={16} /></IconBtn>
              <div className="px-3 text-[11px] tracking-[0.2em] uppercase text-white/70 tabular-nums min-w-[80px] text-center">
                {Math.min(spread + 1, totalSpreads)} / {totalSpreads}
              </div>
              <IconBtn onClick={() => go(1)} title="Next"><ChevronRight size={16} /></IconBtn>
              <div className="w-px h-5 bg-white/15 mx-1" />
            </>
          )}
          {item.cta_label && item.cta_url && (
            <a href={item.cta_url} target="_blank" rel="noreferrer" onClick={ctaClick}>
              <button className="px-4 py-1.5 rounded-full bg-white text-[#1a1614] text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition">
                {item.cta_label}
              </button>
            </a>
          )}
        </div>
      </div>

      {/* Zoom modal — pinch / scroll */}
      <Dialog open={zoom !== null} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-screen-xl p-0 bg-black border-0">
          {zoom !== null && pages[zoom] && (
            <div className="relative">
              <button
                onClick={() => setZoom(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X size={18} />
              </button>
              <div className="overflow-auto max-h-[92vh] touch-pan-x touch-pan-y">
                <img src={pages[zoom].file_url} alt={`Page ${zoom + 1}`} className="w-auto min-w-full block mx-auto" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  );
}

/* ============================================================
 * Video
 * ========================================================== */
function VideoViewer({ item }: { item: ContentItem }) {
  const det = useMemo(() => (item.video_url ? detectVideoProvider(item.video_url) : null), [item.video_url]);
  const [active, setActive] = useState(false);
  if (!item.video_url || !det) return <p className="text-muted-foreground text-center py-12">Video coming soon.</p>;

  if (det.provider === "youtube" && det.embedId) {
    if (!active) {
      return (
        <button onClick={() => setActive(true)} className="relative block w-full aspect-video bg-black rounded overflow-hidden group">
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
        <iframe src={`https://www.youtube.com/embed/${det.embedId}?autoplay=1`} title={item.title} className="w-full h-full rounded" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    );
  }

  if (det.provider === "vimeo" && det.embedId) {
    return (
      <div className="aspect-video">
        <iframe src={`https://player.vimeo.com/video/${det.embedId}`} title={item.title} className="w-full h-full rounded" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  return <video src={item.video_url} controls playsInline poster={item.cover_image_url ?? undefined} className="w-full rounded bg-black" />;
}

/* ============================================================
 * Gallery
 * ========================================================== */
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
              <img src={img.file_url} alt={img.alt_text ?? ""} loading={i < 2 ? "eager" : "lazy"} className="w-full h-auto" />
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
