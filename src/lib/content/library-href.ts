/**
 * Returns the correct "Library" href so the PDF platform never
 * accidentally routes a user back into the Wine Flight app.
 *
 * - On the pdfs.* hostname, "/" already renders the library.
 * - Otherwise (local preview / staging on the main host),
 *   we preserve the ?lib=1 escape hatch.
 */
export function isPdfsContext(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host.startsWith("pdfs.")) return true;
  const params = new URLSearchParams(window.location.search);
  return params.get("lib") === "1";
}

export function getLibraryHref(): string {
  if (typeof window === "undefined") return "/";
  const host = window.location.hostname;
  if (host.startsWith("pdfs.")) return "/";
  // Local / non-pdfs hosts: keep the library escape hatch.
  return "/?lib=1";
}

/** Build a /c/:slug link that preserves library context on non-pdfs hosts. */
export function getContentHref(slug: string): string {
  if (typeof window === "undefined") return `/c/${slug}`;
  const host = window.location.hostname;
  if (host.startsWith("pdfs.")) return `/c/${slug}`;
  const params = new URLSearchParams(window.location.search);
  if (params.get("lib") === "1") return `/c/${slug}?lib=1`;
  return `/c/${slug}`;
}
