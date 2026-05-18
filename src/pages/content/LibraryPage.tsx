import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { listContentItems } from "@/lib/content/api";
import { getSiteSettings, listSections, type SiteSettings, type HomepageSection } from "@/lib/content/homepage";
import { getContentHref } from "@/lib/content/library-href";
import { useAuth } from "@/hooks/useAuth";
import type { ContentItem } from "@/lib/content/types";

export default function LibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const [data, s, secs] = await Promise.all([
          listContentItems(false),
          getSiteSettings().catch(() => null),
          listSections(false).catch(() => []),
        ]);
        setItems(data);
        setSettings(s);
        setSections(secs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bySlug = useMemo(() => {
    const m = new Map<string, ContentItem>();
    items.forEach((i) => m.set(i.slug, i));
    return m;
  }, [items]);

  const featuredSlugs = new Set<string>(sections.flatMap((s) => s.item_slugs));
  const restItems = items.filter((i) => !featuredSlugs.has(i.slug));

  const heroTitle = settings?.hero_title || "Brochures, films & editorial collections.";
  const heroEyebrow = settings?.hero_eyebrow || "Sula — Editorial Library";
  const heroSubtitle =
    settings?.hero_subtitle || "A quiet shelf of our work — read at leisure, share freely.";

  return (
    <>
      <Helmet>
        <title>{settings?.meta_title || "Library — Sula"}</title>
        <meta
          name="description"
          content={settings?.meta_description || "Brochures, films, and editorial collections from Sula."}
        />
        {settings?.og_image_url && <meta property="og:image" content={settings.og_image_url} />}
      </Helmet>

      <div className="min-h-screen bg-[#f6f3ee] text-[#1a1614]">
        {/* HERO */}
        <header className="relative overflow-hidden">
          {settings?.hero_image_url && (
            <>
              <img
                src={settings.hero_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#f6f3ee]" />
            </>
          )}
          <div
            className={`relative max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-28 pb-16 sm:pb-24 ${
              settings?.hero_image_url ? "text-white" : "text-[#1a1614]"
            }`}
          >
            <p
              className={`text-[10px] sm:text-xs tracking-[0.35em] uppercase ${
                settings?.hero_image_url ? "text-white/80" : "text-[#1a1614]/60"
              }`}
            >
              {heroEyebrow}
            </p>
            <h1 className="font-heading mt-4 text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight max-w-3xl leading-[1.05]">
              {heroTitle}
            </h1>
            <p
              className={`mt-5 text-base sm:text-lg max-w-2xl font-light ${
                settings?.hero_image_url ? "text-white/85" : "text-[#1a1614]/70"
              }`}
            >
              {heroSubtitle}
            </p>
            {settings?.hero_cta_label && settings?.hero_cta_url && (
              <div className="mt-8">
                <a
                  href={settings.hero_cta_url}
                  className={`inline-block px-6 py-3 text-xs tracking-[0.25em] uppercase border transition ${
                    settings.hero_image_url
                      ? "border-white text-white hover:bg-white hover:text-[#1a1614]"
                      : "border-[#1a1614] text-[#1a1614] hover:bg-[#1a1614] hover:text-[#f6f3ee]"
                  }`}
                >
                  {settings.hero_cta_label}
                </a>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
          {loading ? (
            <p className="text-[#1a1614]/50 text-sm pt-10">Loading…</p>
          ) : (
            <>
              {/* SECTIONS */}
              {sections.map((sec) => {
                const secItems = sec.item_slugs
                  .map((s) => bySlug.get(s))
                  .filter(Boolean) as ContentItem[];
                if (sec.section_type === "cta") return <CtaBand key={sec.id} sec={sec} />;
                if (!secItems.length && !sec.title) return null;
                return <SectionBlock key={sec.id} sec={sec} items={secItems} />;
              })}

              {/* REMAINING LIBRARY */}
              {restItems.length > 0 && (
                <section className="pt-20">
                  {sections.length > 0 && (
                    <div className="mb-10 flex items-baseline justify-between">
                      <h2 className="font-heading text-2xl sm:text-3xl font-light">The Library</h2>
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#1a1614]/50">
                        All editions
                      </p>
                    </div>
                  )}
                  <ItemGrid items={restItems} />
                </section>
              )}

              {restItems.length === 0 && sections.length === 0 && items.length === 0 && (
                <p className="text-[#1a1614]/50 text-sm pt-10">Nothing published yet.</p>
              )}
            </>
          )}
        </main>

        <footer className="border-t border-[#1a1614]/10">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 text-xs tracking-[0.25em] uppercase text-[#1a1614]/40">
            Sula · pdfs
          </div>
        </footer>
      </div>
    </>
  );
}

function SectionBlock({ sec, items }: { sec: HomepageSection; items: ContentItem[] }) {
  return (
    <section className="pt-20">
      <div className="mb-10 max-w-3xl">
        {sec.subtitle && (
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#1a1614]/55">
            {sec.subtitle}
          </p>
        )}
        {sec.title && (
          <h2 className="font-heading mt-2 text-3xl sm:text-4xl font-light tracking-tight">
            {sec.title}
          </h2>
        )}
      </div>
      <ItemGrid items={items} editorial={sec.section_type === "editorial"} />
      {sec.cta_label && sec.cta_url && (
        <div className="mt-8">
          <a
            href={sec.cta_url}
            className="text-xs tracking-[0.25em] uppercase border-b border-[#1a1614]/40 hover:border-[#1a1614] pb-1"
          >
            {sec.cta_label} →
          </a>
        </div>
      )}
    </section>
  );
}

function CtaBand({ sec }: { sec: HomepageSection }) {
  return (
    <section className="my-24">
      <div
        className="relative overflow-hidden rounded-sm px-8 sm:px-16 py-16 sm:py-24 text-white"
        style={{
          backgroundImage: sec.image_url ? `url(${sec.image_url})` : undefined,
          backgroundColor: sec.image_url ? undefined : "#1a1614",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {sec.image_url && <div className="absolute inset-0 bg-black/45" />}
        <div className="relative max-w-2xl">
          {sec.subtitle && (
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/70">{sec.subtitle}</p>
          )}
          {sec.title && (
            <h3 className="font-heading mt-3 text-3xl sm:text-5xl font-light tracking-tight">
              {sec.title}
            </h3>
          )}
          {sec.cta_label && sec.cta_url && (
            <a
              href={sec.cta_url}
              className="mt-8 inline-block px-6 py-3 text-xs tracking-[0.25em] uppercase border border-white hover:bg-white hover:text-[#1a1614] transition"
            >
              {sec.cta_label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function ItemGrid({ items, editorial = false }: { items: ContentItem[]; editorial?: boolean }) {
  if (!items.length) return null;
  return (
    <div
      className={
        editorial
          ? "grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-16"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14"
      }
    >
      {items.map((it) => (
        <Link to={getContentHref(it.slug)} key={it.id} className="group block">
          <div
            className={`bg-[#e8e3db] overflow-hidden rounded-sm shadow-[0_2px_30px_-12px_rgba(0,0,0,0.25)] group-hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] transition-shadow ${
              editorial ? "aspect-[4/5]" : "aspect-[3/4]"
            }`}
          >
            {it.cover_image_url ? (
              <img
                src={it.cover_image_url}
                alt={it.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#1a1614]/30 text-xs uppercase tracking-widest">
                {it.content_type}
              </div>
            )}
          </div>
          <div className="mt-4 space-y-1">
            {it.category && (
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#1a1614]/50">
                {it.category} · {it.content_type}
              </p>
            )}
            <h2 className={`font-heading font-light leading-snug group-hover:italic transition-all ${editorial ? "text-2xl sm:text-3xl" : "text-xl"}`}>
              {it.title}
            </h2>
            {it.description && (
              <p className="text-sm text-[#1a1614]/60 line-clamp-2 font-light">
                {it.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
