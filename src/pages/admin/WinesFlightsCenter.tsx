import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wines, flights, getFlightWines, type Wine } from "@/data/wines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function WinesFlightsCenter() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"wines" | "flights">("wines");
  const [q, setQ] = useState("");

  const filteredWines = useMemo(() => {
    if (!q.trim()) return wines;
    const n = q.toLowerCase();
    return wines.filter(
      (w) =>
        w.name.toLowerCase().includes(n) ||
        w.slug.toLowerCase().includes(n) ||
        w.journeyTag.toLowerCase().includes(n) ||
        w.personalityLabel.toLowerCase().includes(n),
    );
  }, [q]);

  async function signOut() {
    await supabase.auth.signOut();
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-tight">Wines &amp; Flights</h1>
            <p className="text-xs text-muted-foreground mt-1">
              The tasting catalogue — 14 wines across 4 curated flights.
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
              source of truth: src/data/wines.ts (code-driven for launch)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/content-center"><Button size="sm" variant="outline" className="h-9">Library</Button></Link>
            <Link to="/content-center/privacy"><Button size="sm" variant="outline" className="h-9">Privacy &amp; Compliance</Button></Link>
            <Button size="sm" variant="ghost" className="h-9" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex gap-2 border-b overflow-x-auto">
          {(["wines", "flights"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "wines" ? `Wines (${wines.length})` : `Flights (${flights.length})`}
            </button>
          ))}
        </div>

        {tab === "wines" && (
          <section className="space-y-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, slug, tag or personality"
              className="max-w-md"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWines.map((w) => <WineTile key={w.id} wine={w} />)}
            </div>
            {filteredWines.length === 0 && (
              <div className="text-muted-foreground text-sm py-8 text-center border rounded-md">No matches.</div>
            )}
          </section>
        )}

        {tab === "flights" && (
          <section className="space-y-6">
            {flights.map((f) => {
              const fw = getFlightWines(f.id);
              return (
                <div key={f.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">Flight {f.id}</Badge>
                        <h3 className="font-medium text-lg">{f.name}</h3>
                        {!f.active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{f.subtitle} · {f.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{fw.length} wines</span>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {fw.map((w, i) => (
                      <div key={`${f.id}-${w.id}`} className="flex items-center gap-3 border rounded-md p-2">
                        <div className="w-10 h-14 bg-muted rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <img src={w.image} alt={w.name} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">Wine {i + 1}</div>
                          <div className="text-sm font-medium truncate">{w.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function WineTile({ wine }: { wine: Wine }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card flex flex-col">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        <img src={wine.image} alt={wine.name} className="max-h-full max-w-full object-contain p-3" loading="lazy" />
      </div>
      <div className="p-3 space-y-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight">{wine.name}</h3>
          {!wine.active && <Badge variant="secondary" className="text-[10px]">Off</Badge>}
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-[10px]">{wine.journeyTag}</Badge>
          <Badge variant="outline" className="text-[10px]">{wine.personalityLabel}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{wine.tastingNotes}</p>
        {wine.awards.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {wine.awards.map((a, i) => (
              <span key={i} className="text-[10px] bg-amber-100 text-amber-900 rounded px-1.5 py-0.5">
                {a.medal} · {a.competition}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground/70 font-mono truncate">/{wine.slug}</p>
      </div>
    </div>
  );
}
