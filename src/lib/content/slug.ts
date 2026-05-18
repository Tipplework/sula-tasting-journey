export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function detectVideoProvider(url: string): { provider: "youtube" | "vimeo" | "file"; embedId?: string } {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v") ?? "";
      return { provider: "youtube", embedId: id };
    }
    if (u.hostname.includes("vimeo.com")) {
      return { provider: "vimeo", embedId: u.pathname.replace(/^\//, "") };
    }
  } catch {/* not a url */}
  return { provider: "file" };
}

export function youtubePoster(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}
