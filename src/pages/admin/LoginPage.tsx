import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/content-center";
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) nav(redirectTo, { replace: true });
  }, [loading, user, isAdmin, nav, redirectTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?auth_action=recovery`,
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password reset email sent. Check your inbox.");
      setMode("in");
      return;
    }
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + redirectTo },
          });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(mode === "in" ? "Signed in" : "Account created");
  }

  const signedInNoAccess = !loading && user && !isAdmin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-light mb-6 tracking-tight">Sula Library Admin</h1>

        {signedInNoAccess ? (
          <div className="space-y-4 text-sm">
            <p>You are signed in but do not have admin access.</p>
            <p className="text-muted-foreground text-xs break-all">{user?.email}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => { await supabase.auth.signOut(); }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "in" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Working…"
                : mode === "in"
                ? "Sign in"
                : mode === "up"
                ? "Create account"
                : "Send reset email"}
            </Button>
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => setMode("in")}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === "in" ? "up" : "in")}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {mode === "in" ? "First time? Create your admin account" : "Already have an account? Sign in"}
              </button>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
