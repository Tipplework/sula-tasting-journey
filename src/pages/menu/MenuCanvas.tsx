import { useEffect } from "react";

/**
 * Single wrapper for every menu route. It intentionally sets no overflow or
 * height rules: the document is the app's only vertical scroll container.
 */
export function MenuCanvas({ children }: { children: React.ReactNode }) {
  // The menu owns its own scroll restoration (item details, category jumps), so
  // the browser must not race us with its history restoration.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  return <div className="tr-scope bg-tr-cream">{children}</div>;
}

/** Sets the document title and description for a menu route. */
export function useMenuMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previousDesc = meta.content;
    meta.content = description;
    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDesc;
    };
  }, [title, description]);
}
