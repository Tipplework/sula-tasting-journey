// Server-side proxy to Google Apps Script webhook.
// Validates payload shape and enforces per-IP rate limiting so the raw
// webhook URL is never shipped to the browser.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  wine?: string;
  feeling?: string;
  rating?: number | string;
  step?: string | number;
  eventType?: string;
  ts?: string;
}

const MAX_STR = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max = MAX_STR): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  return s.slice(0, max);
}

function validate(raw: unknown): Payload | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "invalid_body" };
  const o = raw as Record<string, unknown>;
  const out: Payload = {
    name: clean(o.name, 120),
    email: clean(o.email, 200),
    phone: clean(o.phone, 20),
    city: clean(o.city, 80),
    wine: clean(o.wine, 120),
    feeling: clean(o.feeling, 60),
    rating: clean(o.rating, 40),
    step: clean(o.step, 40),
    eventType: clean(o.eventType, 40),
    ts: clean(o.ts, 40),
  };
  if (out.email && !EMAIL_RE.test(out.email)) return { error: "invalid_email" };
  if (out.phone && !/^[0-9+\-\s()]{6,20}$/.test(out.phone)) return { error: "invalid_phone" };
  return out;
}

// Simple in-memory per-IP rate limit (best-effort; resets on cold start).
const bucket = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 30;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = validate(raw);
  if ("error" in parsed) {
    return new Response(JSON.stringify(parsed), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SHEETS_WEBHOOK_URL");
  if (!url) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed, ts: parsed.ts || new Date().toISOString() }),
    });
  } catch (e) {
    console.error("sheets forward failed", e);
    return new Response(JSON.stringify({ error: "forward_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
