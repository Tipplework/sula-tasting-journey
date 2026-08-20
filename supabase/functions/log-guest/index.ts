// Server-side writer for guest PII (menu lead capture + tasting events that
// carry name/email/phone). Validates and rate-limits before inserting with the
// service role, so the browser never writes PII directly to the database.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^\+91[6-9][0-9]{9}$/;

function str(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
}

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

// Best-effort per-IP rate limit (resets on cold start).
const bucket = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 60;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = bucket.get(ip);
  if (!b || b.reset < now) {
    bucket.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_REQ;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  if (rateLimited(ip)) return json({ error: "rate_limited" }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!raw || typeof raw !== "object") return json({ error: "invalid_body" }, 400);
  const o = raw as Record<string, unknown>;
  const kind = str(o.kind, 40);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (kind === "registration") {
    const fullName = str(o.fullName, 80);
    const mobile = str(o.mobile, 20);
    if (!fullName || fullName.length < 2) return json({ error: "invalid_name" }, 400);
    if (!mobile || !MOBILE_RE.test(mobile)) return json({ error: "invalid_mobile" }, 400);
    const birthDay = num(o.birthDay);
    const birthMonth = num(o.birthMonth);
    if (birthDay !== null && (birthDay < 1 || birthDay > 31)) return json({ error: "invalid_birth_day" }, 400);
    if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) return json({ error: "invalid_birth_month" }, 400);

    const { error } = await supabase.from("menu_guest_registrations").insert({
      full_name: fullName,
      mobile,
      birth_day: birthDay,
      birth_month: birthMonth,
      marketing_consent: o.marketingConsent === true,
      venue_slug: str(o.venueSlug, 60) || "tasting-room",
      source: str(o.source, 60) || "qr_digital_menu",
      utm_source: str(o.utmSource, 120),
      utm_medium: str(o.utmMedium, 120),
      utm_campaign: str(o.utmCampaign, 120),
      session_id: str(o.sessionId, 128),
    });
    if (error) {
      console.error("registration insert failed", error.message);
      return json({ error: "insert_failed" }, 500);
    }
    return json({ ok: true });
  }

  if (kind === "tasting_event") {
    const sessionId = str(o.sessionId, 128);
    const eventType = str(o.eventType, 64);
    if (!sessionId || sessionId.length < 8) return json({ error: "invalid_session" }, 400);
    if (!eventType) return json({ error: "invalid_event_type" }, 400);
    const email = str(o.guestEmail, 200);
    if (email && !EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);
    const phone = str(o.guestPhone, 20);
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) return json({ error: "invalid_phone" }, 400);

    const rating = num(o.rating);
    const quiz = Array.isArray(o.quizAnswer)
      ? (o.quizAnswer as unknown[]).slice(0, 10).map((q) => String(q).slice(0, 120))
      : null;
    const meta =
      o.metadata && typeof o.metadata === "object" ? (o.metadata as Record<string, unknown>) : {};

    const { error } = await supabase.from("tasting_events").insert({
      session_id: sessionId,
      event_type: eventType,
      guest_name: str(o.guestName, 120),
      guest_email: email,
      guest_phone: phone,
      flight_id: str(o.flightId, 40),
      wine_id: num(o.wineId),
      wine_name: str(o.wineName, 120),
      rating: rating !== null ? Math.max(1, Math.min(5, Math.round(rating))) : null,
      quiz_answer: quiz,
      personality: str(o.personality, 80),
      duration_ms: num(o.durationMs) !== null ? Math.max(0, Math.round(num(o.durationMs)!)) : null,
      step_index: num(o.stepIndex),
      metadata: meta,
    });
    if (error) {
      console.error("tasting event insert failed", error.message);
      return json({ error: "insert_failed" }, 500);
    }
    return json({ ok: true });
  }

  return json({ error: "invalid_kind" }, 400);
});
