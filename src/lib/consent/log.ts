import { supabase } from "@/integrations/supabase/client";

export interface LogConsentInput {
  guestName: string;
  flightId: string | null;
  consentVersion: string;
  privacyVersion: string;
}

function deviceType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function sessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "sulaConsentSessionId";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid =
      (crypto?.randomUUID?.() as string | undefined) ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

/**
 * Records a DPDP-aligned consent event via the `log-consent` edge function,
 * which hashes the caller IP server-side before insert. Falls back to a
 * direct client insert (no hashed_ip) if the function is unavailable.
 */
export async function logConsent(input: LogConsentInput): Promise<void> {
  if (typeof window === "undefined") return;
  const payload = {
    guestName: input.guestName || null,
    flightId: input.flightId,
    consentVersion: input.consentVersion,
    privacyVersion: input.privacyVersion,
    browserLanguage: navigator.language || null,
    deviceType: deviceType(),
    sessionId: sessionId(),
    userAgent: navigator.userAgent || null,
    source: "web",
    metadata: {},
  };

  try {
    const { error } = await supabase.functions.invoke("log-consent", { body: payload });
    if (!error) return;
  } catch {
    /* fall through to direct insert */
  }

  try {
    await supabase.from("consent_logs").insert({
      guest_name: payload.guestName,
      flight_id: payload.flightId,
      consent_version: payload.consentVersion,
      privacy_version: payload.privacyVersion,
      browser_language: payload.browserLanguage,
      device_type: payload.deviceType,
      session_id: payload.sessionId,
      user_agent: payload.userAgent,
      hashed_ip: null,
      source: payload.source,
      metadata: payload.metadata,
    });
  } catch {
    // Never block the guest journey on logging failure
  }
}
