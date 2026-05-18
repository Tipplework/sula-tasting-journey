// Vercel Edge Function: SSR-injected social/SEO metadata for /c/:slug
//
// SPA + react-helmet can't reach social crawlers (WhatsApp, iMessage, Slack,
// LinkedIn, Facebook, Twitter) — they don't execute client JS. This function
// fetches the content item server-side and rewrites the index.html meta tags
// before responding. The SPA still hydrates as normal.

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://iotmypnapdhruaeecghw.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdG15cG5hcGRocnVhZWVjZ2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODc3MDMsImV4cCI6MjA5NDY2MzcwM30.6PVb2pj03PaHw_H5yBounGjMHEsVDPWr0YGJ_uHbCp0";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface Item {
  title: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_url: string | null;
  og_image_url: string | null;
  content_type: string;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Slug from query string (Vercel rewrite passes it) or fallback to path tail.
  const slug =
    url.searchParams.get("slug") ||
    url.pathname.replace(/^\/c\//, "").replace(/\/$/, "") ||
    "";

  const canonical = `${url.origin}/c/${slug}`;

  // Fetch SPA shell. Vercel serves static /index.html before applying rewrites
  // for existing files, so this does not recurse into this function.
  const shellRes = await fetch(new URL("/index.html", url.origin), {
    headers: { "cache-control": "no-cache" },
  });
  if (!shellRes.ok) {
    return new Response("Shell unavailable", { status: 502 });
  }
  let html = await shellRes.text();

  // Fetch the content item.
  let item: Item | null = null;
  if (slug) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/content_items?slug=eq.${encodeURIComponent(
          slug,
        )}&published=eq.true&select=title,description,seo_title,seo_description,cover_image_url,og_image_url,content_type&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON,
            authorization: `Bearer ${SUPABASE_ANON}`,
          },
        },
      );
      if (r.ok) {
        const arr = (await r.json()) as Item[];
        item = arr[0] ?? null;
      }
    } catch {
      // fall through to defaults below
    }
  }

  const title = item?.seo_title || item?.title || "Sula — Library";
  const description =
    item?.seo_description ||
    item?.description ||
    "Brochures, films and editorial collections from Sula.";
  const image = item?.og_image_url || item?.cover_image_url || "";
  const ogType = item?.content_type === "video" ? "video.other" : "article";

  const T = esc(title);
  const D = esc(description);
  const I = esc(image);
  const U = esc(canonical);

  // Drop the existing <title> + every meta we plan to control, then rebuild.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(
    /<meta[^>]+(name|property)=["'](description|og:title|og:description|og:image|og:url|og:type|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>\s*/gi,
    "",
  );
  html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>\s*/gi, "");

  const injected = [
    `<title>${T}</title>`,
    `<meta name="description" content="${D}">`,
    `<link rel="canonical" href="${U}">`,
    `<meta property="og:title" content="${T}">`,
    `<meta property="og:description" content="${D}">`,
    `<meta property="og:url" content="${U}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="Sula">`,
    image ? `<meta property="og:image" content="${I}">` : "",
    image ? `<meta property="og:image:secure_url" content="${I}">` : "",
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${T}">`,
    `<meta name="twitter:description" content="${D}">`,
    image ? `<meta name="twitter:image" content="${I}">` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  html = html.replace("</head>", `    ${injected}\n  </head>`);

  return new Response(html, {
    status: item ? 200 : 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Edge cache for crawlers; browsers re-validate quickly.
      "cache-control":
        "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      "x-sula-meta": item ? "hit" : "miss",
    },
  });
}
