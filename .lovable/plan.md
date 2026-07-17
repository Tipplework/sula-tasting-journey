# Go-Live Data Reset + Analytics Visibility

## Current situation (what I found)

**In the backend database today:**
- `consent_logs` — 84 rows. Stores guest name, email, phone, flight chosen, device, timestamp. This is the only place guest identity currently lives.
- `content_analytics` — 722 rows. Tracks Content Library page views, shares, CTA clicks (not wine tasting behaviour).
- `deletion_requests` — 0 rows.

**Tasting behaviour (ratings, quiz answers, favourite wine, personality, "next pour" clicks) is NOT in the database.** It is only:
- Kept in the guest's browser (`localStorage`), and
- Silently pushed to your Google Sheet via the `log-sheets` edge function.

**Vivino link clicks are currently NOT tracked at all** — the button just opens Vivino in a new tab.

**Admin Dashboard at `/admin`** shows mock/hardcoded numbers, not real data.

---

## Part 1 — Wipe pre-launch data

Run a one-time cleanup that empties:
- `consent_logs` (all 84 test rows)
- `content_analytics` (all 722 test rows)
- `deletion_requests` (already empty, included for safety)

The Google Sheet itself is outside the app — you'll need to clear old rows in Sheets manually (I'll tell you exactly which tab/range).

Wines, flights, homepage content, privacy versions, admin users — untouched.

## Part 2 — Make guest data actually visible in the admin

Two changes so every future tasting is captured in the DB and viewable in the admin panel:

### 2a. Track the missing events
- Add a `vivino_click` event whenever a guest taps the Vivino button on a wine card.
- Add a `tasting_response` write (wine id, rating 1–5, quiz answer, ritual step reached) at the moment a guest rates a wine or answers the quiz — so it survives even if they close the tab before finishing.
- Add a `tasting_complete` write with favourite wine + personality label at the end.

New table `tasting_events` with RLS (admin-read only, anon-insert for the guest journey). Grants + policies included in the migration.

### 2b. Replace the mock Admin Dashboard with a real one
At `/admin` (behind the existing admin gate), show live numbers pulled from the DB:
- Total guests today / this week / all-time (from `consent_logs`)
- Completion rate (started vs. `tasting_complete`)
- Average rating per wine + most-liked wine
- Vivino click count per wine
- Flight popularity (A / B / C picks)
- A "Guest log" table: name, email, phone, flight, date — with CSV export
- A "Responses" table: guest → wine → rating → quiz answer — with CSV export

Google Sheets logging stays on as a secondary/backup sink; nothing about the guest UI changes.

## Technical notes

- New migration: `create table public.tasting_events` (id, session_id, guest_name, guest_email, wine_id, flight_id, event_type, rating, quiz_answer jsonb, metadata jsonb, created_at) + `GRANT INSERT TO anon`, `GRANT SELECT TO authenticated`, RLS with `has_role(auth.uid(),'admin')` for reads.
- Client writes go through a thin `logTastingEvent()` helper (mirrors `logToSheets`), fire-and-forget so it never blocks the UI.
- Admin Dashboard becomes a real component with aggregate queries; keeps the current visual style.
- Data wipe done via a single `TRUNCATE`-equivalent DELETE, run once through the insert tool after you approve.

## Not changing

- Wine bottle presentation, tasting flow, journey cards, typography, colours, animations.
- Google Sheets webhook and edge function.
- Auth, RLS on existing tables, wines/flights content.

## Confirm before I build

1. OK to permanently delete the 84 consent rows + 722 analytics rows? (There is no undo.)
2. Do you want me to also add Vivino-click tracking, or leave that out?
3. Should the admin dashboard require login as an admin user (current behaviour on other admin routes), or is the current open `/admin` route intentional?
