// Silent, non-blocking data capture to Google Sheets via a server-side proxy.
// The raw webhook URL is never exposed to the browser; the `log-sheets`
// edge function validates and rate-limits input before forwarding.
// Failures are queued in localStorage and retried on next call.
import { supabase } from "@/integrations/supabase/client";

const QUEUE_KEY = "sula_sheets_queue_v1";

export interface SheetsPayload {
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

function readQueue(): SheetsPayload[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SheetsPayload[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: SheetsPayload[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-50)));
  } catch {
    /* ignore */
  }
}

async function send(payload: SheetsPayload): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("log-sheets", { body: payload });
    return !error;
  } catch {
    return false;
  }
}


/** Reads analytics consent from persisted tasting-store cookies. Default: denied. */
function analyticsAllowed(): boolean {
  try {
    const raw = localStorage.getItem("sulaTastingSession/v2");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.cookies?.analytics);
  } catch {
    return false;
  }
}

/** Fire-and-forget. Never blocks UI, never throws. Gated on analytics consent (DPDP). */
export function logToSheets(payload: SheetsPayload) {
  if (!analyticsAllowed()) return;

  const enriched: SheetsPayload = {
    ts: new Date().toISOString(),
    ...payload,
  };

  // Try to flush queued items first (silent retry)
  const queued = readQueue();
  if (queued.length > 0) {
    const remaining: SheetsPayload[] = [];
    Promise.all(
      queued.map(async (item) => {
        const ok = await send(item);
        if (!ok) remaining.push(item);
      })
    ).then(() => writeQueue(remaining));
  }

  // Send current event
  send(enriched).then((ok) => {
    if (!ok) {
      const q = readQueue();
      q.push(enriched);
      writeQueue(q);
    }
  });
}
