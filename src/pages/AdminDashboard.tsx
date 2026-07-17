import { useEffect, useMemo, useState } from "react";
import { BarChart3, Users, Star, MousePointerClick, CheckCircle2, Download, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TastingEventRow {
  id: string;
  session_id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  flight_id: string | null;
  wine_id: number | null;
  wine_name: string | null;
  event_type: string;
  rating: number | null;
  quiz_answer: string[] | null;
  personality: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ConsentRow {
  id: string;
  guest_name: string | null;
  flight_id: string | null;
  device_type: string | null;
  created_at: string;
  metadata: { email?: string | null; phone?: string | null } | null;
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="wine-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<TastingEventRow[]>([]);
  const [consent, setConsent] = useState<ConsentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [evtRes, consentRes] = await Promise.all([
      supabase.from("tasting_events").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("consent_logs").select("id,guest_name,flight_id,device_type,created_at,metadata").order("created_at", { ascending: false }).limit(2000),
    ]);
    if (evtRes.error) toast.error(evtRes.error.message);
    if (consentRes.error) toast.error(consentRes.error.message);
    setEvents((evtRes.data as TastingEventRow[]) || []);
    setConsent((consentRes.data as ConsentRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const todayCount = consent.filter((c) => now - new Date(c.created_at).getTime() < day).length;
    const weekCount = consent.filter((c) => now - new Date(c.created_at).getTime() < 7 * day).length;

    const startSessions = new Set(events.filter((e) => e.event_type === "journey_start").map((e) => e.session_id));
    const completeSessions = new Set(events.filter((e) => e.event_type === "tasting_complete").map((e) => e.session_id));
    const completionRate = startSessions.size ? Math.round((completeSessions.size / startSessions.size) * 100) : 0;

    // Ratings per wine
    const ratingsByWine = new Map<string, { total: number; count: number }>();
    events
      .filter((e) => e.event_type === "wine_rating" && e.rating && e.wine_name)
      .forEach((e) => {
        const cur = ratingsByWine.get(e.wine_name!) || { total: 0, count: 0 };
        cur.total += e.rating!;
        cur.count += 1;
        ratingsByWine.set(e.wine_name!, cur);
      });
    const wineAverages = Array.from(ratingsByWine.entries())
      .map(([name, v]) => ({ name, avg: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg);
    const mostLiked = wineAverages[0]?.name || "—";

    // Vivino clicks per wine
    const vivinoByWine = new Map<string, number>();
    events
      .filter((e) => e.event_type === "vivino_click" && e.wine_name)
      .forEach((e) => vivinoByWine.set(e.wine_name!, (vivinoByWine.get(e.wine_name!) || 0) + 1));
    const vivinoTotal = Array.from(vivinoByWine.values()).reduce((a, b) => a + b, 0);
    const vivinoRows = Array.from(vivinoByWine.entries()).sort((a, b) => b[1] - a[1]);

    // Flight popularity
    const flightCounts = new Map<string, number>();
    consent.forEach((c) => {
      if (c.flight_id) flightCounts.set(c.flight_id, (flightCounts.get(c.flight_id) || 0) + 1);
    });
    const flightRows = Array.from(flightCounts.entries()).sort((a, b) => b[1] - a[1]);

    return {
      todayCount,
      weekCount,
      totalGuests: consent.length,
      startsCount: startSessions.size,
      completionRate,
      mostLiked,
      wineAverages,
      vivinoTotal,
      vivinoRows,
      flightRows,
    };
  }, [events, consent]);

  const exportGuests = () => {
    const rows = consent.map((c) => ({
      created_at: c.created_at,
      name: c.guest_name || "",
      email: c.metadata?.email || "",
      phone: c.metadata?.phone || "",
      flight: c.flight_id || "",
      device: c.device_type || "",
    }));
    download(`sula-guests-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  };

  const exportEvents = () => {
    const rows = events.map((e) => ({
      created_at: e.created_at,
      event: e.event_type,
      session_id: e.session_id,
      name: e.guest_name || "",
      email: e.guest_email || "",
      phone: e.guest_phone || "",
      flight: e.flight_id || "",
      wine: e.wine_name || "",
      rating: e.rating ?? "",
      quiz: e.quiz_answer ? e.quiz_answer.join(" | ") : "",
      personality: e.personality || "",
    }));
    download(`sula-tasting-events-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  };

  const wipePreLaunch = async () => {
    const cutoff = window.prompt(
      "Delete all guest data captured BEFORE this date (YYYY-MM-DD)?",
      new Date().toISOString().slice(0, 10)
    );
    if (!cutoff) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) {
      toast.error("Use YYYY-MM-DD format");
      return;
    }
    const iso = `${cutoff}T00:00:00.000Z`;
    const [a, b] = await Promise.all([
      supabase.from("tasting_events").delete().lt("created_at", iso),
      supabase.from("consent_logs").delete().lt("created_at", iso),
    ]);
    if (a.error || b.error) {
      toast.error((a.error || b.error)!.message);
      return;
    }
    toast.success(`Deleted all guest data before ${cutoff}`);
    void load();
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Tasting Room Analytics · Live</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void load()} className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Guests Today" value={stats.todayCount} />
              <StatCard icon={Users} label="Guests · 7 Days" value={stats.weekCount} />
              <StatCard icon={CheckCircle2} label="Completion" value={`${stats.completionRate}%`} />
              <StatCard icon={MousePointerClick} label="Vivino Clicks" value={stats.vivinoTotal} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatCard icon={Star} label="Most Liked Wine" value={stats.mostLiked} />
              <StatCard icon={Users} label="Total Guest Records" value={stats.totalGuests} />
            </div>

            {/* Average rating per wine */}
            <div className="wine-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-muted-foreground" />
                <h2 className="font-heading font-semibold">Average Rating per Wine</h2>
              </div>
              {stats.wineAverages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No ratings yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.wineAverages.map((w) => (
                    <div key={w.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{w.name}</span>
                        <span className="font-medium">{w.avg.toFixed(2)}/5 · {w.count} rating{w.count === 1 ? "" : "s"}</span>
                      </div>
                      <div className="progress-track h-2">
                        <div className="progress-fill h-2" style={{ width: `${(w.avg / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vivino clicks */}
            <div className="wine-card p-5 space-y-3">
              <h2 className="font-heading font-semibold">Vivino Clicks per Wine</h2>
              {stats.vivinoRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No Vivino clicks yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {stats.vivinoRows.map(([name, n]) => (
                    <li key={name} className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-medium">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Flight popularity */}
            <div className="wine-card p-5 space-y-3">
              <h2 className="font-heading font-semibold">Flight Popularity</h2>
              {stats.flightRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No flights picked yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {stats.flightRows.map(([id, n]) => (
                    <li key={id} className="flex justify-between">
                      <span>Flight {id}</span>
                      <span className="font-medium">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Guest log */}
            <div className="wine-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold">Guest Log</h2>
                <button onClick={exportGuests} className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1">
                  <Download size={12} /> CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3">When</th>
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Phone</th>
                      <th className="py-2 pr-3">Flight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consent.slice(0, 25).map((c) => (
                      <tr key={c.id} className="border-t border-border/50">
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-3">{c.guest_name || "—"}</td>
                        <td className="py-2 pr-3">{c.metadata?.email || "—"}</td>
                        <td className="py-2 pr-3">{c.metadata?.phone || "—"}</td>
                        <td className="py-2 pr-3">{c.flight_id || "—"}</td>
                      </tr>
                    ))}
                    {consent.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No guests yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {consent.length > 25 && (
                <p className="text-[11px] text-muted-foreground">Showing latest 25. Export CSV for full list ({consent.length} records).</p>
              )}
            </div>

            {/* Events feed */}
            <div className="wine-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold">Recent Tasting Events</h2>
                <button onClick={exportEvents} className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1">
                  <Download size={12} /> CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3">When</th>
                      <th className="py-2 pr-3">Event</th>
                      <th className="py-2 pr-3">Guest</th>
                      <th className="py-2 pr-3">Wine</th>
                      <th className="py-2 pr-3">Rating</th>
                      <th className="py-2 pr-3">Quiz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 40).map((e) => (
                      <tr key={e.id} className="border-t border-border/50">
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-3">{e.event_type}</td>
                        <td className="py-2 pr-3">{e.guest_name || e.guest_email || e.session_id.slice(0, 8)}</td>
                        <td className="py-2 pr-3">{e.wine_name || "—"}</td>
                        <td className="py-2 pr-3">{e.rating ?? "—"}</td>
                        <td className="py-2 pr-3">{e.quiz_answer?.join(", ") || "—"}</td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No events yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {events.length > 40 && (
                <p className="text-[11px] text-muted-foreground">Showing latest 40. Export CSV for full list ({events.length} records).</p>
              )}
            </div>

            {/* Danger zone */}
            <div className="wine-card p-5 space-y-3 border border-destructive/40">
              <h2 className="font-heading font-semibold text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">
                Delete all guest records (tasting events + consent logs) captured before a given date. Wines, flights and content are not affected.
              </p>
              <button onClick={wipePreLaunch} className="btn-secondary text-xs flex items-center gap-1 border-destructive/40 text-destructive hover:bg-destructive/5">
                <Trash2 size={12} /> Purge data before a date…
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
