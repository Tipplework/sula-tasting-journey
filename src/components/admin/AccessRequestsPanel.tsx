import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, UserCheck, UserX, Trash2 } from "lucide-react";

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  decided_at: string | null;
}

export default function AccessRequestsPanel() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("id, user_id, email, status, requested_at, decided_at")
      .order("status", { ascending: true })
      .order("requested_at", { ascending: false });
    if (error) toast.error(error.message);
    setRequests((data as AccessRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (req: AccessRequest) => {
    setBusy(req.id);
    const { data: userRes } = await supabase.auth.getUser();
    const decidedBy = userRes.user?.id ?? null;
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: req.user_id, role: "admin" });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      toast.error(roleErr.message);
      setBusy(null);
      return;
    }
    const { error } = await supabase
      .from("access_requests")
      .update({ status: "approved", decided_at: new Date().toISOString(), decided_by: decidedBy })
      .eq("id", req.id);
    if (error) toast.error(error.message);
    else toast.success(`${req.email} approved`);
    setBusy(null);
    void load();
  };

  const deny = async (req: AccessRequest) => {
    setBusy(req.id);
    const { data: userRes } = await supabase.auth.getUser();
    const decidedBy = userRes.user?.id ?? null;
    // Revoke admin role if previously granted
    await supabase.from("user_roles").delete().eq("user_id", req.user_id).eq("role", "admin");
    const { error } = await supabase
      .from("access_requests")
      .update({ status: "denied", decided_at: new Date().toISOString(), decided_by: decidedBy })
      .eq("id", req.id);
    if (error) toast.error(error.message);
    else toast.success(`${req.email} denied`);
    setBusy(null);
    void load();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  return (
    <section className="wine-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-wine-gold" />
        <h2 className="font-heading text-lg font-semibold">Access Requests</h2>
        {pending.length > 0 && (
          <span className="ml-1 text-[0.65rem] font-medium bg-wine-gold text-foreground px-2 py-0.5 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(r.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => approve(r)}
                      disabled={busy === r.id}
                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                      <UserCheck size={12} /> Approve
                    </button>
                    <button
                      onClick={() => deny(r)}
                      disabled={busy === r.id}
                      className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                      <UserX size={12} /> Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {decided.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground text-xs">
                Show decided ({decided.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {decided.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-1.5 px-2 text-xs">
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          r.status === "approved" ? "bg-emerald-500" : "bg-destructive"
                        }`}
                      />
                      <span className="truncate">{r.email}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                      <span>{r.status}</span>
                      {r.status === "approved" && (
                        <button
                          onClick={() => deny(r)}
                          disabled={busy === r.id}
                          className="text-destructive hover:underline flex items-center gap-1"
                          title="Revoke access"
                        >
                          <Trash2 size={11} /> Revoke
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
