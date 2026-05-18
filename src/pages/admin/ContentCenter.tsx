import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listContentItems, updateItem, deleteItem } from "@/lib/content/api";
import type { ContentItem } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ContentCenter() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await listContentItems(true);
      setItems(data);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function togglePublish(item: ContentItem) {
    await updateItem(item.id, { published: !item.published });
    toast.success(item.published ? "Unpublished" : "Published");
    load();
  }
  async function remove(item: ContentItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await deleteItem(item.id);
    toast.success("Deleted");
    load();
  }

  async function signOut() {
    await supabase.auth.signOut();
    nav("/login");
  }

  const LIVE_BASE = "https://pdfs.discoversula.com";
  const previewBase = typeof window !== "undefined" ? window.location.origin : "";

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-tight">Sula Library Admin</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage brochures, films and editorial collections.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/content-center/homepage"><Button size="sm" variant="outline" className="h-10 sm:h-9">Edit homepage</Button></Link>
            <Link to="/content-center/new"><Button size="sm" className="h-10 sm:h-9">New content</Button></Link>
            <Button size="sm" variant="ghost" className="h-10 sm:h-9" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No content yet.</p>
            <Link to="/content-center/new"><Button>Create your first piece</Button></Link>
          </div>
        ) : (
          <ul className="divide-y border rounded-md overflow-hidden">
            {items.map((it) => (
              <li key={it.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: thumb + meta */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-20 h-14 bg-muted rounded overflow-hidden shrink-0">
                    {it.cover_image_url && <img src={it.cover_image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{it.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      /c/{it.slug}{it.category && <> · {it.category}</>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge variant="outline" className="uppercase text-[10px]">{it.content_type}</Badge>
                      {it.published
                        ? <Badge className="text-[10px]">Live</Badge>
                        : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:justify-end lg:shrink-0">
                  {it.published && (
                    <a href={`/c/${it.slug}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-10 sm:h-9 min-w-[64px]">View</Button>
                    </a>
                  )}
                  <Button size="sm" variant="ghost" className="h-10 sm:h-9" onClick={() => togglePublish(it)}>
                    {it.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Link to={`/content-center/${it.id}/edit`}>
                    <Button size="sm" variant="outline" className="h-10 sm:h-9">Edit</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 sm:h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(it)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
