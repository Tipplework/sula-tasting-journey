## Sula Content Experience Platform — Phase 1

A standalone content system grafted onto the existing app. The current tasting flow (`/`, `/tasting`, `/results`, `/admin`) stays untouched. Everything new lives under `/c/*` and `/content-center/*`.

### Scope (this phase)

In: PDF (hybrid viewer), Video, Image Gallery. Admin CMS. Public viewer with SEO, share, fullscreen, analytics. Email+password admin auth.

Out (later phases): Editorial story builder, campaign landing pages, multilingual, lead forms, gated content, offline, AI search.

### Architecture

```
Existing (untouched):           New (this phase):
/                               /c/:slug                  → public viewer (any type)
/tasting                        /content-center           → admin list
/results                        /content-center/new       → create
/admin                          /content-center/:id/edit  → edit + preview
                                /login                    → admin auth
```

`/c/:slug` is one route that switches viewer by `content_type`. Subdomain split (`pdfs.discoversula.com`) is a DNS-only concern handled at publish time — same code serves both.

### 1. Lovable Cloud setup

Enable Lovable Cloud. Create:

**Tables**
- `content_items` — id, slug (unique), title, content_type (pdf|video|gallery), category, description, cover_image_url, primary_file_url, video_url, video_provider (youtube|vimeo|file), cta_label, cta_url, seo_title, seo_description, og_image_url, published, featured, sort_order, page_count, created_by, created_at, updated_at
- `content_assets` — id, content_item_id, asset_type (page_image|gallery_image|thumbnail|download), file_url, thumbnail_url, caption, alt_text, sort_order, width, height
- `content_analytics` — id, content_item_id, event_type (view|page_view|complete|share|download|cta_click|fullscreen), page_index, session_id, user_agent, referrer, metadata, created_at
- `user_roles` — id, user_id, role (admin) — separate table, `has_role()` SECURITY DEFINER fn (per security rules)

**RLS**
- `content_items`, `content_assets`: public SELECT when `published = true`; admin full access via `has_role(auth.uid(),'admin')`
- `content_analytics`: public INSERT only; admin SELECT
- `user_roles`: admin-managed

**Storage buckets** (public read, admin write)
- `content-pdfs`, `content-videos`, `content-images`, `content-thumbnails`, `content-og-images`

### 2. Admin auth

Email + password via Lovable Cloud. New users get no role by default; first admin seeded manually via SQL. `/content-center/*` wrapped in `_authenticated` layout that also checks `has_role`. Non-admins → `/login`.

### 3. Admin CMS (`/content-center`)

Minimal, editorial-toned UI (uses existing Playfair + Inter, neutral palette, no shadcn dashboard chrome). Three screens:

- **List** — table of all items: cover thumb, title, type, category, published toggle, featured toggle, sort handle, edit/duplicate/archive.
- **Create / Edit** — single form with:
  - Common: title, slug (auto from title, editable), content_type, category, description, cover image, CTA label/url, SEO title/desc, OG image, published, featured.
  - Type-specific:
    - **PDF**: upload .pdf → server fn processes (see §4) → shows generated page count + cover preview.
    - **Video**: upload file OR paste YouTube/Vimeo URL → auto-detect provider, fetch poster.
    - **Gallery**: multi-upload → reorderable grid with caption + alt per image.
  - Live "Preview" button opens `/c/:slug?preview=1` (admin-only bypass of published flag).

### 4. PDF processing pipeline

On PDF upload (admin-side, in browser):
1. Upload original to `content-pdfs/{id}/source.pdf`.
2. Use `pdfjs-dist` in the browser to render each page to canvas → WebP @ 1600px wide, thumbnail @ 320px.
3. Upload page images to `content-thumbnails/{id}/page-{n}.webp` + `thumb-{n}.webp`.
4. Insert one `content_assets` row per page (`asset_type='page_image'`, ordered).
5. Set `page_count`, derive `cover_image_url` from page 1, generate `og_image_url` (page 1 @ 1200×630 letterbox).

Doing this client-side avoids Worker runtime limits on `sharp`/`canvas` (see server-runtime constraints) and keeps it free.

### 5. Public viewer (`/c/:slug`)

Server function `getPublishedContent(slug)` returns item + assets (admin-bypass via auth check + `?preview=1`). Loader-fetched, SSR'd, full SEO head (title, description, og:*, twitter:*, canonical, JSON-LD `CreativeWork`).

Shell (shared across types):
- Edge-to-edge cover with title + category overlay, fade-in.
- Sticky top bar (auto-hides on scroll down): back, share, fullscreen, progress %.
- Bottom CTA strip when `cta_url` set.
- Analytics: fire `view` on mount, `page_view` on visible-page change (IntersectionObserver), `complete` at >90%, `share`/`fullscreen`/`cta_click` on action. Session ID in sessionStorage.

Per-type rendering:
- **PDF (hybrid)**: vertical scroll of pre-rendered WebP page images, lazy via IntersectionObserver. Tap a page → modal with PDF.js canvas + pinch zoom. Desktop: arrow keys page-jump, optional 2-up spread.
- **Video**: native `<video>` for file, lite YouTube/Vimeo facade (load iframe only on play) — keeps mobile fast.
- **Gallery**: vertical editorial layout, full-bleed images with captions, lightbox on tap, swipe between.

### 6. Routing & SEO

- New file routes only — `src/routes/c.$slug.tsx`, `src/routes/_admin.tsx` layout, `src/routes/_admin.content-center.*`, `src/routes/login.tsx`.
- Each `/c/:slug` gets per-route `head()` from loader data.
- Sitemap route `src/routes/api/sitemap[.]xml.ts` enumerates published items.
- Robots: published items indexable; admin routes `noindex`.

### 7. Performance

- Pre-rendered WebP page images = no PDF.js cost on first paint.
- `loading="lazy"` + IntersectionObserver virtualization (only ~3 pages decoded around viewport).
- Cloudflare CDN handles Supabase Storage URLs.
- LCP image (cover) preloaded via `head().links`.

### 8. Strict isolation from existing app

- Zero edits to `src/pages/*`, `src/components/WineCard.tsx`, `src/store/tasting-store.ts`, tasting routes, or `src/styles.css` tokens.
- New components under `src/components/content/*`. New lib under `src/lib/content/*`. New tables/buckets only.
- Existing `/admin` (tasting analytics) untouched; new CMS is `/content-center`.

### Out-of-scope guard rails

If a request later asks for editorial story builder, landing pages, gated PDFs, lead forms, multilingual, or AI search — those are Phase 2+. This plan ships PDF + Video + Gallery only.

### Deliverable order (single build)

1. Enable Cloud, migrations (tables + RLS + buckets + storage policies), seed first admin SQL note.
2. Auth: `/login`, `_admin` layout with role gate.
3. Admin CMS shell + list + create/edit form (no uploads yet).
4. Upload pipelines: gallery → video → PDF (most complex last).
5. Public `/c/:slug` viewer with all three renderers.
6. SEO head, sitemap, analytics events.
7. Smoke test: create one of each type, publish, verify public URL + share + fullscreen + analytics row.

After approval I'll execute top-to-bottom and ping you when seeded admin SQL is ready to run.
