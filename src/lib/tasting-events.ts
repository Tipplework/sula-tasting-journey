// Fire-and-forget logging of guest tasting behaviour to the `tasting_events`
// table so the admin dashboard can show real analytics. Never blocks the UI.
import { supabase } from "@/integrations/supabase/client";

export type TastingEventType =
  | "journey_start"
  | "wine_view"
  | "wine_rating"
  | "wine_quiz"
  | "vivino_click"
  | "next_pour_click"
  | "tasting_complete";

export interface TastingEventInput {
  eventType: TastingEventType;
  sessionId: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  flightId?: string | null;
  wineId?: number | null;
  wineName?: string | null;
  rating?: number | null;
  quizAnswer?: string[] | null;
  personality?: string | null;
  metadata?: Record<string, unknown> | null;
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

export function logTastingEvent(input: Omit<TastingEventInput, "sessionId"> & { sessionId?: string }): void {
  try {
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
      metadata: (input.metadata ?? null) as never,
    };
    // Fire-and-forget; swallow all errors so the guest journey never breaks.
    void supabase.from("tasting_events").insert(row as never).then(() => undefined, () => undefined);
  } catch {
    /* ignore */
  }
}
