// Fire-and-forget logging of guest tasting behaviour to the `tasting_events`
// table so the admin dashboard can show real analytics. Never blocks the UI.
import { supabase } from "@/integrations/supabase/client";

export type TastingEventType =
  | "welcome_view"
  | "flight_select"
  | "journey_start"
  | "wine_view"
  | "wine_dwell"
  | "wine_rating"
  | "wine_quiz"
  | "ritual_step_complete"
  | "vivino_click"
  | "next_pour_click"
  | "results_view"
  | "results_dwell"
  | "tasting_complete";

export interface TastingEventInput {
  eventType: TastingEventType;
  sessionId?: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  flightId?: string | null;
  wineId?: number | null;
  wineName?: string | null;
  rating?: number | null;
  quizAnswer?: string[] | null;
  personality?: string | null;
  durationMs?: number | null;
  stepIndex?: number | null;
  metadata?: Record<string, unknown> | null;
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem("sula_tasting_session_id");
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string | undefined) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("sula_tasting_session_id", id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export function tastingSessionId(): string {
  return getSessionId();
}

export function logTastingEvent(input: TastingEventInput): void {
  try {
    const meta = { ...(input.metadata || {}), device: detectDevice() };
    const row = {
      session_id: input.sessionId || getSessionId(),
      guest_name: input.guestName ?? null,
      guest_email: input.guestEmail ?? null,
      guest_phone: input.guestPhone ?? null,
      flight_id: input.flightId ?? null,
      wine_id: input.wineId ?? null,
      wine_name: input.wineName ?? null,
      event_type: input.eventType,
      rating: typeof input.rating === "number" ? input.rating : null,
      quiz_answer: input.quizAnswer ?? null,
      personality: input.personality ?? null,
      duration_ms: typeof input.durationMs === "number" ? Math.max(0, Math.round(input.durationMs)) : null,
      step_index: typeof input.stepIndex === "number" ? input.stepIndex : null,
      metadata: meta as never,
    };
    void supabase.from("tasting_events").insert(row as never).then(() => undefined, () => undefined);
  } catch {
    /* ignore */
  }
}
