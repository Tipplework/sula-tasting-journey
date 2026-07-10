import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ConsentRow {
  id: string;
  guest_name: string | null;
  flight_id: string | null;
  consent_version: string;
  privacy_version: string;
  device_type: string | null;
  browser_language: string | null;
  session_id: string | null;
  hashed_ip: string | null;
  source: string;
  created_at: string;
}

interface DeletionRow {
  id: string;
  guest_name: string | null;
  contact: string | null;
  request_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface NoticeRow {
  id: string;
  version: string;
  sections: unknown;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function toCsv(rows: ConsentRow[]): string {
  const headers = [
    "id","created_at","guest_name","flight_id","consent_version","privacy_version",
    "device_type","browser_language","session_id","hashed_ip","source",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const body = rows.map((r) =>
    headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(","),
  );
  return [headers.join(","), ...body].join("\n");
}

export default function PrivacyCenter() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"consent" | "deletion" | "notice">("consent");

  // Consent
  const [consent, setConsent] = useState<ConsentRow[]>([]);
  const [consentLoading, setConsentLoading] = useState(false);
  const [q, setQ] = useState("");
  const [flightFilter, setFlightFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");

  // Deletion
  const [dels, setDels] = useState<DeletionRow[]>([]);
  const [delLoading, setDelLoading] = useState(false);

  // Notice
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [draftVersion, setDraftVersion] = useState("");
  const [draftSections, setDraftSections] = useState("");

  async function loadConsent() {
    setConsentLoading(true);
    let query = supabase.from("consent_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (flightFilter) query = query.eq("flight_id", flightFilter);
    if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
    const { data, error } = await query;
    if (error) toast.error(error.message);
    setConsent((data as ConsentRow[]) || []);
    setConsentLoading(false);
  }

  async function loadDeletions() {
    setDelLoading(true);
    const { data, error } = await supabase
      .from("deletion_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setDels((data as DeletionRow[]) || []);
    setDelLoading(false);
  }

  async function loadNotices() {
    setNoticeLoading(true);
    const { data, error } = await supabase
      .from("privacy_notice_versions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setNotices((data as NoticeRow[]) || []);
    setNoticeLoading(false);
  }

  useEffect(() => {
    if (tab === "consent") loadConsent();
    if (tab === "deletion") loadDeletions();
    if (tab === "notice") loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredConsent = useMemo(() => {
    if (!q.trim()) return consent;
    const needle = q.trim().toLowerCase();
    return consent.filter(
      (r) =>
        (r.guest_name || "").toLowerCase().includes(needle) ||
        (r.session_id || "").toLowerCase().includes(needle) ||
        (r.flight_id || "").toLowerCase().includes(needle),
    );
  }, [consent, q]);

  function downloadCsv() {
    const csv = toCsv(filteredConsent);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sula-consent-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function updateDeletion(id: string, status: string) {
    const patch: Record<string, unknown> = { status };
    if (status === "completed") patch.processed_at = new Date().toISOString();
    const { error } = await supabase.from("deletion_requests").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    loadDeletions();
  }

  async function saveNotice() {
    if (!draftVersion.trim()) return toast.error("Version required (e.g. 1.1.0)");
    let sections: unknown = {};
    try {
      sections = draftSections.trim() ? JSON.parse(draftSections) : {};
    } catch {
      return toast.error("Sections must be valid JSON");
    }
    const { error } = await supabase.from("privacy_notice_versions").insert({
      version: draftVersion.trim(),
      sections,
      active: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Draft saved");
    setDraftVersion("");
    setDraftSections("");
    loadNotices();
  }

  async function activateNotice(row: NoticeRow) {
    await supabase.from("privacy_notice_versions").update({ active: false }).neq("id", row.id);
    const { error } = await supabase.from("privacy_notice_versions").update({ active: true }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`v${row.version} is now active`);
    loadNotices();
  }

  async function signOut() {
    await supabase.auth.signOut();
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-tight">Privacy &amp; Compliance</h1>
            <p className="text-xs text-muted-foreground mt-1">DPDP consent logs, deletion requests and privacy notice versions.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/content-center"><Button size="sm" variant="outline" className="h-9">Library</Button></Link>
            <Link to="/content-center/wines"><Button size="sm" variant="outline" className="h-9">Wines &amp; Flights</Button></Link>
            <Button size="sm" variant="ghost" className="h-9" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex gap-2 border-b overflow-x-auto">
          {(["consent", "deletion", "notice"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "consent" ? "Consent logs" : t === "deletion" ? "Deletion requests" : "Privacy notice"}
            </button>
          ))}
        </div>

        {tab === "consent" && (
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground">Search (name / session / flight)</label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Rohan or A" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Flight</label>
                <select
                  value={flightFilter}
                  onChange={(e) => setFlightFilter(e.target.value)}
                  className="block h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">All</option>
                  {["A", "B", "C", "D"].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
              </div>
              <Button onClick={loadConsent} variant="outline" className="h-10">Apply</Button>
              <Button onClick={downloadCsv} className="h-10">Export CSV</Button>
            </div>

            {consentLoading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : filteredConsent.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center border rounded-md">No consent records match.</div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">When</th>
                      <th className="text-left px-3 py-2">Guest</th>
                      <th className="text-left px-3 py-2">Flight</th>
                      <th className="text-left px-3 py-2">Versions</th>
                      <th className="text-left px-3 py-2">Device</th>
                      <th className="text-left px-3 py-2">IP hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsent.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2">{r.guest_name || <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-2">{r.flight_id || "—"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">c{r.consent_version} · p{r.privacy_version}</td>
                        <td className="px-3 py-2 text-xs">{r.device_type || "—"} · {r.browser_language || "—"}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {r.hashed_ip ? r.hashed_ip.slice(0, 12) + "…" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2 text-xs text-muted-foreground border-t">{filteredConsent.length} records</div>
              </div>
            )}
          </section>
        )}

        {tab === "deletion" && (
          <section className="space-y-4">
            {delLoading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : dels.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center border rounded-md">No deletion requests.</div>
            ) : (
              <div className="border rounded-md divide-y">
                {dels.map((r) => (
                  <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.guest_name || "Anonymous"}</span>
                        <Badge variant={r.status === "completed" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                          {r.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{r.request_type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.contact || "no contact"} · submitted {new Date(r.created_at).toLocaleString()}
                        {r.processed_at && <> · processed {new Date(r.processed_at).toLocaleString()}</>}
                      </div>
                      {r.notes && <div className="text-sm mt-2 text-foreground/80">{r.notes}</div>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {r.status !== "completed" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateDeletion(r.id, "in_progress")}>Start</Button>
                          <Button size="sm" onClick={() => updateDeletion(r.id, "completed")}>Complete</Button>
                          <Button size="sm" variant="ghost" onClick={() => updateDeletion(r.id, "rejected")}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "notice" && (
          <section className="space-y-6">
            <div className="border rounded-md p-4 space-y-3">
              <h2 className="font-medium">New draft</h2>
              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div>
                  <label className="text-xs text-muted-foreground">Version</label>
                  <Input value={draftVersion} onChange={(e) => setDraftVersion(e.target.value)} placeholder="1.1.0" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sections (JSON)</label>
                  <Textarea
                    value={draftSections}
                    onChange={(e) => setDraftSections(e.target.value)}
                    placeholder='{"about":"...","purpose":"..."}'
                    rows={5}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveNotice}>Save draft</Button>
              </div>
            </div>

            {noticeLoading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : notices.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center border rounded-md">No notice versions yet.</div>
            ) : (
              <div className="border rounded-md divide-y">
                {notices.map((n) => (
                  <div key={n.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{n.version}</span>
                        {n.active && <Badge>Active</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        created {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!n.active && (
                      <Button size="sm" variant="outline" onClick={() => activateNotice(n)}>Activate</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
