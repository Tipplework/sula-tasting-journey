import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ChevronRight,
  Search,
  Smartphone,
  ListOrdered,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import AccessRequestsPanel from "@/components/admin/AccessRequestsPanel";

// ─── Types ─────────────────────────────────────────────────────────────
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
type DrawerKind =
  | { kind: "guests" }
  | { kind: "events" }
  | { kind: "funnel" }
  | { kind: "wines" }
  | { kind: "ratings" }
  | { kind: "vivino" }
  | { kind: "ritual" }
  | { kind: "sessionLength" }
  | { kind: "flights" }
  | { kind: "devices" }
  | { kind: "session"; sessionId: string }
  | { kind: "wine"; wineName: string };

// ─── Helpers ───────────────────────────────────────────────────────────
function rangeStartIso(range: DateRange): string | null {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (range === "today") return new Date(now - day).toISOString();
  if (range === "7d") return new Date(now - 7 * day).toISOString();
  if (range === "30d") return new Date(now - 30 * day).toISOString();
  return null;
}

function fmtMs(ms: number | null | undefined): string {
  if (!ms || ms < 0) return "—";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s - m * 60)}s`;
}

function detectDevice(m: TastingEventRow["metadata"]): string {
  return (m?.device as string) || "unknown";
}

// ─── Guest identity grouping ──────────────────────────────────────────
interface GuestGroup {
  key: string;
  name: string;
  email: string;
  phone: string;
  visits: ConsentRow[];         // sorted newest → oldest
  flights: string[];            // unique flight ids
  devices: string[];            // unique devices
  latestAt: number;             // ms
}

function normEmail(e: string | null | undefined): string {
  return (e || "").trim().toLowerCase();
}
function normPhone(p: string | null | undefined): string {
  return (p || "").replace(/\D+/g, "");
}
function identityKey(c: ConsentRow): string {
  const email = normEmail(c.metadata?.email as string | undefined);
  if (email) return `e:${email}`;
  const phone = normPhone(c.metadata?.phone as string | undefined);
  if (phone) return `p:${phone}`;
  const name = (c.guest_name || "").trim().toLowerCase();
  return `n:${name}|d:${c.device_type || "unknown"}`;
}

function groupGuests(rows: ConsentRow[]): GuestGroup[] {
  const map = new Map<string, GuestGroup>();
  for (const c of rows) {
    const key = identityKey(c);
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        name: c.guest_name || "Guest",
        email: (c.metadata?.email as string) || "",
        phone: (c.metadata?.phone as string) || "",
        visits: [],
        flights: [],
        devices: [],
        latestAt: 0,
      };
      map.set(key, g);
    }
    g.visits.push(c);
    if (!g.name || g.name === "Guest") g.name = c.guest_name || g.name;
    if (!g.email && c.metadata?.email) g.email = c.metadata.email as string;
    if (!g.phone && c.metadata?.phone) g.phone = c.metadata.phone as string;
    if (c.flight_id && !g.flights.includes(c.flight_id)) g.flights.push(c.flight_id);
    const d = c.device_type || "unknown";
    if (!g.devices.includes(d)) g.devices.push(d);
    const t = new Date(c.created_at).getTime();
    if (t > g.latestAt) g.latestAt = t;
  }
  const groups = Array.from(map.values());
  groups.forEach((g) => g.visits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  groups.sort((a, b) => b.latestAt - a.latestAt);
  return groups;
}


function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return "";
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

// ─── Tile ──────────────────────────────────────────────────────────────
function Tile({
  icon: Icon,
  label,
  value,
  sub,
  delta,
  onClick,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  delta?: { pct: number; sign: "up" | "down" | "flat" } | null;
  onClick?: () => void;
  accent?: boolean;
}) {
  const clickable = !!onClick;
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className={`wine-card p-4 text-left w-full space-y-1 transition-all ${
        clickable ? "hover:border-wine-gold hover:shadow-md cursor-pointer" : "cursor-default"
      } ${accent ? "border-wine-gold/50" : ""}`}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon size={13} />
          <p className="text-[0.7rem] font-medium uppercase tracking-wide">{label}</p>
        </div>
        {clickable && <ChevronRight size={13} className="opacity-40" />}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="font-heading text-2xl font-bold leading-none">{value}</p>
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
      {sub && <p className="text-[0.7rem] text-muted-foreground truncate">{sub}</p>}
    </button>
  );
}

// ─── Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();

  // Overview data (lightweight)
  const [events, setEvents] = useState<TastingEventRow[]>([]);
  const [consent, setConsent] = useState<ConsentRow[]>([]);
  const [totals, setTotals] = useState<{ guests: number; events: number }>({ guests: 0, events: 0 });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [range, setRange] = useState<DateRange>("7d");
  const [flightFilter, setFlightFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [drawer, setDrawer] = useState<DrawerKind | null>(null);
  const lastRefetchRef = useRef(0);

  // ── Overview fetch (lean) ────────────────────────────────────────────
  const load = useCallback(
    async (opts?: { showToast?: boolean }) => {
      setRefreshing(true);
      const startIso = rangeStartIso(range);

      let evtQ = supabase
        .from("tasting_events")
        .select(
          "id,session_id,guest_name,guest_email,guest_phone,flight_id,wine_id,wine_name,event_type,rating,quiz_answer,personality,duration_ms,step_index,metadata,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(2000);
      let consQ = supabase
        .from("consent_logs")
        .select("id,guest_name,flight_id,device_type,created_at,metadata")
        .order("created_at", { ascending: false })
        .limit(200);
      let evtCountQ = supabase.from("tasting_events").select("id", { count: "exact", head: true });
      let consCountQ = supabase.from("consent_logs").select("id", { count: "exact", head: true });
      if (startIso) {
        evtQ = evtQ.gte("created_at", startIso);
        consQ = consQ.gte("created_at", startIso);
        evtCountQ = evtCountQ.gte("created_at", startIso);
        consCountQ = consCountQ.gte("created_at", startIso);
      }

      const [evtRes, consRes, evtCount, consCount] = await Promise.all([evtQ, consQ, evtCountQ, consCountQ]);

      if (evtRes.error) toast.error(evtRes.error.message);
      if (consRes.error) toast.error(consRes.error.message);
      setEvents((evtRes.data as TastingEventRow[]) || []);
      setConsent((consRes.data as ConsentRow[]) || []);
      setTotals({ guests: consCount.count ?? 0, events: evtCount.count ?? 0 });
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
      if (opts?.showToast && !evtRes.error && !consRes.error) toast.success("Dashboard refreshed");
    },
    [range]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-refresh + realtime with 5s debounce
  useEffect(() => {
    if (!autoRefresh) return;
    const trigger = () => {
      const now = Date.now();
      if (now - lastRefetchRef.current < 5000) return;
      lastRefetchRef.current = now;
      void load();
    };
    const iv = window.setInterval(trigger, 30_000);
    const ch = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasting_events" }, trigger)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consent_logs" }, trigger)
      .subscribe();
    return () => {
      window.clearInterval(iv);
      void supabase.removeChannel(ch);
    };
  }, [autoRefresh, load]);

  // ── Client-side filters (flight/device) ──────────────────────────────
  const filtered = useMemo(() => {
    const evs = events.filter((e) => {
      if (flightFilter !== "all" && e.flight_id !== flightFilter) return false;
      if (deviceFilter !== "all" && detectDevice(e.metadata) !== deviceFilter) return false;
      return true;
    });
    const cons = consent.filter((c) => {
      if (flightFilter !== "all" && c.flight_id !== flightFilter) return false;
      if (deviceFilter !== "all" && (c.device_type || "unknown") !== deviceFilter) return false;
      return true;
    });
    return { events: evs, consent: cons };
  }, [events, consent, flightFilter, deviceFilter]);

  // ── Aggregates ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const evs = filtered.events;
    const cons = filtered.consent;

    const sessions = new Map<string, Set<string>>();
    evs.forEach((e) => {
      let s = sessions.get(e.session_id);
      if (!s) sessions.set(e.session_id, (s = new Set()));
      s.add(e.event_type);
    });
    const step = (n: string) => Array.from(sessions.values()).filter((s) => s.has(n)).length;

    const wineViewsBy = (idx: number) =>
      new Set(evs.filter((e) => e.event_type === "wine_view" && (e.step_index ?? -1) === idx).map((e) => e.session_id)).size;

    const funnel = [
      { label: "Welcome viewed", count: step("welcome_view") },
      { label: "Flight picked", count: step("flight_select") },
      { label: "Journey started", count: step("journey_start") },
      { label: "Wine 1 opened", count: wineViewsBy(0) },
      { label: "Wine 2 opened", count: wineViewsBy(1) },
      { label: "Wine 3 opened", count: wineViewsBy(2) },
      { label: "Wine 4 opened", count: wineViewsBy(3) },
      { label: "Results viewed", count: step("results_view") },
      { label: "Profile submitted", count: step("tasting_complete") },
    ];
    const top = funnel[0].count || 1;
    let dropIdx = -1, dropPct = 0;
    for (let i = 1; i < funnel.length; i++) {
      const prev = funnel[i - 1].count;
      if (!prev) continue;
      const d = 1 - funnel[i].count / prev;
      if (d > dropPct) { dropPct = d; dropIdx = i; }
    }
    const funnelRows = funnel.map((f, i) => ({
      ...f,
      pctOfTotal: Math.round((f.count / top) * 100),
      pctOfPrev: i === 0 ? 100 : Math.round((f.count / (funnel[i - 1].count || 1)) * 100),
      biggestDrop: i === dropIdx,
    }));

    // Ratings
    const rMap = new Map<string, { total: number; count: number }>();
    evs.filter((e) => e.event_type === "wine_rating" && e.rating && e.wine_name).forEach((e) => {
      const c = rMap.get(e.wine_name!) || { total: 0, count: 0 };
      c.total += e.rating!; c.count += 1;
      rMap.set(e.wine_name!, c);
    });
    const wineAverages = Array.from(rMap.entries())
      .map(([name, v]) => ({ name, avg: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg);

    // Dwell
    const dMap = new Map<string, { total: number; count: number }>();
    evs.filter((e) => e.event_type === "wine_dwell" && e.duration_ms && e.wine_name).forEach((e) => {
      const c = dMap.get(e.wine_name!) || { total: 0, count: 0 };
      c.total += e.duration_ms!; c.count += 1;
      dMap.set(e.wine_name!, c);
    });
    const wineDwellRows = Array.from(dMap.entries())
      .map(([name, v]) => ({ name, avgMs: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avgMs - a.avgMs);

    // Ritual
    const rtMap = new Map<string, { total: number; count: number }>();
    evs.filter((e) => e.event_type === "ritual_step_complete" && e.duration_ms && e.wine_name).forEach((e) => {
      const c = rtMap.get(e.wine_name!) || { total: 0, count: 0 };
      c.total += e.duration_ms!; c.count += 1;
      rtMap.set(e.wine_name!, c);
    });
    const ritualRows = Array.from(rtMap.entries())
      .map(([name, v]) => ({ name, avgMs: v.total / v.count, count: v.count }))
      .sort((a, b) => b.avgMs - a.avgMs);

    // Session length
    const spans = new Map<string, { min: number; max: number }>();
    evs.forEach((e) => {
      const t = new Date(e.created_at).getTime();
      const c = spans.get(e.session_id) || { min: t, max: t };
      c.min = Math.min(c.min, t); c.max = Math.max(c.max, t);
      spans.set(e.session_id, c);
    });
    const buckets: Record<string, number> = { "<2m": 0, "2–5m": 0, "5–10m": 0, "10m+": 0 };
    spans.forEach(({ min, max }) => {
      const mins = (max - min) / 60000;
      if (mins < 2) buckets["<2m"]++;
      else if (mins < 5) buckets["2–5m"]++;
      else if (mins < 10) buckets["5–10m"]++;
      else buckets["10m+"]++;
    });
    const sc = spans.size || 1;
    const avgMin = Array.from(spans.values()).reduce((a, b) => a + (b.max - b.min), 0) / sc / 60000;

    // Vivino
    const vMap = new Map<string, number>();
    evs.filter((e) => e.event_type === "vivino_click" && e.wine_name).forEach((e) =>
      vMap.set(e.wine_name!, (vMap.get(e.wine_name!) || 0) + 1)
    );
    const vivinoRows = Array.from(vMap.entries()).sort((a, b) => b[1] - a[1]);
    const vivinoTotal = evs.filter((e) => e.event_type === "vivino_click").length;

    // Flights
    const fMap = new Map<string, number>();
    cons.forEach((c) => c.flight_id && fMap.set(c.flight_id, (fMap.get(c.flight_id) || 0) + 1));
    const flightRows = Array.from(fMap.entries()).sort((a, b) => b[1] - a[1]);

    // Devices
    const devMap = new Map<string, number>();
    cons.forEach((c) => {
      const d = c.device_type || "unknown";
      devMap.set(d, (devMap.get(d) || 0) + 1);
    });
    const deviceRows = Array.from(devMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      funnelRows,
      wineAverages,
      wineDwellRows,
      ritualRows,
      buckets,
      avgMin,
      vivinoRows,
      vivinoTotal,
      flightRows,
      deviceRows,
      completionRate: funnelRows[2].count ? Math.round((funnelRows[8].count / funnelRows[2].count) * 100) : 0,
      journeyStarts: funnelRows[2].count,
      complete: funnelRows[8].count,
      biggestDropLabel: dropIdx >= 0 ? funnelRows[dropIdx].label : "—",
      allFlights: Array.from(new Set([...consent.map((c) => c.flight_id), ...events.map((e) => e.flight_id)].filter(Boolean))) as string[],
      allDevices: Array.from(new Set([...consent.map((c) => c.device_type || "unknown"), ...events.map((e) => detectDevice(e.metadata))])),
    };
  }, [filtered, consent, events]);

  // Grouped guest identities (dedupe repeated visits by email/phone)
  const guestGroups = useMemo(() => groupGuests(filtered.consent), [filtered.consent]);



  // ── Exports (paginated full pull) ────────────────────────────────────
  const fetchAllConsent = async (): Promise<ConsentRow[]> => {
    const startIso = rangeStartIso(range);
    const rows: ConsentRow[] = [];
    let from = 0;
    while (true) {
      let q = supabase
        .from("consent_logs")
        .select("id,guest_name,flight_id,device_type,created_at,metadata")
        .order("created_at", { ascending: false })
        .range(from, from + 499);
      if (startIso) q = q.gte("created_at", startIso);
      const { data, error } = await q;
      if (error) { toast.error(error.message); return rows; }
      if (!data?.length) break;
      rows.push(...(data as ConsentRow[]));
      if (data.length < 500) break;
      from += 500;
    }
    return rows;
  };

  // Grouped export — one row per unique guest
  const exportAllGuests = async () => {
    toast.info("Preparing guest export…");
    const rows = await fetchAllConsent();
    const groups = groupGuests(rows);
    const csv = toCsv(
      groups.map((g) => ({
        latest_visit: new Date(g.latestAt).toISOString(),
        name: g.name,
        email: g.email,
        phone: g.phone,
        visits: g.visits.length,
        flights: g.flights.join("|"),
        devices: g.devices.join("|"),
      }))
    );
    download(`sula-guests-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // Raw one-row-per-visit export
  const exportAllVisits = async () => {
    toast.info("Preparing raw visits export…");
    const rows = await fetchAllConsent();
    const csv = toCsv(
      rows.map((c) => ({
        created_at: c.created_at,
        name: c.guest_name || "",
        email: (c.metadata?.email as string) || "",
        phone: (c.metadata?.phone as string) || "",
        flight: c.flight_id || "",
        device: c.device_type || "",
      }))
    );
    download(`sula-guest-visits-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };


  const exportAllEvents = async () => {
    toast.info("Preparing full event export…");
    const startIso = rangeStartIso(range);
    const rows: TastingEventRow[] = [];
    let from = 0;
    while (true) {
      let q = supabase
        .from("tasting_events")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + 999);
      if (startIso) q = q.gte("created_at", startIso);
      const { data, error } = await q;
      if (error) return toast.error(error.message);
      if (!data?.length) break;
      rows.push(...(data as TastingEventRow[]));
      if (data.length < 1000) break;
      from += 1000;
    }
    const csv = toCsv(
      rows.map((e) => ({
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
      }))
    );
    download(`sula-tasting-events-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const deleteGuestGroup = async (g: GuestGroup) => {
    const label = g.name || g.email || g.phone || "this guest";
    if (!window.confirm(`Delete ${label} and all ${g.visits.length} visit${g.visits.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const ids = g.visits.map((v) => v.id);
    const del1 = await supabase.from("consent_logs").delete().in("id", ids);
    if (del1.error) return toast.error(del1.error.message);
    if (g.email) await supabase.from("tasting_events").delete().eq("guest_email", g.email);
    if (g.phone) await supabase.from("tasting_events").delete().eq("guest_phone", g.phone);
    toast.success(`${label} deleted`);
    void load();
  };


  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-5xl mx-auto">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Tasting Room Analytics · Admin only
              {lastUpdated && <span className="ml-2 text-[0.65rem]">· Updated {lastUpdated.toLocaleTimeString()}</span>}
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

        {isSuperAdmin && <AccessRequestsPanel />}

        {/* Sticky filter bar */}
        <div className="wine-card p-3 flex flex-wrap items-center gap-2 text-xs sticky top-2 z-10 backdrop-blur bg-background/85">
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
          <select value={flightFilter} onChange={(e) => setFlightFilter(e.target.value)} className="px-2 py-1 rounded border border-border bg-background">
            <option value="all">All flights</option>
            {stats.allFlights.map((f) => <option key={f} value={f}>Flight {f}</option>)}
          </select>
          <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className="px-2 py-1 rounded border border-border bg-background">
            <option value="all">All devices</option>
            {stats.allDevices.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="ml-auto text-muted-foreground">
            {filtered.consent.length} in view · {totals.guests} total guests
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            {/* Headline tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tile icon={Users} label="Guests" value={guestGroups.length} sub={`${filtered.consent.length} visits · ${totals.guests} total rows`} onClick={() => setDrawer({ kind: "guests" })} />
              <Tile icon={CheckCircle2} label="Completion" value={`${stats.completionRate}%`} sub={`${stats.complete}/${stats.journeyStarts} finished`} onClick={() => setDrawer({ kind: "funnel" })} />
              <Tile icon={Clock} label="Avg session" value={`${stats.avgMin.toFixed(1)}m`} sub="tap for buckets" onClick={() => setDrawer({ kind: "sessionLength" })} />
              <Tile icon={MousePointerClick} label="Vivino" value={stats.vivinoTotal} sub={stats.vivinoRows[0]?.[0] ? `top: ${stats.vivinoRows[0][0]}` : "no clicks"} onClick={() => setDrawer({ kind: "vivino" })} />
            </div>

            {/* Secondary tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Tile
                icon={BarChart3}
                label="Funnel"
                value={`${stats.funnelRows.length} steps`}
                sub={`drop: ${stats.biggestDropLabel}`}
                onClick={() => setDrawer({ kind: "funnel" })}
                accent
              />
              <Tile
                icon={Star}
                label="Ratings"
                value={stats.wineAverages[0] ? `★ ${stats.wineAverages[0].avg.toFixed(2)}` : "—"}
                sub={stats.wineAverages[0] ? `top: ${stats.wineAverages[0].name}` : "no ratings"}
                onClick={() => setDrawer({ kind: "ratings" })}
              />
              <Tile
                icon={WineIcon}
                label="Wines"
                value={stats.wineDwellRows.length}
                sub={stats.wineDwellRows[0] ? `slowest: ${stats.wineDwellRows[0].name}` : "no dwell"}
                onClick={() => setDrawer({ kind: "wines" })}
              />
              <Tile
                icon={Clock}
                label="Ritual time"
                value={stats.ritualRows[0] ? fmtMs(stats.ritualRows[0].avgMs) : "—"}
                sub={stats.ritualRows[0] ? `slowest: ${stats.ritualRows[0].name}` : "no ritual data"}
                onClick={() => setDrawer({ kind: "ritual" })}
              />
              <Tile
                icon={ListOrdered}
                label="Flights"
                value={stats.flightRows.length}
                sub={stats.flightRows[0] ? `top: Flight ${stats.flightRows[0][0]}` : "—"}
                onClick={() => setDrawer({ kind: "flights" })}
              />
              <Tile
                icon={Smartphone}
                label="Devices"
                value={stats.deviceRows[0]?.[1] ? `${Math.round((stats.deviceRows[0][1] / (filtered.consent.length || 1)) * 100)}% ${stats.deviceRows[0][0]}` : "—"}
                sub={stats.deviceRows.map((d) => `${d[0]}:${d[1]}`).join(" · ") || "—"}
                onClick={() => setDrawer({ kind: "devices" })}
              />
            </div>

            {/* Wide tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Tile
                icon={Users}
                label="Guest log"
                value={guestGroups.length}
                sub={guestGroups[0] ? `latest: ${guestGroups[0].name}${guestGroups[0].visits.length > 1 ? ` · ${guestGroups[0].visits.length} visits` : ""}` : "no guests yet"}
                onClick={() => setDrawer({ kind: "guests" })}
              />

              <Tile
                icon={Activity}
                label="Recent events"
                value={filtered.events.length}
                sub={filtered.events[0] ? `${filtered.events[0].event_type} · ${new Date(filtered.events[0].created_at).toLocaleTimeString()}` : "—"}
                onClick={() => setDrawer({ kind: "events" })}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Drawer host ─────────────────────────────────────────────── */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawer && (
            <DrawerBody
              drawer={drawer}
              stats={stats}
              filtered={filtered}
              guestGroups={guestGroups}
              events={events}
              onOpenSession={(sid) => setDrawer({ kind: "session", sessionId: sid })}
              onOpenWine={(name) => setDrawer({ kind: "wine", wineName: name })}
              onExportGuests={exportAllGuests}
              onExportVisits={exportAllVisits}
              onExportEvents={exportAllEvents}
              onDeleteGuestGroup={deleteGuestGroup}
              range={range}
            />

          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Drawer body ───────────────────────────────────────────────────────
function DrawerBody({
  drawer,
  stats,
  filtered,
  guestGroups,
  events,
  onOpenSession,
  onOpenWine,
  onExportGuests,
  onExportVisits,
  onExportEvents,
  onDeleteGuestGroup,
  range,
}: {
  drawer: DrawerKind;
  stats: ReturnType<typeof useMemo> extends infer T ? any : any;
  filtered: { events: TastingEventRow[]; consent: ConsentRow[] };
  guestGroups: GuestGroup[];
  events: TastingEventRow[];
  onOpenSession: (sid: string) => void;
  onOpenWine: (name: string) => void;
  onExportGuests: () => void;
  onExportVisits: () => void;
  onExportEvents: () => void;
  onDeleteGuestGroup: (g: GuestGroup) => void;
  range: DateRange;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const pageSize = 25;

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (drawer.kind === "guests") {
    const s = q.trim().toLowerCase();
    const groups = guestGroups.filter((g) => {
      if (!s) return true;
      if (g.name.toLowerCase().includes(s)) return true;
      if (g.email.toLowerCase().includes(s)) return true;
      if (g.phone.toLowerCase().includes(s)) return true;
      if (g.flights.some((f) => f.toLowerCase().includes(s))) return true;
      return g.visits.some((v) => (v.guest_name || "").toLowerCase().includes(s));
    });
    const visitsTotal = groups.reduce((a, g) => a + g.visits.length, 0);
    const pageGroups = groups.slice(page * pageSize, page * pageSize + pageSize);

    return (
      <>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2">
            <span>Guest log · {groups.length} guests <span className="text-muted-foreground font-normal text-xs">({visitsTotal} visits)</span></span>
            <div className="flex items-center gap-1">
              <button onClick={onExportGuests} className="btn-secondary !py-1 !px-2 text-xs flex items-center gap-1" title="One row per unique guest">
                <Download size={11} /> CSV
              </button>
              <button onClick={onExportVisits} className="btn-secondary !py-1 !px-2 text-[10px] flex items-center gap-1" title="One row per visit">
                Raw
              </button>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Search name / email / phone / flight…"
              className="w-full text-xs pl-7 pr-2 py-2 rounded border border-border bg-background"
            />
          </div>
          <ul className="space-y-1.5">
            {pageGroups.map((g) => {
              const isOpen = expanded.has(g.key);
              const first = g.visits[0];
              const related = g.email
                ? events.find((e) => e.guest_email === g.email)?.session_id
                : g.phone
                ? events.find((e) => e.guest_phone === g.phone)?.session_id
                : undefined;
              const multi = g.visits.length > 1;
              return (
                <li key={g.key} className="border border-border rounded-lg p-2.5 text-xs space-y-1">
                  <button
                    onClick={() => multi && toggleExpand(g.key)}
                    className={`w-full flex items-center justify-between gap-2 text-left ${multi ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span className="font-medium truncate flex items-center gap-1.5">
                      {multi && <ChevronRight size={11} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />}
                      {g.name || "—"}
                      {multi && <span className="text-[10px] font-normal text-wine-gold">×{g.visits.length}</span>}
                    </span>
                    <span className="text-muted-foreground text-[10px] whitespace-nowrap">{new Date(g.latestAt).toLocaleString()}</span>
                  </button>
                  <div className="text-muted-foreground truncate">{g.email || "—"} · {g.phone || "—"}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {g.visits.length} visit{multi ? "s" : ""} · Flight{g.flights.length > 1 ? "s" : ""} {g.flights.join(", ") || "—"} · {g.devices.join(", ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {!multi && related && (
                        <button onClick={() => onOpenSession(related)} className="text-wine-gold hover:underline text-[11px]">Journey</button>
                      )}
                      <button onClick={() => onDeleteGuestGroup(g)} className="text-muted-foreground hover:text-destructive" title={`Delete ${g.name}`}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  {isOpen && multi && (
                    <ul className="pt-2 mt-1 border-t border-border/50 space-y-1">
                      {g.visits.map((v) => {
                        const vRelated = events.find(
                          (e) =>
                            (v.metadata?.email && e.guest_email === v.metadata.email) ||
                            (v.metadata?.phone && e.guest_phone === v.metadata.phone),
                        )?.session_id;
                        // Prefer a session that started within a few minutes of this visit
                        const vStart = new Date(v.created_at).getTime();
                        const closerSession = events
                          .filter(
                            (e) =>
                              (v.metadata?.email && e.guest_email === v.metadata.email) ||
                              (v.metadata?.phone && e.guest_phone === v.metadata.phone),
                          )
                          .sort(
                            (a, b) =>
                              Math.abs(new Date(a.created_at).getTime() - vStart) -
                              Math.abs(new Date(b.created_at).getTime() - vStart),
                          )[0]?.session_id || vRelated;
                        return (
                          <li key={v.id} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-muted-foreground">
                              {new Date(v.created_at).toLocaleString()} · Flight {v.flight_id || "—"} · {v.device_type || "—"}
                            </span>
                            {closerSession && (
                              <button onClick={() => onOpenSession(closerSession)} className="text-wine-gold hover:underline">
                                Journey
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
            {pageGroups.length === 0 && <li className="text-xs text-muted-foreground py-6 text-center">No matching guests.</li>}
          </ul>
          {groups.length > pageSize && (
            <div className="flex items-center justify-between text-xs">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="btn-secondary !py-1 !px-2 disabled:opacity-40">Prev</button>
              <span className="text-muted-foreground">Page {page + 1} / {Math.ceil(groups.length / pageSize)}</span>
              <button disabled={(page + 1) * pageSize >= groups.length} onClick={() => setPage(page + 1)} className="btn-secondary !py-1 !px-2 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </>
    );
  }


  if (drawer.kind === "events") {
    const types = Array.from(new Set(filtered.events.map((e) => e.event_type)));
    const rows = filtered.events.filter((e) => (q ? e.event_type === q : true)).slice(0, 200);
    return (
      <>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2">
            <span>Recent events</span>
            <button onClick={onExportEvents} className="btn-secondary !py-1 !px-2 text-xs flex items-center gap-1">
              <Download size={11} /> CSV (all)
            </button>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-3">
          <select value={q} onChange={(e) => setQ(e.target.value)} className="w-full text-xs px-2 py-2 rounded border border-border bg-background">
            <option value="">All event types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ul className="space-y-1">
            {rows.map((e) => (
              <li key={e.id} className="border border-border rounded p-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-medium">{e.event_type}</span>
                  <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-muted-foreground truncate">
                  {e.guest_name || "—"} · {e.wine_name || "—"}
                  {e.rating ? ` · ★${e.rating}` : ""}
                  {e.duration_ms ? ` · ${fmtMs(e.duration_ms)}` : ""}
                </div>
                <button onClick={() => onOpenSession(e.session_id)} className="text-wine-gold hover:underline">Open session</button>
              </li>
            ))}
            {rows.length === 0 && <li className="text-xs text-muted-foreground py-6 text-center">No events.</li>}
          </ul>
        </div>
      </>
    );
  }

  if (drawer.kind === "funnel") {
    return (
      <>
        <SheetHeader><SheetTitle>Guest funnel</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-2">
          {stats.funnelRows.map((f: any) => (
            <div key={f.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={f.biggestDrop ? "text-destructive font-medium" : ""}>{f.label}</span>
                <span className="text-muted-foreground">{f.count} · {f.pctOfTotal}% · prev {f.pctOfPrev}%</span>
              </div>
              <div className="progress-track h-2">
                <div className={`h-2 rounded-full ${f.biggestDrop ? "bg-destructive/70" : "bg-wine-gold"}`} style={{ width: `${f.pctOfTotal}%` }} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "ratings") {
    return (
      <>
        <SheetHeader><SheetTitle>Ratings per wine</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-2">
          {stats.wineAverages.length === 0 && <p className="text-xs text-muted-foreground">No ratings yet.</p>}
          {stats.wineAverages.map((w: any) => (
            <div key={w.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <button onClick={() => onOpenWine(w.name)} className="text-left hover:underline">{w.name}</button>
                <span className="font-medium">{w.avg.toFixed(2)}/5 · {w.count}</span>
              </div>
              <div className="progress-track h-2"><div className="progress-fill h-2" style={{ width: `${(w.avg / 5) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "wines") {
    return (
      <>
        <SheetHeader><SheetTitle>Avg time per wine</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-2">
          {stats.wineDwellRows.map((w: any) => (
            <div key={w.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <button onClick={() => onOpenWine(w.name)} className="text-left hover:underline">{w.name}</button>
                <span className="text-muted-foreground">{fmtMs(w.avgMs)} · {w.count}</span>
              </div>
              <div className="progress-track h-1.5"><div className="progress-fill h-1.5" style={{ width: `${Math.min(100, (w.avgMs / 120000) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "ritual") {
    return (
      <>
        <SheetHeader><SheetTitle>Avg ritual step time</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-1">
          {stats.ritualRows.map((w: any) => (
            <div key={w.name} className="flex justify-between text-xs py-1 border-b border-border/40">
              <button onClick={() => onOpenWine(w.name)} className="hover:underline">{w.name}</button>
              <span className="text-muted-foreground">{fmtMs(w.avgMs)} · {w.count}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "vivino") {
    return (
      <>
        <SheetHeader><SheetTitle>Vivino clicks · {stats.vivinoTotal}</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-1">
          {stats.vivinoRows.map(([name, n]: [string, number]) => (
            <div key={name} className="flex justify-between text-xs py-1 border-b border-border/40">
              <button onClick={() => onOpenWine(name)} className="hover:underline">{name}</button>
              <span className="font-medium">{n}</span>
            </div>
          ))}
          {stats.vivinoRows.length === 0 && <p className="text-xs text-muted-foreground">No Vivino clicks.</p>}
        </div>
      </>
    );
  }

  if (drawer.kind === "sessionLength") {
    const total = Object.values(stats.buckets as Record<string, number>).reduce((a, b) => a + b, 0) || 1;
    return (
      <>
        <SheetHeader><SheetTitle>Session length · avg {stats.avgMin.toFixed(1)}m</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-2">
          {Object.entries(stats.buckets as Record<string, number>).map(([k, n]) => (
            <div key={k} className="space-y-1">
              <div className="flex justify-between text-xs"><span>{k}</span><span className="text-muted-foreground">{n} · {Math.round((n / total) * 100)}%</span></div>
              <div className="progress-track h-1.5"><div className="progress-fill h-1.5" style={{ width: `${(n / total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "flights") {
    return (
      <>
        <SheetHeader><SheetTitle>Flight popularity</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-1">
          {stats.flightRows.map(([id, n]: [string, number]) => (
            <div key={id} className="flex justify-between text-xs py-1 border-b border-border/40">
              <span>Flight {id}</span><span className="font-medium">{n}</span>
            </div>
          ))}
          {stats.flightRows.length === 0 && <p className="text-xs text-muted-foreground">No flights picked.</p>}
        </div>
      </>
    );
  }

  if (drawer.kind === "devices") {
    const total = stats.deviceRows.reduce((a: number, [, n]: [string, number]) => a + n, 0) || 1;
    return (
      <>
        <SheetHeader><SheetTitle>Devices</SheetTitle></SheetHeader>
        <div className="mt-3 space-y-2">
          {stats.deviceRows.map(([d, n]: [string, number]) => (
            <div key={d} className="space-y-1">
              <div className="flex justify-between text-xs"><span>{d}</span><span className="text-muted-foreground">{n} · {Math.round((n / total) * 100)}%</span></div>
              <div className="progress-track h-1.5"><div className="progress-fill h-1.5" style={{ width: `${(n / total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (drawer.kind === "session") {
    return <SessionDrawer sessionId={drawer.sessionId} />;
  }

  if (drawer.kind === "wine") {
    return <WineDrawer wineName={drawer.wineName} range={range} />;
  }

  return null;
}

// ─── Session drawer (on-demand fetch) ─────────────────────────────────
function SessionDrawer({ sessionId }: { sessionId: string }) {
  const [rows, setRows] = useState<TastingEventRow[] | null>(null);
  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("tasting_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) toast.error(error.message);
      setRows((data as TastingEventRow[]) || []);
    })();
  }, [sessionId]);

  if (!rows) return <p className="text-xs text-muted-foreground mt-4">Loading…</p>;
  const first = rows[0];
  const name = rows.find((r) => r.guest_name)?.guest_name || "Guest";
  const email = rows.find((r) => r.guest_email)?.guest_email || "—";
  const phone = rows.find((r) => r.guest_phone)?.guest_phone || "—";
  const flight = rows.find((r) => r.flight_id)?.flight_id || "—";
  return (
    <>
      <SheetHeader><SheetTitle>{name}'s journey</SheetTitle></SheetHeader>
      <div className="mt-3 text-xs space-y-2">
        <div className="text-muted-foreground">
          {email} · {phone} · Flight {flight}
          {first && <span> · started {new Date(first.created_at).toLocaleString()}</span>}
        </div>
        <ol className="space-y-1">
          {rows.map((r) => (
            <li key={r.id} className="border-l-2 border-wine-gold/50 pl-2 py-0.5">
              <div className="flex justify-between">
                <span className="font-medium">{r.event_type}</span>
                <span className="text-muted-foreground text-[10px]">{new Date(r.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="text-muted-foreground">
                {r.wine_name && <>Wine: {r.wine_name} </>}
                {r.rating ? `· ★${r.rating} ` : ""}
                {r.duration_ms ? `· ${fmtMs(r.duration_ms)} ` : ""}
                {r.quiz_answer?.length ? `· ${r.quiz_answer.join(", ")}` : ""}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

// ─── Wine drawer (on-demand fetch) ────────────────────────────────────
function WineDrawer({ wineName, range }: { wineName: string; range: DateRange }) {
  const [rows, setRows] = useState<TastingEventRow[] | null>(null);
  useEffect(() => {
    void (async () => {
      let q = supabase
        .from("tasting_events")
        .select("id,session_id,event_type,rating,quiz_answer,duration_ms,created_at,wine_name")
        .eq("wine_name", wineName)
        .order("created_at", { ascending: false })
        .limit(2000);
      const startIso = rangeStartIso(range);
      if (startIso) q = q.gte("created_at", startIso);
      const { data, error } = await q;
      if (error) toast.error(error.message);
      setRows((data as TastingEventRow[]) || []);
    })();
  }, [wineName, range]);

  if (!rows) return <p className="text-xs text-muted-foreground mt-4">Loading…</p>;
  const ratings = rows.filter((r) => r.event_type === "wine_rating" && r.rating);
  const dist = [1, 2, 3, 4, 5].map((s) => ({ s, n: ratings.filter((r) => r.rating === s).length }));
  const avg = ratings.length ? ratings.reduce((a, b) => a + (b.rating || 0), 0) / ratings.length : 0;
  const dwell = rows.filter((r) => r.event_type === "wine_dwell" && r.duration_ms);
  const avgDwell = dwell.length ? dwell.reduce((a, b) => a + (b.duration_ms || 0), 0) / dwell.length : 0;
  const vivino = rows.filter((r) => r.event_type === "vivino_click").length;
  const views = new Set(rows.filter((r) => r.event_type === "wine_view").map((r) => r.session_id)).size;
  const quizCounts = new Map<string, number>();
  rows.filter((r) => r.event_type === "wine_quiz" && r.quiz_answer).forEach((r) => (r.quiz_answer || []).forEach((q) => quizCounts.set(q, (quizCounts.get(q) || 0) + 1)));
  const topQuiz = Array.from(quizCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDist = Math.max(1, ...dist.map((d) => d.n));

  return (
    <>
      <SheetHeader><SheetTitle>{wineName}</SheetTitle></SheetHeader>
      <div className="mt-3 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="wine-card p-2"><div className="text-muted-foreground text-[10px]">Avg rating</div><div className="font-heading text-lg">{avg.toFixed(2)}/5</div></div>
          <div className="wine-card p-2"><div className="text-muted-foreground text-[10px]">Views</div><div className="font-heading text-lg">{views}</div></div>
          <div className="wine-card p-2"><div className="text-muted-foreground text-[10px]">Avg dwell</div><div className="font-heading text-lg">{fmtMs(avgDwell)}</div></div>
          <div className="wine-card p-2"><div className="text-muted-foreground text-[10px]">Vivino clicks</div><div className="font-heading text-lg">{vivino}</div></div>
        </div>
        <div>
          <p className="text-[11px] font-medium mb-1">Rating distribution</p>
          {dist.map((d) => (
            <div key={d.s} className="flex items-center gap-2 mb-0.5">
              <span className="w-6">★{d.s}</span>
              <div className="flex-1 progress-track h-1.5"><div className="progress-fill h-1.5" style={{ width: `${(d.n / maxDist) * 100}%` }} /></div>
              <span className="w-6 text-right text-muted-foreground">{d.n}</span>
            </div>
          ))}
        </div>
        {topQuiz.length > 0 && (
          <div>
            <p className="text-[11px] font-medium mb-1">Top quiz answers</p>
            <ul className="space-y-0.5">
              {topQuiz.map(([a, n]) => (
                <li key={a} className="flex justify-between border-b border-border/40 py-0.5"><span>{a}</span><span className="text-muted-foreground">{n}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
