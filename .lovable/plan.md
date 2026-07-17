
# Cluster duplicate guests in the Guest Log

Right now every consent record becomes its own row, so Amrit (same email + phone) shows up 4 separate times because he opened the app on Flight A, then B, then C, then C again. The drawer becomes noisy and the "Guests" tile inflates.

## What changes

**Group by identity, not by row.** Identity key = normalized email → else normalized phone → else name+device. All consent records sharing that key collapse into one guest card in the drawer, and the "Guests" tile counts unique guests (with the raw row count as a subtitle).

## Guest card (grouped)

```text
┌───────────────────────────────────────────────────┐
│ Amrit                          7/17/26, 2:11 PM   │
│ amrutpalsingh.sandhu@sulawines.com · 7722062357   │
│ 4 visits · Flights A, B, C  · mobile              │
│ [ Journey ▾ ]                        [🗑 delete]  │
└───────────────────────────────────────────────────┘
```

- Header row shows name + the **latest** visit time.
- Meta row shows email + phone (canonical).
- Third row shows: `N visits · Flights X, Y · device(s)`.
- **Journey** is a dropdown listing each individual visit (time + flight), each opening the existing per-session drawer. If there's only one visit, it acts as a single button.
- **Delete** cascades: removes all consent rows for that identity and their tasting_events (email OR phone match), with a confirm "Delete Amrit and all 4 visits?".
- Expanding the card (tap header) reveals the full visit list inline as an alternative to the dropdown.

## Search & counters
- Search matches against any visit under the identity (name/email/phone/flight from any row).
- Tile "Guests" → **unique guests** number; subtitle: `X visits total`.
- Drawer title → `Guest log · N guests (M visits)`.
- Sort: most-recent visit first.

## CSV export
- Adds a `visits` column and a `flights` (comma-joined) column, one row per unique guest. A second link "CSV (raw visits)" keeps the current one-row-per-consent export for anyone who wants the full log.

## Data / storage
- Pure client-side grouping over the already-fetched `consent_logs` rows — no schema change, no new query.
- Normalization: `email.trim().toLowerCase()`, phone reduced to digits only.

## Files touched
- `src/pages/AdminDashboard.tsx` — group logic in the guests drawer, update the Guests tile value/subtitle, update the guest card markup, add the CSV variants.

## Out of scope
- No change to how consent rows are written (each new visit still creates a row — that's needed to track return visits).
- No change to session/wine drawers.
