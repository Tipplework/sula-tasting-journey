import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<"pending" | "denied" | "unknown">("unknown");

  useEffect(() => {
    if (!user || isAdmin) return;
    supabase
      .from("access_requests")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.status === "denied") setStatus("denied");
        else setStatus("pending");
      });
  }, [user, isAdmin]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) {
    const target = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }
  if (!isAdmin) {
    const denied = status === "denied";
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="wine-card max-w-md w-full p-8 space-y-4 text-center">
          <h1 className="font-heading text-2xl font-bold">
            {denied ? "Access denied" : "Awaiting approval"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {denied
              ? "Your request to access the admin dashboard was declined. Please contact your super admin."
              : "Your account has been created and is pending super admin approval. You will be able to access the dashboard once approved."}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-secondary !py-2 !px-4 text-xs"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
