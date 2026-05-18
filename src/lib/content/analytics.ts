import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  try {
    let id = localStorage.getItem("sula_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sula_session_id", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export async function track(event: {
  contentItemId?: string | null;
  eventType: "view" | "page_view" | "complete" | "share" | "fullscreen" | "cta_click";
  pageIndex?: number;
  pageSlug?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from("content_analytics").insert({
      content_item_id: event.contentItemId ?? null,
      event_type: event.eventType,
      page_index: event.pageIndex ?? null,
      page_slug: event.pageSlug ?? null,
      session_id: getSessionId(),
      user_agent: navigator.userAgent.slice(0, 255),
      referrer: document.referrer.slice(0, 255) || null,
      metadata: (event.metadata ?? null) as any,
    });
  } catch {
    // silent
  }
}
