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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-tight">Content Center</h1>
            <p className="text-xs text-muted-foreground mt-1">Sula editorial experiences</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/content-center/homepage"><Button size="sm" variant="outline">Edit homepage</Button></Link>
            <Link to="/content-center/new"><Button size="sm">New content</Button></Link>
            <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No content yet.</p>
            <Link to="/content-center/new"><Button>Create your first piece</Button></Link>
          </div>
        ) : (
          <ul className="divide-y border rounded-md">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 p-4">
                <div className="w-20 h-14 bg-muted rounded overflow-hidden shrink-0">
                  {it.cover_image_url && <img src={it.cover_image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{it.title}</span>
                    <Badge variant="outline" className="uppercase text-[10px]">{it.content_type}</Badge>
                    {it.published ? <Badge className="text-[10px]">Live</Badge> : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    /c/{it.slug} {it.category && <>· {it.category}</>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {it.published && <a href={`/c/${it.slug}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">View</Button></a>}
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(it)}>
                    {it.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Link to={`/content-center/${it.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => remove(it)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
