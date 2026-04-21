// Silent, non-blocking data capture to Google Sheets.
// Failures are queued in localStorage and retried on next call.

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbybryQtmhHaX9W08ZCnIUC9uLCoXWpb8FDHzwRIp6rRCH3lhoiCoNFdO2KNAq1CaBB0/exec";

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
  event?: string;
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
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });
    // no-cors → opaque response; assume delivered
    return true;
  } catch {
    return false;
  }
}

/** Fire-and-forget. Never blocks UI, never throws. */
export function logToSheets(payload: SheetsPayload) {
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
