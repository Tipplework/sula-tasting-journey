import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  Star,
  MousePointerClick,
  CheckCircle2,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Filter,
  Wine as WineIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import AccessRequestsPanel from "@/components/admin/AccessRequestsPanel";

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
  duration_ms: number | null;
  step_index: number | null;
  metadata: { device?: string; [k: string]: unknown } | null;
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

type DateRange = "today" | "7d" | "30d" | "all";

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  delta?: { pct: number; sign: "up" | "down" | "flat" } | null;
}) {
  return (
    <div className="wine-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="font-heading text-2xl font-bold">{value}</p>
        {delta && (
          <span
            className={`text-[0.65rem] font-medium flex items-center gap-0.5 ${
              delta.sign === "up"
                ? "text-emerald-600"
                : delta.sign === "down"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {delta.sign === "up" ? <TrendingUp size={10} /> : delta.sign === "down" ? <TrendingDown size={10} /> : <Minus size={10} />}
            {Math.abs(delta.pct).toFixed(0)}%
          </span>
        )}
      </div>
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

function fmtMs(ms: number | null | undefined): string {
  if (!ms || ms < 0) return "—";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s - m * 60);
  return `${m}m ${rem}s`;
}

function rangeStartMs(range: DateRange): number {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (range === "today") return now - day;
  if (range === "7d") return now - 7 * day;
  if (range === "30d") return now - 30 * day;
  return 0;
}

function detectDevice(m: TastingEventRow["metadata"]): string {
  return (m?.device as string) || "unknown";
}

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [events, setEvents] = useState<TastingEventRow[]>([]);
  const [consent, setConsent] = useState<ConsentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("7d");
  const [flightFilter, setFlightFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sessionDrawer, setSessionDrawer] = useState<string | null>(null);
  const [wineDrawer, setWineDrawer] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async (opts?: { showToast?: boolean }) => {
    setRefreshing(true);
    const [evtRes, consentRes] = await Promise.all([
      supabase.from("tasting_events").select("*").order("created_at", { ascending: false }).limit(10000),
      supabase.from("consent_logs").select("id,guest_name,flight_id,device_type,created_at,metadata").order("created_at", { ascending: false }).limit(5000),
    ]);
    if (evtRes.error) toast.error(evtRes.error.message);
    if (consentRes.error) toast.error(consentRes.error.message);
    setEvents((evtRes.data as TastingEventRow[]) || []);
    setConsent((consentRes.data as ConsentRow[]) || []);
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date());
    if (opts?.showToast && !evtRes.error && !consentRes.error) {
      toast.success("Dashboard refreshed");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Auto-refresh + realtime
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = window.setInterval(() => void load(), 30_000);
    const ch = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasting_events" }, () => void load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consent_logs" }, () => void load())
      .subscribe();
    return () => {
      window.clearInterval(iv);
      void supabase.removeChannel(ch);
    };
  }, [autoRefresh]);

  // ── Filter application ────────────────────────────────
  const filtered = useMemo(() => {
    const start = rangeStartMs(range);
    const eventsF = events.filter((e) => {
      if (new Date(e.created_at).getTime() < start) return false;
      if (flightFilter !== "all" && e.flight_id !== flightFilter) return false;
      if (deviceFilter !== "all" && detectDevice(e.metadata) !== deviceFilter) return false;
      return true;
    });
    const consentF = consent.filter((c) => {
      if (new Date(c.created_at).getTime() < start) return false;
      if (flightFilter !== "all" && c.flight_id !== flightFilter) return false;
      if (deviceFilter !== "all" && (c.device_type || "unknown") !== deviceFilter) return false;
      return true;
    });
    return { events: eventsF, consent: consentF };
  }, [events, consent, range, flightFilter, deviceFilter]);

  // ── Aggregations ──────────────────────────────────────
  const stats = useMemo(() => {
    const evs = filtered.events;
    const cons = filtered.consent;

    // Funnel by session
    const sessions = new Map<string, Set<string>>();
    evs.forEach((e) => {
      let s = sessions.get(e.session_id);
      if (!s) {
        s = new Set();
        sessions.set(e.session_id, s);
      }
      s.add(e.event_type);
    });
    const step = (name: string) => Array.from(sessions.values()).filter((s) => s.has(name)).length;
    const welcomeCount = step("welcome_view");
    const flightPicked = step("flight_select");
    const journeyStart = step("journey_start");
    const wine1 = evs.filter((e) => e.event_type === "wine_view" && (e.step_index ?? -1) === 0).map((e) => e.session_id);
    const wine2 = evs.filter((e) => e.event_type === "wine_view" && (e.step_index ?? -1) === 1).map((e) => e.session_id);
    const wine3 = evs.filter((e) => e.event_type === "wine_view" && (e.step_index ?? -1) === 2).map((e) => e.session_id);
    const wine4 = evs.filter((e) => e.event_type === "wine_view" && (e.step_index ?? -1) === 3).map((e) => e.session_id);
    const uniq = (a: string[]) => new Set(a).size;
    const resultsView = step("results_view");
    const complete = step("tasting_complete");
    const vivinoClicks = evs.filter((e) => e.event_type === "vivino_click").length;

    const funnel = [
      { label: "Welcome viewed", count: welcomeCount },
      { label: "Flight picked", count: flightPicked },
      { label: "Journey started", count: journeyStart },
      { label: "Wine 1 opened", count: uniq(wine1) },
      { label: "Wine 2 opened", count: uniq(wine2) },
      { label: "Wine 3 opened", count: uniq(wine3) },
      { label: "Wine 4 opened", count: uniq(wine4) },
      { label: "Results viewed", count: resultsView },
      { label: "Profile submitted", count: complete },
    ];
    const funnelTop = funnel[0].count || 1;
    let biggestDropIdx = -1;
    let biggestDropPct = 0;
    for (let i = 1; i < funnel.length; i++) {
      const prev = funnel[i - 1].count;
      if (!prev) continue;
      const dropPct = 1 - funnel[i].count / prev;
      if (dropPct > biggestDropPct) {
        biggestDropPct = dropPct;
        biggestDropIdx = i;
      }
    }
    const funnelRows = funnel.map((f, i) => ({
      ...f,
      pctOfTotal: Math.round((f.count / funnelTop) * 100),
      pctOfPrev: i === 0 ? 100 : Math.round((f.count / (funnel[i - 1].count || 1)) * 100),
      biggestDrop: i === biggestDropIdx,
    }));

    // Wine ratings
    const ratingsByWine = new Map<string, { total: number; count: number; wineId: number | null }>();
    evs
      .filter((e) => e.event_type === "wine_rating" && e.rating && e.wine_name)
      .forEach((e) => {
        const cur = ratingsByWine.get(e.wine_name!) || { total: 0, count: 0, wineId: e.wine_id };
        cur.total += e.rating!;
        cur.count += 1;
        ratingsByWine.set(e.wine_name!, cur);
      });
    const wineAverages = Array.from(ratingsByWine.entries())
      .map(([name, v]) => ({ name, avg: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg);

    // Avg dwell per wine
    const dwellByWine = new Map<string, { total: number; count: number }>();
    evs
      .filter((e) => e.event_type === "wine_dwell" && e.duration_ms && e.wine_name)
      .forEach((e) => {
        const cur = dwellByWine.get(e.wine_name!) || { total: 0, count: 0 };
        cur.total += e.duration_ms!;
        cur.count += 1;
        dwellByWine.set(e.wine_name!, cur);
      });
    const wineDwellRows = Array.from(dwellByWine.entries())
      .map(([name, v]) => ({ name, avgMs: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avgMs - a.avgMs);

    // Ritual step time per wine
    const ritualByWine = new Map<string, { total: number; count: number }>();
    evs
      .filter((e) => e.event_type === "ritual_step_complete" && e.duration_ms && e.wine_name)
      .forEach((e) => {
        const cur = ritualByWine.get(e.wine_name!) || { total: 0, count: 0 };
        cur.total += e.duration_ms!;
        cur.count += 1;
        ritualByWine.set(e.wine_name!, cur);
      });
    const ritualRows = Array.from(ritualByWine.entries())
      .map(([name, v]) => ({ name, avgMs: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avgMs - a.avgMs);

    // Session length distribution: time from first to last event per session
    const sessionSpans = new Map<string, { min: number; max: number }>();
    evs.forEach((e) => {
      const t = new Date(e.created_at).getTime();
      const cur = sessionSpans.get(e.session_id) || { min: t, max: t };
      cur.min = Math.min(cur.min, t);
      cur.max = Math.max(cur.max, t);
      sessionSpans.set(e.session_id, cur);
    });
    const buckets = { "<2m": 0, "2–5m": 0, "5–10m": 0, "10m+": 0 };
    sessionSpans.forEach(({ min, max }) => {
      const mins = (max - min) / 60000;
      if (mins < 2) buckets["<2m"] += 1;
      else if (mins < 5) buckets["2–5m"] += 1;
      else if (mins < 10) buckets["5–10m"] += 1;
      else buckets["10m+"] += 1;
    });
    const sessionCount = sessionSpans.size || 1;
    const avgSessionMinutes = Array.from(sessionSpans.values()).reduce((a, b) => a + (b.max - b.min), 0) / sessionCount / 60000;

    // Vivino
    const vivinoByWine = new Map<string, number>();
    evs
      .filter((e) => e.event_type === "vivino_click" && e.wine_name)
      .forEach((e) => vivinoByWine.set(e.wine_name!, (vivinoByWine.get(e.wine_name!) || 0) + 1));
    const vivinoRows = Array.from(vivinoByWine.entries()).sort((a, b) => b[1] - a[1]);

    // Flight popularity
    const flightCounts = new Map<string, number>();
    cons.forEach((c) => c.flight_id && flightCounts.set(c.flight_id, (flightCounts.get(c.flight_id) || 0) + 1));
    const flightRows = Array.from(flightCounts.entries()).sort((a, b) => b[1] - a[1]);

    return {
      funnel: funnelRows,
      wineAverages,
      wineDwellRows,
      ritualRows,
      buckets,
      avgSessionMinutes,
      vivinoRows,
      vivinoTotal: vivinoClicks,
      flightRows,
      totalGuests: cons.length,
      startsCount: journeyStart,
      completionRate: journeyStart ? Math.round((complete / journeyStart) * 100) : 0,
      mostLiked: wineAverages[0]?.name || "—",
      allFlights: Array.from(new Set(consent.map((c) => c.flight_id).filter(Boolean))) as string[],
      allDevices: Array.from(new Set([...consent.map((c) => c.device_type || "unknown"), ...events.map((e) => detectDevice(e.metadata))])),
    };
  }, [filtered, consent, events]);

  // ── Cohort compare (previous period of same length) ──
  const cohort = useMemo(() => {
    if (range === "all") return null;
    const day = 24 * 60 * 60 * 1000;
    const span = range === "today" ? day : range === "7d" ? 7 * day : 30 * day;
    const now = Date.now();
    const prevStart = now - 2 * span;
    const prevEnd = now - span;

    const prevGuests = consent.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= prevStart && t < prevEnd;
    }).length;
    const prevEvents = events.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= prevStart && t < prevEnd;
    });
    const prevStartCount = new Set(prevEvents.filter((e) => e.event_type === "journey_start").map((e) => e.session_id)).size;
    const prevComplete = new Set(prevEvents.filter((e) => e.event_type === "tasting_complete").map((e) => e.session_id)).size;
    const prevVivino = prevEvents.filter((e) => e.event_type === "vivino_click").length;
    const prevRate = prevStartCount ? (prevComplete / prevStartCount) * 100 : 0;

    const delta = (curr: number, prev: number): { pct: number; sign: "up" | "down" | "flat" } | null => {
      if (!prev && !curr) return null;
      if (!prev) return { pct: 100, sign: "up" };
      const pct = ((curr - prev) / prev) * 100;
      return { pct, sign: pct > 1 ? "up" : pct < -1 ? "down" : "flat" };
    };
    return {
      guests: delta(stats.totalGuests, prevGuests),
      completion: delta(stats.completionRate, prevRate),
      vivino: delta(stats.vivinoTotal, prevVivino),
    };
  }, [range, consent, events, stats]);

  // ── Session drawer data ──
  const drawerSession = useMemo(() => {
    if (!sessionDrawer) return null;
    const rows = events
      .filter((e) => e.session_id === sessionDrawer)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (!rows.length) return null;
    const first = rows[0].guest_name || rows.find((r) => r.guest_name)?.guest_name || "Guest";
    const email = rows.find((r) => r.guest_email)?.guest_email || "";
    const phone = rows.find((r) => r.guest_phone)?.guest_phone || "";
    const flight = rows.find((r) => r.flight_id)?.flight_id || "—";
    const startMs = new Date(rows[0].created_at).getTime();
    return { rows, first, email, phone, flight, startMs };
  }, [sessionDrawer, events]);

  // ── Wine deep-dive data ──
  const drawerWine = useMemo(() => {
    if (!wineDrawer) return null;
    const wineEvts = filtered.events.filter((e) => e.wine_name === wineDrawer);
    const ratings = wineEvts.filter((e) => e.event_type === "wine_rating" && e.rating);
    const dist = [1, 2, 3, 4, 5].map((star) => ({ star, n: ratings.filter((r) => r.rating === star).length }));
    const quizAll: string[] = [];
    wineEvts.filter((e) => e.event_type === "wine_quiz" && e.quiz_answer).forEach((e) => quizAll.push(...(e.quiz_answer || [])));
    const quizCounts = new Map<string, number>();
    quizAll.forEach((q) => quizCounts.set(q, (quizCounts.get(q) || 0) + 1));
    const topQuiz = Array.from(quizCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const vivino = wineEvts.filter((e) => e.event_type === "vivino_click").length;
    const views = new Set(wineEvts.filter((e) => e.event_type === "wine_view").map((e) => e.session_id)).size;
    const vivinoCtr = views ? Math.round((vivino / views) * 100) : 0;
    const favourites = filtered.events.filter((e) => e.event_type === "tasting_complete" && e.wine_name === wineDrawer).length;
    const dwellRows = wineEvts.filter((e) => e.event_type === "wine_dwell" && e.duration_ms);
    const avgDwell = dwellRows.length ? dwellRows.reduce((a, b) => a + (b.duration_ms || 0), 0) / dwellRows.length : 0;
    return { name: wineDrawer, dist, topQuiz, vivino, vivinoCtr, views, favourites, avgDwell, ratingsCount: ratings.length };
  }, [wineDrawer, filtered.events]);

  // ── Exports ──
  const exportGuests = () => {
    const rows = filtered.consent.map((c) => ({
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
    const rows = filtered.events.map((e) => ({
      created_at: e.created_at,
      event: e.event_type,
      session_id: e.session_id,
      name: e.guest_name || "",
      email: e.guest_email || "",
      phone: e.guest_phone || "",
      flight: e.flight_id || "",
      wine: e.wine_name || "",
      step_index: e.step_index ?? "",
      rating: e.rating ?? "",
      quiz: e.quiz_answer ? e.quiz_answer.join(" | ") : "",
      duration_ms: e.duration_ms ?? "",
      personality: e.personality || "",
      device: detectDevice(e.metadata),
    }));
    download(`sula-tasting-events-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  };

  const deleteGuest = async (row: ConsentRow) => {
    if (!window.confirm(`Delete all records for ${row.guest_name || row.metadata?.email || "this guest"}? This cannot be undone.`)) return;
    const email = row.metadata?.email as string | undefined;
    const phone = row.metadata?.phone as string | undefined;
    // Delete consent row + any tasting events matching email/phone
    const del1 = await supabase.from("consent_logs").delete().eq("id", row.id);
    if (del1.error) return toast.error(del1.error.message);
    if (email) await supabase.from("tasting_events").delete().eq("guest_email", email);
    if (phone) await supabase.from("tasting_events").delete().eq("guest_phone", phone);
    toast.success("Guest records deleted");
    void load();
  };

  const wipePreLaunch = async () => {
    const cutoff = window.prompt("Delete all guest data captured BEFORE this date (YYYY-MM-DD)?", new Date().toISOString().slice(0, 10));
    if (!cutoff) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) return toast.error("Use YYYY-MM-DD format");
    const iso = `${cutoff}T00:00:00.000Z`;
    const [a, b] = await Promise.all([
      supabase.from("tasting_events").delete().lt("created_at", iso),
      supabase.from("consent_logs").delete().lt("created_at", iso),
    ]);
    if (a.error || b.error) return toast.error((a.error || b.error)!.message);
    toast.success(`Deleted all data before ${cutoff}`);
    void load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Tasting Room Analytics · Admin only
              {lastUpdated && (
                <span className="ml-2 text-[0.65rem]">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh
            </label>
            <button
              onClick={() => void load({ showToast: true })}
              disabled={refreshing}
              className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1 disabled:opacity-60"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button onClick={signOut} className="btn-secondary !py-2 !px-3 text-xs">Sign out</button>
          </div>
        </div>

        {/* Access Requests (super admin only) */}
        {isSuperAdmin && <AccessRequestsPanel />}

        {/* Filters */}
        <div className="wine-card p-3 flex flex-wrap items-center gap-2 text-xs">
          <Filter size={14} className="text-muted-foreground" />
          <div className="flex items-center gap-1">
            {(["today", "7d", "30d", "all"] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-full border transition-colors ${
                  range === r ? "bg-wine-gold text-foreground border-wine-gold" : "border-border hover:bg-muted"
                }`}
              >
                {r === "today" ? "Today" : r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All"}
              </button>
            ))}
          </div>
          <select
            value={flightFilter}
            onChange={(e) => setFlightFilter(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-background"
          >
            <option value="all">All flights</option>
            {stats.allFlights.map((f) => (
              <option key={f} value={f}>Flight {f}</option>
            ))}
          </select>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-background"
          >
            <option value="all">All devices</option>
            {stats.allDevices.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <span className="ml-auto text-muted-foreground">
            {filtered.consent.length} guests · {filtered.events.length} events
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Guests" value={stats.totalGuests} delta={cohort?.guests} />
              <StatCard icon={CheckCircle2} label="Completion" value={`${stats.completionRate}%`} delta={cohort?.completion} />
              <StatCard icon={Clock} label="Avg session" value={`${stats.avgSessionMinutes.toFixed(1)}m`} />
              <StatCard icon={MousePointerClick} label="Vivino clicks" value={stats.vivinoTotal} delta={cohort?.vivino} />
            </div>

            {/* Funnel */}
            <div className="wine-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-muted-foreground" />
                <h2 className="font-heading font-semibold">Guest Funnel</h2>
              </div>
              <div className="space-y-2">
                {stats.funnel.map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={f.biggestDrop ? "text-destructive font-medium" : ""}>
                        {f.label}
                      </span>
                      <span className="text-muted-foreground">
                        {f.count} · {f.pctOfTotal}% of total · {f.pctOfPrev}% of prev
                      </span>
                    </div>
                    <div className="progress-track h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${f.biggestDrop ? "bg-destructive/70" : "bg-wine-gold"}`}
                        style={{ width: `${f.pctOfTotal}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time on wine + ritual time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="wine-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <h2 className="font-heading font-semibold">Avg Time per Wine</h2>
                </div>
                {stats.wineDwellRows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No dwell data yet.</p>
                ) : (
                  stats.wineDwellRows.map((w) => (
                    <div key={w.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <button onClick={() => setWineDrawer(w.name)} className="text-left hover:underline">{w.name}</button>
                        <span className="text-muted-foreground">{fmtMs(w.avgMs)} · {w.count} sessions</span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div className="progress-fill h-1.5" style={{ width: `${Math.min(100, (w.avgMs / 120000) * 100)}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="wine-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <h2 className="font-heading font-semibold">Avg Ritual Step Time</h2>
                </div>
                {stats.ritualRows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No ritual data yet.</p>
                ) : (
                  stats.ritualRows.map((w) => (
                    <div key={w.name} className="flex justify-between text-xs">
                      <span>{w.name}</span>
                      <span className="text-muted-foreground">{fmtMs(w.avgMs)} · {w.count} steps</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Session length distribution + Flight popularity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="wine-card p-5 space-y-3">
                <h2 className="font-heading font-semibold">Session Length</h2>
                {(Object.keys(stats.buckets) as (keyof typeof stats.buckets)[]).map((k) => {
                  const total = Object.values(stats.buckets).reduce((a, b) => a + b, 0) || 1;
                  const n = stats.buckets[k];
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{k}</span>
                        <span className="text-muted-foreground">{n} · {Math.round((n / total) * 100)}%</span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div className="progress-fill h-1.5" style={{ width: `${(n / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="wine-card p-5 space-y-3">
                <h2 className="font-heading font-semibold">Flight Popularity</h2>
                {stats.flightRows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No flights picked yet.</p>
                ) : (
                  stats.flightRows.map(([id, n]) => (
                    <div key={id} className="flex justify-between text-xs">
                      <span>Flight {id}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rating per wine */}
            <div className="wine-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-muted-foreground" />
                <h2 className="font-heading font-semibold">Average Rating per Wine · Most liked: {stats.mostLiked}</h2>
              </div>
              {stats.wineAverages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No ratings yet.</p>
              ) : (
                stats.wineAverages.map((w) => (
                  <div key={w.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <button onClick={() => setWineDrawer(w.name)} className="text-left hover:underline">{w.name}</button>
                      <span className="font-medium">{w.avg.toFixed(2)}/5 · {w.count}</span>
                    </div>
                    <div className="progress-track h-2">
                      <div className="progress-fill h-2" style={{ width: `${(w.avg / 5) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Vivino */}
            <div className="wine-card p-5 space-y-3">
              <h2 className="font-heading font-semibold">Vivino Clicks per Wine</h2>
              {stats.vivinoRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No Vivino clicks yet.</p>
              ) : (
                stats.vivinoRows.map(([name, n]) => (
                  <div key={name} className="flex justify-between text-xs">
                    <button onClick={() => setWineDrawer(name)} className="text-left hover:underline">{name}</button>
                    <span className="font-medium">{n}</span>
                  </div>
                ))
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
                      <th className="py-2 pr-3">Device</th>
                      <th className="py-2 pr-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.consent.slice(0, 50).map((c) => {
                      // Best-effort match session_id from tasting_events using email
                      const email = c.metadata?.email as string | undefined;
                      const relatedSession = email ? events.find((e) => e.guest_email === email)?.session_id : undefined;
                      return (
                        <tr key={c.id} className="border-t border-border/50">
                          <td className="py-2 pr-3 whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                          <td className="py-2 pr-3">{c.guest_name || "—"}</td>
                          <td className="py-2 pr-3">{email || "—"}</td>
                          <td className="py-2 pr-3">{(c.metadata?.phone as string) || "—"}</td>
                          <td className="py-2 pr-3">{c.flight_id || "—"}</td>
                          <td className="py-2 pr-3">{c.device_type || "—"}</td>
                          <td className="py-2 pr-3 flex items-center gap-1">
                            {relatedSession && (
                              <button onClick={() => setSessionDrawer(relatedSession)} className="text-wine-gold hover:underline">
                                View
                              </button>
                            )}
                            <button
                              onClick={() => void deleteGuest(c)}
                              className="text-muted-foreground hover:text-destructive ml-1"
                              title="Delete this guest"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.consent.length === 0 && (
                      <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No guests in the current filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.consent.length > 50 && (
                <p className="text-[11px] text-muted-foreground">Showing latest 50. Export CSV for full list ({filtered.consent.length} records).</p>
              )}
            </div>

            {/* Recent events */}
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
                      <th className="py-2 pr-3">Dwell</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.events.slice(0, 60).map((e) => (
                      <tr
                        key={e.id}
                        className="border-t border-border/50 hover:bg-muted/40 cursor-pointer"
                        onClick={() => setSessionDrawer(e.session_id)}
                      >
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(e.created_at).toLocaleTimeString()}</td>
                        <td className="py-2 pr-3">{e.event_type}</td>
                        <td className="py-2 pr-3">{e.guest_name || e.guest_email || e.session_id.slice(0, 8)}</td>
                        <td className="py-2 pr-3">{e.wine_name || "—"}</td>
                        <td className="py-2 pr-3">{e.rating ?? "—"}</td>
                        <td className="py-2 pr-3">{fmtMs(e.duration_ms)}</td>
                      </tr>
                    ))}
                    {filtered.events.length === 0 && (
                      <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No events in the current filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.events.length > 60 && (
                <p className="text-[11px] text-muted-foreground">Showing latest 60. Export CSV for full list ({filtered.events.length}).</p>
              )}
            </div>

            {/* Danger zone */}
            <div className="wine-card p-5 space-y-3 border border-destructive/40">
              <h2 className="font-heading font-semibold text-destructive">Danger Zone</h2>
              <p className="text-xs text-muted-foreground">
                Purge all guest records (tasting events + consent logs) captured before a chosen date. Wines, flights, and content are not affected.
              </p>
              <button onClick={wipePreLaunch} className="btn-secondary text-xs flex items-center gap-1 border-destructive/40 text-destructive hover:bg-destructive/5">
                <Trash2 size={12} /> Purge data before a date…
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session detail drawer */}
      <Sheet open={!!sessionDrawer} onOpenChange={(o) => !o && setSessionDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Session timeline</SheetTitle>
          </SheetHeader>
          {drawerSession && (
            <div className="space-y-3 mt-4 text-sm">
              <div className="space-y-0.5">
                <p className="font-heading text-lg font-semibold">{drawerSession.first}</p>
                {drawerSession.email && <p className="text-xs text-muted-foreground">{drawerSession.email}</p>}
                {drawerSession.phone && <p className="text-xs text-muted-foreground">{drawerSession.phone}</p>}
                <p className="text-xs text-muted-foreground">Flight {drawerSession.flight}</p>
              </div>
              <div className="border-t border-border/60" />
              <ol className="space-y-2">
                {drawerSession.rows.map((r) => {
                  const offsetMs = new Date(r.created_at).getTime() - drawerSession.startMs;
                  const secs = Math.round(offsetMs / 1000);
                  const stamp = secs < 60 ? `+${secs}s` : `+${Math.floor(secs / 60)}m ${secs % 60}s`;
                  return (
                    <li key={r.id} className="flex gap-3 text-xs">
                      <span className="text-muted-foreground w-16 flex-shrink-0 tabular-nums">{stamp}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{r.event_type}</span>
                        {r.wine_name && <span className="text-muted-foreground"> · {r.wine_name}</span>}
                        {r.rating && <span> · {r.rating}★</span>}
                        {r.quiz_answer && r.quiz_answer.length > 0 && (
                          <span className="text-muted-foreground"> · {r.quiz_answer.join(", ")}</span>
                        )}
                        {r.duration_ms && <span className="text-muted-foreground"> · {fmtMs(r.duration_ms)}</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Wine deep-dive drawer */}
      <Sheet open={!!wineDrawer} onOpenChange={(o) => !o && setWineDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <WineIcon size={16} /> {wineDrawer}
            </SheetTitle>
          </SheetHeader>
          {drawerWine && (
            <div className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Views</p>
                  <p className="font-heading text-xl font-bold">{drawerWine.views}</p>
                </div>
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Ratings</p>
                  <p className="font-heading text-xl font-bold">{drawerWine.ratingsCount}</p>
                </div>
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Vivino CTR</p>
                  <p className="font-heading text-xl font-bold">{drawerWine.vivinoCtr}%</p>
                </div>
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Avg dwell</p>
                  <p className="font-heading text-xl font-bold">{fmtMs(drawerWine.avgDwell)}</p>
                </div>
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Picked as favourite</p>
                  <p className="font-heading text-xl font-bold">{drawerWine.favourites}</p>
                </div>
                <div className="wine-card p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Vivino clicks</p>
                  <p className="font-heading text-xl font-bold">{drawerWine.vivino}</p>
                </div>
              </div>

              <div className="wine-card p-4 space-y-2">
                <p className="text-xs font-medium">Rating distribution</p>
                {drawerWine.dist.map((d) => {
                  const max = Math.max(...drawerWine.dist.map((x) => x.n), 1);
                  return (
                    <div key={d.star} className="flex items-center gap-2 text-xs">
                      <span className="w-6 tabular-nums">{d.star}★</span>
                      <div className="flex-1 progress-track h-2">
                        <div className="progress-fill h-2" style={{ width: `${(d.n / max) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right text-muted-foreground tabular-nums">{d.n}</span>
                    </div>
                  );
                })}
              </div>

              <div className="wine-card p-4 space-y-2">
                <p className="text-xs font-medium">Top quiz answers</p>
                {drawerWine.topQuiz.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No quiz answers yet.</p>
                ) : (
                  drawerWine.topQuiz.map(([q, n]) => (
                    <div key={q} className="flex justify-between text-xs">
                      <span>{q}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
