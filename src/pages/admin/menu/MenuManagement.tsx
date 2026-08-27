/**
 * Tasting Room Menu CMS — the only screen the restaurant team needs.
 * Fully isolated from the Wine Flight admin: it reads and writes the menu_*
 * tables exclusively.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, ArrowLeft, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AdminCategory,
  AdminItem,
  createCategory,
  listCategories,
  listItems,
  reorderCategories,
  reorderItems,
  setItemFlags,
  updateCategory,
} from "@/lib/admin/menu/api";
import MenuItemEditor from "./MenuItemEditor";
import { foodImageFor } from "@/lib/menu/food-images";
import { itemSlug } from "@/lib/menu/api";


export default function MenuManagement() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ item: AdminItem | null } | null>(null);
  const [newCat, setNewCat] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, i] = await Promise.all([listCategories(), listItems()]);
      setCategories(c);
      setItems(i);
      setActiveCat((prev) => prev ?? c[0]?.id ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load the menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const currentItems = useMemo(
    () => items.filter((i) => i.category_id === activeCat),
    [items, activeCat],
  );
  const currentCat = categories.find((c) => c.id === activeCat) ?? null;

  async function guard(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function moveItem(index: number, dir: -1 | 1) {
    const ids = currentItems.map((i) => i.id);
    const to = index + dir;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    void guard(() => reorderItems(ids), "Order updated");
  }

  function moveCategory(index: number, dir: -1 | 1) {
    const ids = categories.map((c) => c.id);
    const to = index + dir;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    void guard(() => reorderCategories(ids), "Sections reordered");
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/admin"
              className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Admin
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl">Tasting Room menu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit dishes, prices, photos and availability. Changes go live on the
              QR menu immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/menu/data">
                <Database className="mr-1.5 h-4 w-4" /> Menu data
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading menu…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            {/* Sections */}
            <aside className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
                Sections
              </h2>
              <ul className="space-y-1.5">
                {categories.map((c, idx) => {
                  const count = items.filter((i) => i.category_id === c.id).length;
                  return (
                    <li key={c.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveCat(c.id)}
                        className={`flex-1 rounded-md border px-3 py-2 text-left text-sm transition ${
                          activeCat === c.id
                            ? "border-primary/60 bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className={c.active ? "" : "line-through opacity-60"}>
                          {c.name}
                        </span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {count}
                        </span>
                      </button>
                      <div className="flex flex-col">
                        <button
                          className="px-1 text-[10px] text-muted-foreground hover:text-foreground"
                          onClick={() => moveCategory(idx, -1)}
                          aria-label={`Move ${c.name} up`}
                        >
                          ▲
                        </button>
                        <button
                          className="px-1 text-[10px] text-muted-foreground hover:text-foreground"
                          onClick={() => moveCategory(idx, 1)}
                          aria-label={`Move ${c.name} down`}
                        >
                          ▼
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-1.5 pt-2">
                <Input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="New section"
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!newCat.trim() || busy}
                  onClick={() =>
                    void guard(async () => {
                      await createCategory(newCat, "default");
                      setNewCat("");
                    }, "Section added")
                  }
                >
                  Add
                </Button>
              </div>
            </aside>

            {/* Items */}
            <section className="space-y-4">
              {currentCat && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                  <div>
                    <h2 className="font-serif text-lg">{currentCat.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      /{currentCat.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Show on menu
                      <Switch
                        checked={currentCat.active}
                        onCheckedChange={(v) =>
                          void guard(
                            () => updateCategory(currentCat.id, { active: v }),
                            v ? "Section shown" : "Section hidden",
                          )
                        }
                      />
                    </label>
                    <Button size="sm" onClick={() => setEditing({ item: null })}>
                      <Plus className="mr-1.5 h-4 w-4" /> Add dish
                    </Button>
                  </div>
                </div>
              )}

              <ul className="space-y-2">
                {currentItems.map((item, idx) => {
                  const builtInImage = foodImageFor(item.name, itemSlug(item.name));
                  const itemImage = item.image_url?.trim() || builtInImage;

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                    <div className="flex flex-col">
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                        onClick={() => moveItem(idx, -1)}
                        aria-label={`Move ${item.name} up`}
                      >
                        ▲
                      </button>
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                        onClick={() => moveItem(idx, 1)}
                        aria-label={`Move ${item.name} down`}
                      >
                        ▼
                      </button>
                    </div>
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.image_alt ?? item.name}
                        loading="lazy"
                        onError={(event) => {
                          if (builtInImage && event.currentTarget.src !== builtInImage) {
                            event.currentTarget.src = builtInImage;
                          }
                        }}
                        className="h-14 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-14 w-12 rounded bg-muted" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <span className={item.active ? "" : "line-through opacity-60"}>
                          {item.name}
                        </span>
                        {item.unavailable && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Sold out
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          item.standard_price && `₹${item.standard_price}`,
                          item.glass_price && `Glass ₹${item.glass_price}`,
                          item.bottle_price && `Bottle ₹${item.bottle_price}`,
                          item.calories != null && `${item.calories} kcal`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No price set"}
                      </p>
                    </div>
                    <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                      Sold out
                      <Switch
                        checked={item.unavailable}
                        onCheckedChange={(v) =>
                          void guard(
                            () => setItemFlags(item.id, { unavailable: v }),
                            v ? "Marked sold out" : "Back in stock",
                          )
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Live
                      <Switch
                        checked={item.active}
                        onCheckedChange={(v) =>
                          void guard(
                            () => setItemFlags(item.id, { active: v }),
                            v ? "Dish shown" : "Dish hidden",
                          )
                        }
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing({ item })}
                    >
                      Edit
                    </Button>
                    </li>
                  );
                })}
                {!currentItems.length && (
                  <li className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No dishes in this section yet.
                  </li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>

      {editing && currentCat && (
        <MenuItemEditor
          item={editing.item}
          categories={categories}
          defaultCategoryId={currentCat.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
