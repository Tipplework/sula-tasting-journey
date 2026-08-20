/** Read-only visibility into the live menu tables and their change history. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AdminCategory,
  AdminItem,
  ChangeLogRow,
  listCategories,
  listChangeLog,
  listItems,
} from "@/lib/admin/menu/api";

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join(
    "\n",
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MenuData() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [log, setLog] = useState<ChangeLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, i, l] = await Promise.all([
          listCategories(),
          listItems(),
          listChangeLog(100),
        ]);
        setCategories(c);
        setItems(i);
        setLog(l);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load menu data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/admin/menu"
              className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Menu management
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl">Menu data</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              What the QR menu is serving right now, plus the last 100 changes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              download(
                "tasting-room-menu.csv",
                csv(
                  items.map((i) => ({
                    section: catName(i.category_id),
                    name: i.name,
                    description: i.description,
                    price: i.standard_price,
                    glass: i.glass_price,
                    bottle: i.bottle_price,
                    small_bottle: i.smaller_bottle_price,
                    calories: i.calories,
                    tags: i.tags.join(" / "),
                    live: i.active,
                    sold_out: i.unavailable,
                    has_photo: Boolean(i.image_url),
                    updated_at: i.updated_at,
                  })),
                ),
              )
            }
          >
            Export CSV
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Sections", categories.length],
                ["Live sections", categories.filter((c) => c.active).length],
                ["Dishes", items.length],
                ["Sold out", items.filter((i) => i.unavailable).length],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{value}</p>
                </div>
              ))}
            </div>

            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
                Recent changes
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">Table</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((row) => {
                      const label =
                        (row.new_data?.name as string) ??
                        (row.previous_data?.name as string) ??
                        row.record_id ??
                        "—";
                      return (
                        <tr key={row.id} className="border-t border-border">
                          <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-2">
                            {row.table_name.replace("menu_", "")}
                          </td>
                          <td className="px-3 py-2 capitalize">{row.action}</td>
                          <td className="px-3 py-2">{label}</td>
                        </tr>
                      );
                    })}
                    {!log.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          No changes recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
