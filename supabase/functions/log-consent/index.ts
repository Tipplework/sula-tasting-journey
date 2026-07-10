// DPDP-aligned consent logger: server-side IP hashing, then insert via service role.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ConsentBody {
  guestName?: string | null;
  flightId?: string | null;
  consentVersion: string;
  privacyVersion: string;
  browserLanguage?: string | null;
  deviceType?: string | null;
  sessionId?: string | null;
  userAgent?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
}

function isValid(b: unknown): b is ConsentBody {
  if (!b || typeof b !== "object") return false;
  const o = b as Record<string, unknown>;
  return typeof o.consentVersion === "string" && typeof o.privacyVersion === "string";
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!isValid(body)) {
    return new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
  const salt = Deno.env.get("SUPABASE_URL") || "sula-consent-salt";
  const hashed = await hashIp(ip, salt);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("consent_logs").insert({
    guest_name: body.guestName || null,
    flight_id: body.flightId ?? null,
    consent_version: body.consentVersion,
    privacy_version: body.privacyVersion,
    browser_language: body.browserLanguage ?? null,
    device_type: body.deviceType ?? null,
    session_id: body.sessionId ?? null,
    user_agent: body.userAgent ?? null,
    hashed_ip: hashed,
    source: body.source || "web",
    metadata: body.metadata || {},
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
