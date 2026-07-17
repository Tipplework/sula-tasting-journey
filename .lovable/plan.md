
# Smarter Admin Dashboard — Data & Storage Lean, Click‑to‑Open

Today the dashboard pulls **10,000 tasting_events + 5,000 consent rows** on every mount and every 30s auto‑refresh, then renders every guest, every rating, every Vivino click as a long stacked list. This burns Cloud egress and makes the page a wall of text. We'll compress each section into a small **summary tile** and open the full detail only when the admin taps it.

## Goals
- Fetch less, render less, but let admin drill into anything in one click.
- Same data, same tables — only the read pattern and UI change.
- No schema migration required.

## 1. Data‑smart fetching

**Two‑tier load:**
- **Overview load** (on mount + auto‑refresh): pull only what the top summary needs.
  - `consent_logs`: `select id, guest_name, flight_id, device_type, created_at, metadata` with `.limit(200)` (latest 200 guests power the tile + preview list).
  - `tasting_events`: only the columns each aggregate needs, `.limit(2000)` **within the active date range** (`gte('created_at', rangeStart)`), ordered desc.
  - `count: 'exact', head: true` queries for totals (guests, events, completions, vivino) so the stat cards stay accurate even when we cap the row fetch.
- **Detail load** (only when admin opens a drawer): fetch the full slice on demand.
  - Guest drawer → `tasting_events` filtered by that `session_id` (or email/phone).
  - Wine drawer → `tasting_events` filtered by `wine_name` within the current range.
  - "See all guests" / "See all events" drawers → paginated fetch (50 per page, `range(offset, offset+49)`).

**Auto‑refresh:** keep the realtime channel, but on each ping just re‑run the lightweight overview query, not the full 10k pull. Debounce bursts (max 1 refetch / 5s).

**Range filter drives the query, not just the client filter.** Switching `today / 7d / 30d / all` re‑issues the query with a `gte` so we never ship 30 days of rows just to render "today".

## 2. Storage‑smart writes

Small, non‑breaking tightening in `src/lib/tasting-events.ts` and callers:
- Drop no‑signal events: skip `wine_dwell` under 500 ms and `wine_view` duplicates within the same session+wine+2s window (dedupe in memory before insert).
- Trim `metadata` to the keys the dashboard actually reads (`device`) — no giant blobs.
- Coalesce `ritual_step_complete` bursts (only send once per step per wine per session).

Net effect: fewer rows written per guest, same insights.

## 3. Smarter UI — compact tiles, click to open

Replace today's long stacked cards with a **grid of summary tiles**. Each tile shows the headline number + a tiny sparkline/mini‑bar, and opens a right‑side drawer with the full breakdown on click.

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Guests  248  │ Completion   │ Avg session  │ Vivino  63   │
│ ▲12%         │ 71% ▲4%      │ 6.2m         │ ▲9%          │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌───────────────────────┬───────────────────────┐
│ Funnel  9 steps       │ Wines  12  ★4.3 avg   │  ← click → wines drawer
│ biggest drop: Wine 3  │ top: Rasa Cab Sav     │
├───────────────────────┼───────────────────────┤
│ Guest log  248        │ Flights  3            │
│ latest: Aanya · 2m    │ top: Sula Signature   │
├───────────────────────┼───────────────────────┤
│ Session length        │ Devices               │
│ median 5.4m           │ 71% mobile            │
└───────────────────────┴───────────────────────┘
```

**Drawers (open on tile / row click):**
- **Guest log drawer** — searchable table (name / email / phone / flight / device), paginated 50/page, per‑row "View journey" opens the existing session drawer, per‑row delete stays.
- **Session journey drawer** (existing) — kept, but data fetched on demand instead of filtered client‑side from the 10k array.
- **Wine drawer** (existing) — kept, refetched per open with just that wine's rows.
- **Funnel drawer** — full step list with drop‑off %, currently rendered inline; collapsed to a tile that shows top‑line + biggest drop.
- **Ratings drawer**, **Vivino drawer**, **Ritual‑time drawer**, **Session‑length drawer**, **Flight popularity drawer** — same pattern.
- **Recent events drawer** — replaces the always‑visible 50‑row table; paginated, filterable by `event_type`.

**Sticky filter bar** (range · flight · device · search) stays at top; filters apply to both tiles and drawers, and reissue the overview query.

Exports (`CSV guests`, `CSV events`) move into their respective drawers and, for full exports, stream via paginated fetches so we don't need 10k rows in memory just to download.

## 4. Files touched
- `src/pages/AdminDashboard.tsx` — rebuild as tile grid + drawer host; overview query only.
- `src/components/admin/` — new small components: `StatTile.tsx`, `GuestLogDrawer.tsx`, `WineDrawer.tsx` (extract existing), `FunnelDrawer.tsx`, `EventsDrawer.tsx`, `SessionDrawer.tsx` (extract existing), shared `DrawerShell.tsx` using the existing `ui/sheet`.
- `src/lib/tasting-events.ts` — dedupe / min‑duration guards, metadata trim.
- Any caller emitting `wine_dwell` / `ritual_step_complete` — respect the new guards (no behavior change beyond fewer inserts).

## 5. Out of scope
- No DB schema changes, no new tables, no RLS changes.
- No change to what admin data is captured — only to how it's fetched and displayed.
- No change to public guest flow UI.

## Success check
- Initial dashboard payload drops from ~15k rows to ≤2.2k rows for the default 7‑day view.
- Every "point" (guests, ratings, vivino, funnel, ritual time, session length, flights, events) is one compact tile that opens a drawer with the full detail and export.
- Auto‑refresh no longer refetches full history.
