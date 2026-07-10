import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Wine, Flight, Award } from "@/data/wines";
import { fetchCatalogue, upsertWine, deleteWine, upsertFlight, deleteFlight, setFlightWines as saveFlightWines } from "@/lib/catalogue/api";
import { invalidateCatalogue } from "@/lib/catalogue/useCatalogue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, X, ArrowUp, ArrowDown } from "lucide-react";

const DEFAULT_STEPS = [
  "Swirl gently in the glass",
  "Breathe in the aromas",
  "Take a slow, thoughtful sip",
];
const PERSONALITY_LABELS = ["Cheerful", "Refined", "Romantic", "Bold Explorer", "Playful"];
const GLYPHS = ["whites", "reds", "signature", "sparkling"] as const;

function emptyWine(nextId: number): Wine {
  return {
    id: nextId,
    slug: "",
    name: "",
    subtitle: "",
    journeyTag: "",
    description: "",
    tastingNotes: "",
    foodPairing: [],
    vivino: "",
    usp: "",
    personality: "",
    personalityLabel: "Cheerful",
    image: "",
    question: "What did you feel?",
    options: [],
    sommelierNote: "",
    tastingSteps: DEFAULT_STEPS,
    nextPour: "",
    nextPourReason: "",
    notes: [],
    awards: [],
    active: true,
  };
}

function emptyFlight(id: string): Flight {
  return {
    id: id as Flight["id"],
    code: "",
    name: "",
    subtitle: "",
    description: "",
    wineIds: [],
    glyph: "whites",
    active: true,
  };
}

export default function WinesFlightsCenter() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"wines" | "flights">("wines");
  const [loading, setLoading] = useState(true);
  const [wines, setWines] = useState<Wine[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [q, setQ] = useState("");
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  async function load() {
    setLoading(true);
    try {
      const snap = await fetchCatalogue(true);
      setWines(snap.wines);
      setFlights(snap.flights);
      invalidateCatalogue();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filteredWines = useMemo(() => {
    if (!q.trim()) return wines;
    const n = q.toLowerCase();
    return wines.filter((w) =>
      w.name.toLowerCase().includes(n) ||
      w.slug.toLowerCase().includes(n) ||
      w.journeyTag.toLowerCase().includes(n),
    );
  }, [q, wines]);

  const nextWineId = useMemo(() => (wines.length ? Math.max(...wines.map((w) => w.id)) + 1 : 1), [wines]);

  async function signOut() {
    await supabase.auth.signOut();
    nav("/login");
  }

  async function handleSaveWine(w: Wine) {
    if (!w.slug || !w.name) return toast.error("Slug and name are required");
    try {
      const sort = wines.find((x) => x.id === w.id)?.id ?? nextWineId;
      await upsertWine(w, sort);
      toast.success("Saved");
      setEditingWine(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDeleteWine(id: number) {
    if (!confirm("Delete this wine? It will also be removed from any flight it belongs to.")) return;
    try {
      await deleteWine(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleSaveFlight(f: Flight) {
    if (!f.id || !f.code || !f.name) return toast.error("ID, code and name are required");
    try {
      const sort = flights.findIndex((x) => x.id === f.id);
      await upsertFlight(f, sort >= 0 ? sort + 1 : flights.length + 1);
      await saveFlightWines(f.id, f.wineIds);
      toast.success("Flight saved");
      setEditingFlight(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDeleteFlight(id: string) {
    if (!confirm("Delete this flight?")) return;
    try {
      await deleteFlight(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-tight">Wines &amp; Flights</h1>
            <p className="text-xs text-muted-foreground mt-1">DB-backed catalogue — edits go live on next tasting session.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/content-center"><Button size="sm" variant="outline" className="h-9">Library</Button></Link>
            <Link to="/content-center/privacy"><Button size="sm" variant="outline" className="h-9">Privacy</Button></Link>
            <Button size="sm" variant="ghost" className="h-9" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex gap-2 border-b">
          {(["wines", "flights"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
                tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "wines" ? `Wines (${wines.length})` : `Flights (${flights.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : tab === "wines" ? (
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search wines"
                className="max-w-xs"
              />
              <Button onClick={() => setEditingWine(emptyWine(nextWineId))}>
                <Plus size={16} className="mr-1" /> New wine
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWines.map((w) => (
                <div key={w.id} className="border rounded-lg overflow-hidden bg-card flex flex-col">
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                    {w.image ? (
                      <img src={w.image} alt={w.name} className="max-h-full max-w-full object-contain p-3" loading="lazy" />
                    ) : <span className="text-xs text-muted-foreground">No image</span>}
                  </div>
                  <div className="p-3 space-y-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{w.name}</h3>
                      {!w.active && <Badge variant="secondary" className="text-[10px]">Off</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">{w.journeyTag}</Badge>
                      <Badge variant="outline" className="text-[10px]">{w.personalityLabel}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{w.tastingNotes}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono truncate">/{w.slug}</p>
                  </div>
                  <div className="p-2 border-t flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingWine(w)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteWine(w.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setEditingFlight(emptyFlight(""))}>
                <Plus size={16} className="mr-1" /> New flight
              </Button>
            </div>
            <div className="space-y-4">
              {flights.map((f) => {
                const fw = f.wineIds
                  .map((id) => wines.find((w) => w.id === id))
                  .filter((w): w is Wine => Boolean(w));
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingFlight(f)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteFlight(f.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                      {fw.map((w, i) => (
                        <div key={`${f.id}-${i}-${w.id}`} className="flex items-center gap-3 border rounded-md p-2">
                          <div className="w-10 h-14 bg-muted rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {w.image && <img src={w.image} alt={w.name} className="w-full h-full object-contain" loading="lazy" />}
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
            </div>
          </section>
        )}

        {editingWine && (
          <WineEditor
            key={editingWine.id}
            wine={editingWine}
            onCancel={() => setEditingWine(null)}
            onSave={handleSaveWine}
          />
        )}
        {editingFlight && (
          <FlightEditor
            key={editingFlight.id || "new-flight"}
            flight={editingFlight}
            allWines={wines}
            onCancel={() => setEditingFlight(null)}
            onSave={handleSaveFlight}
          />
        )}
      </main>
    </div>
  );
}

// ─── Wine editor drawer ──────────────────────────────────

function WineEditor({ wine, onCancel, onSave }: { wine: Wine; onCancel: () => void; onSave: (w: Wine) => void }) {
  const [w, setW] = useState<Wine>(wine);
  const update = <K extends keyof Wine>(k: K, v: Wine[K]) => setW((prev) => ({ ...prev, [k]: v }));
  const csvToArr = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl mx-auto my-8 border rounded-lg bg-card shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-medium">{wine.name ? `Edit — ${wine.name}` : "New wine"}</h2>
          <Button size="sm" variant="ghost" onClick={onCancel}><X size={16} /></Button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><Input value={w.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field label="Slug"><Input value={w.slug} onChange={(e) => update("slug", e.target.value)} placeholder="e.g. dindori-reserve-shiraz" /></Field>
            <Field label="Subtitle"><Input value={w.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></Field>
            <Field label="Journey tag"><Input value={w.journeyTag} onChange={(e) => update("journeyTag", e.target.value)} placeholder="Bold / Crisp / Elegant…" /></Field>
            <Field label="Image URL">
              <Input value={w.image} onChange={(e) => update("image", e.target.value)} placeholder="/__l5e/assets-v1/…" />
            </Field>
            <Field label="Personality label">
              <select value={w.personalityLabel} onChange={(e) => update("personalityLabel", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                {PERSONALITY_LABELS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <Textarea rows={2} value={w.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
          <Field label="Personality (short line)">
            <Input value={w.personality} onChange={(e) => update("personality", e.target.value)} />
          </Field>
          <Field label="Tasting notes">
            <Textarea rows={2} value={w.tastingNotes} onChange={(e) => update("tastingNotes", e.target.value)} />
          </Field>
          <Field label="Sommelier note">
            <Textarea rows={2} value={w.sommelierNote} onChange={(e) => update("sommelierNote", e.target.value)} />
          </Field>
          <Field label="Unique story (USP)">
            <Input value={w.usp} onChange={(e) => update("usp", e.target.value)} />
          </Field>
          <Field label="Vivino URL">
            <Input value={w.vivino} onChange={(e) => update("vivino", e.target.value)} />
          </Field>
          <Field label="Food pairing (comma-separated)">
            <Input value={w.foodPairing.join(", ")} onChange={(e) => update("foodPairing", csvToArr(e.target.value))} />
          </Field>
          <Field label="Notes / options (comma-separated)">
            <Input
              value={w.notes.join(", ")}
              onChange={(e) => {
                const arr = csvToArr(e.target.value);
                setW((p) => ({ ...p, notes: arr, options: arr }));
              }}
            />
          </Field>
          <Field label="Question">
            <Input value={w.question} onChange={(e) => update("question", e.target.value)} />
          </Field>
          <Field label="Next pour (name)">
            <Input value={w.nextPour} onChange={(e) => update("nextPour", e.target.value)} />
          </Field>
          <Field label="Next pour reason">
            <Textarea rows={2} value={w.nextPourReason} onChange={(e) => update("nextPourReason", e.target.value)} />
          </Field>
          <Field label="Tasting steps (one per line)">
            <Textarea
              rows={3}
              value={w.tastingSteps.join("\n")}
              onChange={(e) => update("tastingSteps", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
          <AwardsEditor awards={w.awards} onChange={(a) => update("awards", a)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={w.active} onChange={(e) => update("active", e.target.checked)} />
            Active (shown in tasting journey)
          </label>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(w)}>Save wine</Button>
        </div>
      </div>
    </div>
  );
}

function AwardsEditor({ awards, onChange }: { awards: Award[]; onChange: (a: Award[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Awards</label>
        <Button size="sm" variant="outline" onClick={() => onChange([...awards, { medal: "", competition: "" }])}>
          <Plus size={12} className="mr-1" /> Add
        </Button>
      </div>
      {awards.length === 0 && <p className="text-xs text-muted-foreground">No awards.</p>}
      {awards.map((a, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input placeholder="Medal (Gold, Silver…)" value={a.medal} onChange={(e) => {
            const next = [...awards]; next[i] = { ...next[i], medal: e.target.value }; onChange(next);
          }} />
          <Input placeholder="Competition" value={a.competition} onChange={(e) => {
            const next = [...awards]; next[i] = { ...next[i], competition: e.target.value }; onChange(next);
          }} />
          <Button size="sm" variant="ghost" onClick={() => onChange(awards.filter((_, j) => j !== i))}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Flight editor drawer ────────────────────────────────

function FlightEditor({ flight, allWines, onCancel, onSave }: {
  flight: Flight;
  allWines: Wine[];
  onCancel: () => void;
  onSave: (f: Flight) => void;
}) {
  const [f, setF] = useState<Flight>(flight);
  const update = <K extends keyof Flight>(k: K, v: Flight[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const addWine = (id: number) => {
    if (f.wineIds.length >= 8) return toast.error("Max 8 wines per flight");
    update("wineIds", [...f.wineIds, id]);
  };
  const removeAt = (idx: number) => update("wineIds", f.wineIds.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...f.wineIds];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    update("wineIds", next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl mx-auto my-8 border rounded-lg bg-card shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-medium">{flight.id ? `Edit — Flight ${flight.id}` : "New flight"}</h2>
          <Button size="sm" variant="ghost" onClick={onCancel}><X size={16} /></Button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ID (single letter A-Z)">
              <Input value={f.id} onChange={(e) => update("id", e.target.value.toUpperCase().slice(0, 3) as Flight["id"])} disabled={Boolean(flight.id)} />
            </Field>
            <Field label="Code (URL slug)">
              <Input value={f.code} onChange={(e) => update("code", e.target.value)} placeholder="crisp-classic" />
            </Field>
            <Field label="Name"><Input value={f.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field label="Subtitle"><Input value={f.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></Field>
            <Field label="Glyph">
              <select value={f.glyph} onChange={(e) => update("glyph", e.target.value as Flight["glyph"])} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                {GLYPHS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={2} value={f.description} onChange={(e) => update("description", e.target.value)} />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Wines in this flight ({f.wineIds.length})</label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) addWine(id);
                }}
              >
                <option value="">+ Add wine…</option>
                {allWines.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            {f.wineIds.length === 0 ? (
              <p className="text-xs text-muted-foreground">No wines yet.</p>
            ) : (
              <ol className="space-y-1.5">
                {f.wineIds.map((id, i) => {
                  const w = allWines.find((x) => x.id === id);
                  return (
                    <li key={`${i}-${id}`} className="flex items-center gap-2 border rounded p-2">
                      <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                      <span className="flex-1 text-sm">{w?.name || `Wine #${id}`}</span>
                      <Button size="sm" variant="ghost" onClick={() => move(i, -1)}><ArrowUp size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => move(i, 1)}><ArrowDown size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removeAt(i)}><Trash2 size={14} /></Button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.active} onChange={(e) => update("active", e.target.checked)} />
            Active (shown to guests)
          </label>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(f)}>Save flight</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
