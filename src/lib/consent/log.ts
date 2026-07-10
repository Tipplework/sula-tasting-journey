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
 * Records a DPDP-aligned consent event.
 * Never puts guest name in URLs or analytics; guest name is only sent
 * through the RLS-protected insert to `consent_logs`.
 */
export async function logConsent(input: LogConsentInput): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await supabase.from("consent_logs").insert({
      guest_name: input.guestName || null,
      flight_id: input.flightId,
      consent_version: input.consentVersion,
      privacy_version: input.privacyVersion,
      browser_language: navigator.language || null,
      device_type: deviceType(),
      session_id: sessionId(),
      user_agent: navigator.userAgent || null,
      hashed_ip: null, // captured server-side by future edge function
      source: "web",
      metadata: {},
    });
  } catch {
    // Never block the guest journey on logging failure
  }
}
