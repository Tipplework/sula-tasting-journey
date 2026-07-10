# Sula Multi-Flight Tasting + DPDP Compliance

## Scope
Extend the existing Sula Tasting Journey with (1) a 4-flight selection experience with 16 wines total, (2) DPDP-aligned consent + privacy infrastructure, and (3) admin surfaces to manage both. Preserve all locked functionality (branding, CMS, SEO, SSR, routing, auth, sharing, analytics, tasting engine, admin, mobile).

## Homepage (WelcomePage)
- Headline → "Choose Your Wine Flight"; sub-copy "Four journeys. Sixteen exceptional pours. Choose the experience that speaks to you."
- Replace Rajeev Samant image + name with **Sula Sun** as the guide (new asset, same guide-card layout, copy unchanged otherwise).
- Insert **Flight Selection Grid** (4 cards) between guide card and guest name:
  Crisp & Classic (Whites), Bold & Beautiful (Reds), Sula Signature (Best of Sula), Bubbles & Bliss (Sparkling). Each card: name, subtitle, description, "4 Wines", subtle wine glyph, hover + selected states in existing palette.
- Guest name input unchanged in style.
- **New**: DPDP consent checkbox with link opening Privacy Notice modal.
- "Begin My Tasting" disabled until flight + name + consent. Sub-label: "4 wines • curated journey" (removes "5 wines").

## Wine Catalogue (shared records, flight assignments)
- New `src/data/wines-catalog.ts` with 16 wine records + `flights` map (A/B/C/D). Wines that appear in multiple flights (Dindori Chardonnay, The Source Moscato) are single records referenced by both flights — no duplication.
- Bottle images: use uploaded transparent PNGs (uploaded via Lovable Assets) plus existing URLs where already correct. Never cropped/distorted (object-contain, generous padding).
- Fields per wine: id, slug, name, subtitle, description, tastingNotes[], awards[{medal, competition}], type, image, active, sortOrder.

## Tasting Flow
- Selected flight persisted in tasting store (localStorage) alongside guest name + consent record.
- `TastingPage` loads the 4 wines from the selected flight only. Progress "Wine N of 4". Allow returning to homepage to change flights (progress preserved per-flight).
- `WineCard` layout: large bottle hero, name, flight chip, award badge, description, notes chips, Prev/Next, progress. Whitespace generous; presentation-only edits.
- `FlightOverview` + `ResultsPage` updated for 4 wines and flight context.

## DPDP Compliance
- **Consent checkbox** on homepage; Begin disabled until accepted.
- **Privacy Notice modal** (`PrivacyNoticeModal`) with sections: About this tasting, Information collected, Purpose, Storage, Retention, Guest Rights, Contact, Future integrations. Content served from CMS (`site_settings` or new `privacy_notice` row) with sensible defaults; version string tracked.
- **Consent logging** table `consent_logs`: guest_name, flight_id, consent_ts, consent_version, privacy_version, browser_lang, device_type, session_id, user_agent, hashed_ip (edge fn hashes), source. RLS: insert by anon, select admin-only. Insert via a server function `logConsent` (edge-safe) that hashes IP server-side.
- **Cookie banner** (`CookieBanner`) shown first visit only (localStorage flag): Accept / Reject Optional / Manage Preferences with categories Essential (locked on), Analytics (default off), Marketing (default off). Analytics gate applied to existing analytics calls.
- **Data minimisation**: only name + flight + consent required; no PII in URLs, no name in analytics payloads (already the case — verify).
- **Guest rights**: Privacy Notice includes contact + "Request access/deletion" mailto link; admin can process via consent search UI.

## Admin — Privacy & Compliance
- New route `/content-center/privacy` with tabs:
  - Privacy Notice Editor (rich text per section, version bump)
  - Consent Versioning (list versions + activate)
  - Retention Policy (numeric days field)
  - Privacy Contacts (email, phone)
  - Consent Search (by name/date/flight) + CSV Export
  - Audit Log (consent + deletion actions)
  - Deletion Requests (list, mark processed)
- Link in Content Center header.

## Admin — Wine & Flight CMS
- New route `/content-center/wines` — list all 16 wines: edit description, image URL, award, notes, sort order, active toggle.
- New route `/content-center/flights` — 4 flight rows: intro copy, active toggle, wine order within flight.
- Wines/flights tables (new): `wines`, `flights`, `flight_wines` (join, sort_order). RLS: public read active, admin write.

## Database (migrations)
- `wines` (id uuid, slug text unique, name, subtitle, description, image_url, type, notes jsonb, awards jsonb, active bool, created_at)
- `flights` (id uuid, code text unique [A/B/C/D], name, subtitle, description, intro text, active bool, sort_order)
- `flight_wines` (flight_id, wine_id, position) — enables shared wines
- `consent_logs` (as above)
- `privacy_notice_versions` (id, version, sections jsonb, active, created_at)
- `deletion_requests` (id, guest_name, contact, requested_at, status, notes)
- All with GRANTs + RLS scoped to authenticated admin (via `has_role`) except public read on wines/flights/active privacy notice, and anon insert on consent_logs.
- Seed wines + flight_wines from the catalogue in the migration.

## Future-ready hooks
- Consent log includes `source` + free-form `metadata` jsonb so HOST CRM / Sula CRM / WhatsApp / loyalty integrations can attach without schema change.
- Server function `logConsent` is the single write path — future webhooks call from here.

## Assets
Upload the 9 provided bottle PNGs via `lovable-assets` into `src/assets/bottles/`. Placeholder-safe fallbacks for the 7 bottles the user will send in the next prompt (uses name + existing URL where possible; catalogue notes "awaiting image").

## Files (planned)
**Modified**: `src/pages/WelcomePage.tsx`, `src/pages/TastingPage.tsx`, `src/pages/FlightOverview.tsx`, `src/pages/ResultsPage.tsx`, `src/components/WineCard.tsx`, `src/components/SommelierQuote.tsx` (rename usage → SulaSunGuide), `src/store/tasting-store.ts`, `src/App.tsx`, `src/pages/admin/ContentCenter.tsx`, `src/lib/content/analytics.ts` (gate on marketing/analytics consent), `src/data/wines.ts` (kept as re-export for back-compat).
**Created**: `src/data/wines-catalog.ts`, `src/data/flights.ts`, `src/components/FlightSelector.tsx`, `src/components/FlightCard.tsx`, `src/components/PrivacyNoticeModal.tsx`, `src/components/CookieBanner.tsx`, `src/components/SulaSunGuide.tsx`, `src/lib/consent/api.ts`, `src/lib/consent/log.ts`, `src/pages/admin/PrivacyCenter.tsx`, `src/pages/admin/WineCatalog.tsx`, `src/pages/admin/FlightsEditor.tsx`, `supabase/migrations/<ts>_wines_flights_dpdp.sql`, 9 bottle asset pointers under `src/assets/bottles/`.

## Locked / untouched
Auth, SEO, SSR meta, `api/c.ts`, `/c/:slug` viewer, ContentCenter/ContentEditor for library items, homepage OG, mobile PDF viewer, share links, existing analytics events (only gated behind consent).

## Validation
Manual walk-through: pick each of 4 flights → complete tasting → results; consent required to start; privacy modal opens; cookie banner appears once; admin can edit wine + privacy; migration passes; no PII in URLs/analytics.

## Deferred to next prompt
7 remaining bottle images (Sula Brut, Tropicale Rosé, Sparkling Shiraz, The Source Cabernet Sauvignon, plus any additional). Catalogue leaves these with current URLs (from existing `wines.ts`) and admin can swap.
