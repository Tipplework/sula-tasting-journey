import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { listContentItems } from "@/lib/content/api";
import { getContentHref } from "@/lib/content/library-href";
import type { ContentItem } from "@/lib/content/types";

export default function LibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listContentItems(false);
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Library — Sula</title>
        <meta name="description" content="Brochures, films, and editorial collections from Sula." />
      </Helmet>

      <div className="min-h-screen bg-[#f6f3ee] text-[#1a1614]">
        <header className="max-w-6xl mx-auto px-6 sm:px-10 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#1a1614]/60">
            Sula — Library
          </p>
          <h1 className="font-heading mt-3 text-4xl sm:text-6xl font-light tracking-tight max-w-3xl">
            Brochures, films &amp; editorial collections.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#1a1614]/70 max-w-2xl font-light">
            A quiet shelf of our work — read at leisure, share freely.
          </p>
        </header>

        <main className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
          {loading ? (
            <p className="text-[#1a1614]/50 text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-[#1a1614]/50 text-sm">Nothing published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {items.map((it) => (
                <Link
                  to={`/c/${it.slug}`}
                  key={it.id}
                  className="group block"
                >
                  <div className="aspect-[3/4] bg-[#e8e3db] overflow-hidden rounded-sm shadow-[0_2px_30px_-12px_rgba(0,0,0,0.25)] group-hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] transition-shadow">
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
                    <h2 className="font-heading text-xl font-light leading-snug group-hover:italic transition-all">
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
